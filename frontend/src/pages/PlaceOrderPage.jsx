// PlaceOrderPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone Place Order Page — updated for Step 12/14.5
//
// PURPOSE:
//   Final checkout review screen. The buyer sees a full summary of their order
//   before confirming. When they click "Place Order", the order is sent to the
//   backend which calculates all prices server-side.
//
// WHAT CHANGED FROM ORIGINAL:
//   • Shipping price is now looked up from the county rate table (frontend copy
//     of shippingRates.js) so the displayed price matches what the backend will
//     charge. The original just used a flat $10 placeholder.
//   • Tier 2 detection — if the cart has Hardware, Agriculture, or Fabric items,
//     a "Delivery Quote Required" notice replaces the shipping price line.
//   • Order summary now shows delivery zone and estimated delivery days.
//   • VAT label updated from "Tax" to "VAT (16%)" to match Kenyan standards.
//   • All prices shown in KES format (the $ symbol was a placeholder).
//   • placeOrderHandler sends the correct payload shape expected by the new
//     orderController — includes category and unit on each order item.
//   • Success toast and error toast unchanged in behaviour.
//
// STRUCTURE:
//   Left column  — order items list + shipping + payment summary
//   Right column — price breakdown + place order button + notices
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { clearCartItems } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import {
  FaShoppingBag,
  FaTruck,
  FaCreditCard,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaArrowLeft,
} from 'react-icons/fa';
import './PlaceOrderPage.css';

// ── Shipping zone lookup (mirrors backend/data/shippingRates.js) ──────────
// Duplicated here so the UI can show the correct rate without an API call.
// If you update rates in shippingRates.js, update this array too.
const SHIPPING_ZONES_FRONTEND = [
  { zone: 'Nairobi', rate: 300, estimatedDays: '1–2 days', counties: ['Nairobi'] },
  { zone: 'Central Kenya', rate: 500, estimatedDays: '2–3 days', counties: ['Kiambu', 'Machakos', 'Kajiado', "Murang'a", 'Kirinyaga'] },
  { zone: 'Rift Valley', rate: 700, estimatedDays: '2–4 days', counties: ['Nakuru', 'Naivasha', 'Kericho', 'Bomet', 'Laikipia'] },
  { zone: 'Nyanza & Western', rate: 900, estimatedDays: '3–5 days', counties: ['Kisumu', 'Kakamega', 'Siaya', 'Homa Bay', 'Migori', 'Nyamira', 'Vihiga', 'Busia'] },
  { zone: 'North Rift', rate: 900, estimatedDays: '3–5 days', counties: ['Uasin Gishu', 'Trans Nzoia', 'Baringo', 'Elgeyo-Marakwet', 'Nandi', 'Samburu', 'West Pokot'] },
  { zone: 'Eastern', rate: 800, estimatedDays: '2–4 days', counties: ['Kitui', 'Makueni', 'Embu', 'Tharaka-Nithi', 'Meru'] },
  { zone: 'Coast', rate: 1000, estimatedDays: '3–5 days', counties: ['Mombasa', 'Kilifi', 'Kwale', 'Taita Taveta', 'Lamu', 'Tana River'] },
  { zone: 'North Eastern', rate: 1500, estimatedDays: '5–7 days', counties: ['Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Turkana'] },
  { zone: 'Rest of Kenya', rate: 800, estimatedDays: '3–5 days', counties: [] },
];

// Tier 2 categories — must match backend/data/shippingRates.js exactly
const TIER_2_CATEGORIES = ['Hardware & Tools', 'Agriculture & Garden', 'Fabric & Textiles'];

// ── Helper: get zone data for a county string ─────────────────────────────
const getZoneForCounty = (county) => {
  if (!county) return SHIPPING_ZONES_FRONTEND.find((z) => z.zone === 'Rest of Kenya');
  const lower = county.toLowerCase().trim();
  for (const zone of SHIPPING_ZONES_FRONTEND) {
    if (zone.counties.some((c) => c.toLowerCase() === lower)) return zone;
  }
  return SHIPPING_ZONES_FRONTEND.find((z) => z.zone === 'Rest of Kenya');
};

// ── Helper: format KES currency ───────────────────────────────────────────
const formatKES = (amount) =>
  `KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

// ─────────────────────────────────────────────────────────────────────────
// PlaceOrderPage component
// ─────────────────────────────────────────────────────────────────────────
const PlaceOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Redux state ─────────────────────────────────────────────────────────
  const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // ── Loading / error state for the place order API call ──────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Redirect guards ─────────────────────────────────────────────────────
  // If the buyer skipped a step, send them back
  useEffect(() => {
    if (!shippingAddress?.county) navigate('/shipping');
    if (!paymentMethod) navigate('/payment');
  }, [shippingAddress, paymentMethod, navigate]);

  // ── Delivery zone lookup ─────────────────────────────────────────────────
  const deliveryZone = getZoneForCounty(shippingAddress?.county);

  // ── Tier 2 detection ────────────────────────────────────────────────────
  const hasTier2Items = cartItems.some((item) => TIER_2_CATEGORIES.includes(item.category));
  const isFullyTier2 = cartItems.every((item) => TIER_2_CATEGORIES.includes(item.category));

  // ── Price calculations ───────────────────────────────────────────────────
  // These mirror what the backend will calculate. Backend is authoritative —
  // these are for display only. The backend re-verifies everything server-side.

  // Items subtotal — use salePrice if item is on sale
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + (item.salePrice && item.isOnSale ? item.salePrice : item.price) * item.qty,
    0
  );

  // Shipping price:
  //   • Fully Tier 2 → 0 (quote will be sent by admin after order placed)
  //   • Mixed cart with Tier 2 items → flat rate + surcharge (backend adds surcharge)
  //   • Standard → flat county rate
  const shippingPrice = isFullyTier2
    ? 0
    : hasTier2Items
      ? deliveryZone.rate + 500   // surcharge estimate — backend calculates exact
      : deliveryZone.rate;

  // VAT at 16%
  const vatPrice = itemsPrice * 0.16;

  // Grand total
  const totalPrice = isFullyTier2
    ? itemsPrice + vatPrice          // shipping TBD — not included until quote approved
    : itemsPrice + shippingPrice + vatPrice;

  // ── Place order handler ──────────────────────────────────────────────────
  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build the order payload for the backend.
      // We send category and unit on each item so the backend can:
      //   1. Detect Tier 2 categories automatically
      //   2. Store the unit (e.g. "per dozen") on the order record
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          category: item.category,   // needed for Tier 2 detection server-side
          unit: item.unit || '',
        })),
        shippingAddress,
        paymentMethod,
        // We send these for reference — backend recalculates and overrides
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: Number(shippingPrice.toFixed(2)),
        taxPrice: Number(vatPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/orders', orderPayload, config);

      // Clear the cart — order has been placed successfully
      dispatch(clearCartItems());

      // Show success toast
      showToast(
        isFullyTier2
          ? 'Order placed! Our team will contact you within 24 hours with a delivery quote.'
          : 'Order placed successfully!',
        'success'
      );

      // Navigate to the order confirmation page
      navigate(`/order/${data._id}`);

    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to place order';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='place-order-page'>

      {/* ── Progress indicator ─────────────────────────────────────────── */}
      <div className='place-order-progress'>
        <span className='place-order-progress__step place-order-progress__step--done'>Cart</span>
        <span className='place-order-progress__divider' aria-hidden='true' />
        <span className='place-order-progress__step place-order-progress__step--done'>Shipping</span>
        <span className='place-order-progress__divider' aria-hidden='true' />
        <span className='place-order-progress__step place-order-progress__step--done'>Payment</span>
        <span className='place-order-progress__divider' aria-hidden='true' />
        <span className='place-order-progress__step place-order-progress__step--active'>Place Order</span>
      </div>

      {/* ── Back link ─────────────────────────────────────────────────── */}
      <div className='place-order-page__back'>
        <button
          className='place-order-back-btn'
          onClick={() => navigate('/payment')}
          aria-label='Back to payment'
        >
          <FaArrowLeft aria-hidden='true' /> Back
        </button>
      </div>

      <div className='place-order-page__inner'>

        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN — order details
           ══════════════════════════════════════════════════════════════ */}
        <div className='place-order-left'>

          {/* ── Order items ─────────────────────────────────────────── */}
          <div className='place-order-section'>
            <div className='place-order-section__header'>
              <FaShoppingBag className='place-order-section__icon' aria-hidden='true' />
              <h2 className='place-order-section__title'>Order Items</h2>
            </div>

            {cartItems.length === 0 ? (
              <p className='place-order-empty'>Your cart is empty.</p>
            ) : (
              <ul className='place-order-items'>
                {cartItems.map((item) => {
                  // Use salePrice if item is on sale
                  const unitPrice = item.isOnSale && item.salePrice
                    ? item.salePrice
                    : item.price;

                  return (
                    <li key={item._id} className='place-order-item'>

                      {/* Product image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className='place-order-item__img'
                      />

                      {/* Product name + category */}
                      <div className='place-order-item__info'>
                        <Link
                          to={`/product/${item._id}`}
                          className='place-order-item__name'
                        >
                          {item.name}
                        </Link>
                        <span className='place-order-item__category'>
                          {item.category}
                          {/* Flag Tier 2 items inline */}
                          {TIER_2_CATEGORIES.includes(item.category) && (
                            <span className='place-order-item__tier2-badge'>
                              Bulk / Heavy
                            </span>
                          )}
                        </span>
                        {item.unit && (
                          <span className='place-order-item__unit'>
                            Unit: {item.unit}
                          </span>
                        )}
                      </div>

                      {/* Qty × price = line total */}
                      <div className='place-order-item__price'>
                        {item.qty} × {formatKES(unitPrice)}
                        <strong>{formatKES(item.qty * unitPrice)}</strong>
                      </div>

                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Shipping address ────────────────────────────────────── */}
          <div className='place-order-section'>
            <div className='place-order-section__header'>
              <FaTruck className='place-order-section__icon' aria-hidden='true' />
              <h2 className='place-order-section__title'>Delivery Address</h2>
            </div>

            <div className='place-order-detail-grid'>
              <div className='place-order-detail'>
                <span className='place-order-detail__label'>Address</span>
                <span className='place-order-detail__value'>
                  {shippingAddress?.address}
                </span>
              </div>
              <div className='place-order-detail'>
                <span className='place-order-detail__label'>Town / City</span>
                <span className='place-order-detail__value'>
                  {shippingAddress?.city}
                </span>
              </div>
              <div className='place-order-detail'>
                <span className='place-order-detail__label'>County</span>
                <span className='place-order-detail__value'>
                  {shippingAddress?.county}
                </span>
              </div>
              <div className='place-order-detail'>
                <span className='place-order-detail__label'>Delivery Zone</span>
                <span className='place-order-detail__value place-order-detail__value--accent'>
                  {deliveryZone?.zone} — {deliveryZone?.estimatedDays}
                </span>
              </div>
            </div>

            {/* Tier 2 delivery notice on the shipping section */}
            {isFullyTier2 && (
              <div className='place-order-tier2-notice'>
                <FaExclamationTriangle
                  className='place-order-tier2-notice__icon'
                  aria-hidden='true'
                />
                <div>
                  <strong>Delivery Quote Required</strong>
                  <p>
                    Your order contains bulk or heavy goods. Our team will contact
                    you within 24 hours with a confirmed delivery quote. You will
                    approve the quote before any payment is processed.
                  </p>
                </div>
              </div>
            )}

            {/* Mixed cart notice */}
            {hasTier2Items && !isFullyTier2 && (
              <div className='place-order-mixed-notice'>
                <FaInfoCircle aria-hidden='true' />
                <span>
                  Your cart includes bulk or heavy goods — a delivery surcharge
                  has been applied. Our team may contact you regarding logistics.
                </span>
              </div>
            )}
          </div>

          {/* ── Payment method ──────────────────────────────────────── */}
          <div className='place-order-section'>
            <div className='place-order-section__header'>
              <FaCreditCard className='place-order-section__icon' aria-hidden='true' />
              <h2 className='place-order-section__title'>Payment Method</h2>
            </div>
            <div className='place-order-payment-method'>
              <FaCheckCircle className='place-order-payment-method__icon' aria-hidden='true' />
              <span>{paymentMethod}</span>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN — price summary + place order button
           ══════════════════════════════════════════════════════════════ */}
        <div className='place-order-right'>
          <div className='place-order-summary'>
            <h2 className='place-order-summary__title'>Order Summary</h2>

            {/* Line items */}
            <div className='place-order-summary__lines'>

              <div className='place-order-summary__line'>
                <span>Items ({cartItems.reduce((a, i) => a + i.qty, 0)})</span>
                <span>{formatKES(itemsPrice)}</span>
              </div>

              <div className='place-order-summary__line'>
                <span>
                  Delivery
                  {deliveryZone && !isFullyTier2 && (
                    <span className='place-order-summary__zone'>
                      {' '}({deliveryZone.zone})
                    </span>
                  )}
                </span>
                {isFullyTier2 ? (
                  <span className='place-order-summary__quote-label'>
                    Quote pending
                  </span>
                ) : (
                  <span>{formatKES(shippingPrice)}</span>
                )}
              </div>

              <div className='place-order-summary__line'>
                <span>VAT (16%)</span>
                <span>{formatKES(vatPrice)}</span>
              </div>

              {/* Divider before total */}
              <div className='place-order-summary__divider' aria-hidden='true' />

              <div className='place-order-summary__line place-order-summary__line--total'>
                <span>
                  Total
                  {isFullyTier2 && (
                    <span className='place-order-summary__excl-note'>
                      {' '}(excl. delivery)
                    </span>
                  )}
                </span>
                <strong>{formatKES(totalPrice)}</strong>
              </div>

            </div>

            {/* Error message */}
            {error && (
              <div className='place-order-error' role='alert'>
                <FaExclamationTriangle aria-hidden='true' />
                <span>{error}</span>
              </div>
            )}

            {/* Place order button */}
            <button
              className='place-order-btn'
              onClick={placeOrderHandler}
              disabled={loading || cartItems.length === 0}
              aria-busy={loading}
            >
              {loading ? (
                <span className='place-order-btn__loading'>
                  <span className='place-order-btn__spinner' aria-hidden='true' />
                  Placing Order…
                </span>
              ) : (
                'Place Order'
              )}
            </button>

            {/* Reassurance note */}
            <p className='place-order-summary__note'>
              By placing your order you agree to ShopZone's terms. All transactions
              are processed securely through ShopZone — no direct supplier contact.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlaceOrderPage;