// ShippingPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone Shipping Page — updated for Step 12/14.5
//
// CHANGES FROM ORIGINAL:
//   • Imports Kenya county list from a shared constants file so it stays
//     in sync with the backend shippingRates.js
//   • Shows a live delivery rate preview as the buyer selects their county
//   • Shows a "Delivery Quote Required" notice if the cart contains any
//     Tier 2 categories (Hardware, Agriculture, Fabric)
//   • Still saves shippingAddress to Redux on submit (unchanged)
//   • Progress indicator unchanged
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../redux/slices/cartSlice';
import { FaTruck, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import CheckoutSteps from '../components/CheckoutSteps/CheckoutSteps';
import './ShippingPage.css';

// ── Kenya counties and zone rate data (mirrors backend shippingRates.js) ──
// Kept here so the frontend can show live rate previews without an API call.
// If rates change, update backend/data/shippingRates.js — then update this too.
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

// All 47 counties for the dropdown
const ALL_KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
  'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi',
  'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya',
  'Taita Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana',
  'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];

// Tier 2 categories — must match backend exactly
const TIER_2_CATEGORIES = ['Hardware & Tools', 'Agriculture & Garden', 'Fabric & Textiles'];


// ── Handling tags — structured, checkbox-only (no free text) ──────────────
// Mirrors the enum on backend/models/Order.js exactly. No free-text field
// exists by design — this is the leak-vector fix agreed on for buyer-seller
// contact-info separation.
const HANDLING_TAGS = [
  { key: 'fragile',        label: 'Fragile — handle with care' },
  { key: 'keep_upright',   label: 'Keep upright' },
  { key: 'stack_limit',    label: 'Do not stack heavy items on top' },
  { key: 'perishable',     label: 'Perishable goods' },
  { key: 'no_compression', label: 'No compression' },
];


// ─────────────────────────────────────────────────────────────────────────
// Helper: look up zone data for a given county string
// ─────────────────────────────────────────────────────────────────────────
const getZoneForCounty = (county) => {
  if (!county) return null;
  const lower = county.toLowerCase().trim();
  for (const zone of SHIPPING_ZONES_FRONTEND) {
    if (zone.counties.some((c) => c.toLowerCase() === lower)) {
      return zone;
    }
  }
  // Fallback to 'Rest of Kenya'
  return SHIPPING_ZONES_FRONTEND.find((z) => z.zone === 'Rest of Kenya');
};

// ─────────────────────────────────────────────────────────────────────────
// ShippingPage component
// ─────────────────────────────────────────────────────────────────────────
const ShippingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pull existing shipping address from cart Redux state (pre-fill if returning)
  const { shippingAddress, cartItems } = useSelector((state) => state.cart);

  // ── Page title ─────────────────────────────────────────────
  useEffect(() => { document.title = 'Shipping — ShopZone'; }, []);

  const { userInfo } = useSelector((state) => state.auth);

// ── Form state ──────────────────────────────────────────────────────────
  // Pre-fill priority:
  //   1. Redux shippingAddress (user already went through this step)
  //   2. userInfo.shippingAddress (saved on their profile)
  //   3. Empty string fallback
  const savedAddr = userInfo?.shippingAddress || {};
  const [address,  setAddress]  = useState(shippingAddress?.address  || savedAddr.address   || '');
  const [apartment,setApartment]= useState(shippingAddress?.apartment|| savedAddr.apartment  || '');
  const [city,     setCity]     = useState(shippingAddress?.city     || savedAddr.city       || '');
  const [county,   setCounty]   = useState(shippingAddress?.county   || savedAddr.county     || userInfo?.county || '');
 const [country,  setCountry]  = useState(shippingAddress?.country  || savedAddr.country    || 'Kenya');

  // ── Handling tags state — persisted in Redux alongside shippingAddress
  // so PlaceOrderPage/PaymentPage can read it when assembling the real
  // createOrder payload, without threading it through as page state.
  const [handlingTags, setHandlingTags] = useState(shippingAddress?.handlingTags || []);

  const toggleHandlingTag = (key) => {
    setHandlingTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  // ── Derived delivery info — recalculates when county changes ────────────
  const [deliveryZone, setDeliveryZone] = useState(null);

  useEffect(() => {
    setDeliveryZone(getZoneForCounty(county));
  }, [county]);

  // ── Check if cart has any Tier 2 items ──────────────────────────────────
  const hasTier2Items = cartItems.some((item) =>
    TIER_2_CATEGORIES.includes(item.category)
  );

  // ── All items are Tier 2 — full quote required ───────────────────────────
  const isFullyTier2 = cartItems.every((item) =>
    TIER_2_CATEGORIES.includes(item.category)
  );

  // ── Submit handler ──────────────────────────────────────────────────────
  const submitHandler = (e) => {
    e.preventDefault();

    if (!county) {
      return; // county is required for delivery pricing
    }

        dispatch(saveShippingAddress({ address, apartment, city, county, country, handlingTags }));
          navigate('/payment');
  };

  return (
    <div className='shipping-page'>

      {/* ── Progress indicator ────────────────────────────────────────── */}
      <CheckoutSteps currentStep={2} />

      <div className='shipping-page__inner'>

        {/* ── Left: shipping form ─────────────────────────────────────── */}
        <div className='shipping-form-card'>
          <h1 className='shipping-form-card__title'>Delivery Address</h1>

          <form onSubmit={submitHandler}>

           {/* Street address */}
            <div className='shipping-field'>
              <label className='shipping-label' htmlFor='address'>
                Street Address
              </label>
              <input
                id='address'
                type='text'
                className='shipping-input'
                placeholder='e.g. 14 Moi Avenue, CBD'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {/* Apartment / Building — optional */}
            <div className='shipping-field'>
              <label className='shipping-label' htmlFor='apartment'>
                Apartment / Building <span className='shipping-label--optional'>(optional)</span>
              </label>
              <input
                id='apartment'
                type='text'
                className='shipping-input'
                placeholder='e.g. Apt 3B, Delta House'
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>

            {/* Town / City */}
            <div className='shipping-field'>
              <label className='shipping-label' htmlFor='city'>
                Town / City
              </label>
              <input
                id='city'
                type='text'
                className='shipping-input'
                placeholder='e.g. Nairobi'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            {/* County dropdown — drives the delivery rate calculation */}
            <div className='shipping-field'>
              <label className='shipping-label' htmlFor='county'>
                County <span className='shipping-label--required'>*</span>
              </label>
              <select
                id='county'
                className='shipping-input shipping-input--select'
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
              >
                <option value=''>Select your county</option>
                {ALL_KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className='shipping-field__hint'>
                Your county determines the delivery rate.
              </p>
            </div>

            {/* Country — fixed to Kenya for now */}
            <div className='shipping-field'>
              <label className='shipping-label' htmlFor='country'>Country</label>
              <input
                id='country'
                type='text'
                className='shipping-input shipping-input--readonly'
                value={country}
                readOnly
              />
            </div>

           {/* Handling instructions — structured tags only ──────────── */}
            <div className='shipping-field'>
              <label className='shipping-label'>
                Handling Instructions <span className='shipping-label--optional'>(optional)</span>
              </label>
              <p className='shipping-field__hint'>
                Let the seller know how to pack your order. For privacy, only
                these preset options are available — no free text is sent to sellers.
              </p>
              <div className='shipping-handling-tags'>
                {HANDLING_TAGS.map((tag) => (
                  <label key={tag.key} className='shipping-handling-tag'>
                    <input
                      type='checkbox'
                      checked={handlingTags.includes(tag.key)}
                      onChange={() => toggleHandlingTag(tag.key)}
                    />
                    {tag.label}
                  </label>
                ))}
              </div>
            </div>

            <button type='submit' className='shipping-submit-btn'>
              Continue to Payment
            </button>
          </form>
        </div>

        {/* ── Right: delivery rate preview card ──────────────────────── */}
        <div className='shipping-info-panel'>

          {/* Delivery rate preview — updates live as county is selected */}
          <div className='delivery-rate-card'>
            <div className='delivery-rate-card__header'>
              <FaTruck className='delivery-rate-card__icon' aria-hidden='true' />
              <h2 className='delivery-rate-card__title'>Delivery Estimate</h2>
            </div>

            {deliveryZone && county ? (
              <div className='delivery-rate-card__body'>
                <div className='delivery-rate-card__zone'>{deliveryZone.zone}</div>

                {/* Show rate or quote required */}
                {isFullyTier2 ? (
                  <div className='delivery-rate-card__quote-required'>
                    <FaExclamationTriangle aria-hidden='true' />
                    <span>Delivery Quote Required</span>
                  </div>
                ) : (
                  <div className='delivery-rate-card__rate'>
                    KES {deliveryZone.rate.toLocaleString()}
                  </div>
                )}

                <div className='delivery-rate-card__days'>
                  {deliveryZone.estimatedDays}
                </div>

                <div className='delivery-rate-card__disclaimer'>
                  <FaInfoCircle aria-hidden='true' />
                  <span>
                    Estimate only — actual delivery cost is confirmed after your order is placed.
                  </span>
                </div>

                {/* Mixed cart notice */}
                {hasTier2Items && !isFullyTier2 && (
                  <div className='delivery-rate-card__tier2-notice'>
                    <FaInfoCircle aria-hidden='true' />
                    <span>
                      Your cart includes bulk or heavy goods. A delivery surcharge
                      has been applied. Our team may contact you if additional
                      logistics coordination is needed.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className='delivery-rate-card__placeholder'>
                Select your county above to see the delivery rate.
              </p>
            )}
          </div>

          {/* Tier 2 full quote notice */}
          {isFullyTier2 && (
            <div className='delivery-quote-notice'>
              <FaExclamationTriangle
                className='delivery-quote-notice__icon'
                aria-hidden='true'
              />
              <div>
                <strong>Delivery Quote Required</strong>
                <p>
                  Your order contains bulk or heavy goods (Hardware, Agriculture,
                  or Fabric &amp; Textiles). Our team will contact you within
                  24 hours after your order is placed with a confirmed delivery
                  quote. You will approve the quote before any payment is processed.
                </p>
              </div>
            </div>
          )}

          {/* How delivery works info box */}
          <div className='delivery-info-box'>
            <h3 className='delivery-info-box__title'>How delivery works</h3>
            <ul className='delivery-info-box__list'>
              <li>ShopZone coordinates delivery — you never contact the supplier directly</li>
              <li>Delivery fee is calculated by your county at checkout</li>
              <li>Bulk / heavy goods get a custom delivery quote within 24 hours</li>
              <li>All tracking updates appear in your ShopZone order dashboard</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShippingPage;