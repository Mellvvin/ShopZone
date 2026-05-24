// OrderPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone Order Page — updated for Step 12/14.5
//
// PURPOSE:
//   Shown after an order is placed. Buyer can track their order status,
//   manage the Tier 2 delivery quote flow, and cancel unpaid orders.
//
// WHAT CHANGED FROM ORIGINAL:
//   • Tier 2 delivery quote flow — if the order is quote_required, the buyer
//     sees the quote status. When admin sends a quote (status = 'sent'), the
//     buyer sees the amount with Approve and Reject buttons.
//   • Order status uses the new enum: pending → processing → dispatched →
//     delivered → cancelled. A visual status timeline shows progress.
//   • Seller payout released indicator shown after delivery.
//   • shippingZone and estimatedDays displayed on the delivery section.
//   • All prices shown in KES format.
//   • Cancel modal unchanged in structure, now also shows stock-restore message.
//   • Admin: mark as delivered button still present and unchanged.
//
// STRUCTURE:
//   Left column  — order items, delivery address, payment method
//   Right column — order status timeline, price summary, action buttons
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import {
  FaShoppingBag,
  FaTruck,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBoxOpen,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaChevronRight,
} from 'react-icons/fa';
import './OrderPage.css';

// ── Helper: format KES currency ───────────────────────────────────────────
const formatKES = (amount) =>
  `KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

// ── Order status steps for the timeline ───────────────────────────────────
// Maps each status value to a display label and icon.
const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: FaClock },
  { key: 'processing', label: 'Processing', icon: FaBoxOpen },
  { key: 'dispatched', label: 'Dispatched', icon: FaTruck },
  { key: 'delivered', label: 'Delivered', icon: FaCheckCircle },
];

// ─────────────────────────────────────────────────────────────────────────────
// SellerQuoteForm — structured quote submission form
// Only rendered for admin/sellers on Tier 2 orders.
// No free text fields — all inputs are dropdowns or number fields.
// Prevents off-platform contact by design.
// ─────────────────────────────────────────────────────────────────────────────
const COURIERS = ['Fargo Courier', 'Sendy', 'G4S Courier', 'Wells Fargo Kenya', 'Matatu Network', 'Boda Boda', 'Own Delivery Vehicle', 'Other'];
const DELIVERY_DAYS = ['1-2 days', '2-3 days', '3-5 days', '5-7 days'];

const SellerQuoteForm = ({ orderId, shippingZone, config, onSubmitted }) => {
  const [amount, setAmount] = useState('');
  const [courier, setCourier] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !courier || !estimatedDays) {
      showToast('All three fields are required.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await axios.put(
        `/api/orders/${orderId}/seller-quote/submit`,
        { amount: Number(amount), courier, estimatedDays },
        config
      );
      showToast('Delivery quote submitted successfully.', 'success');
      onSubmitted();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit quote', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='seller-quote-form'>
      <h4 className='seller-quote-form__title'>
        <FaTruck aria-hidden='true' /> Submit Delivery Quote
      </h4>
      <p className='seller-quote-form__zone'>
        Delivery zone: <strong>{shippingZone || 'Unknown'}</strong>
      </p>

      <form onSubmit={handleSubmit}>

        {/* Amount — number only, no free text */}
        <div className='seller-quote-form__field'>
          <label className='seller-quote-form__label'>
            Delivery Amount (KES) <span style={{ color: '#c0392b' }}>*</span>
          </label>
          <input
            type='number'
            className='seller-quote-form__input'
            placeholder='e.g. 1200'
            value={amount}
            min='1'
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* Courier — dropdown only, no free text */}
        <div className='seller-quote-form__field'>
          <label className='seller-quote-form__label'>
            Courier <span style={{ color: '#c0392b' }}>*</span>
          </label>
          <select
            className='seller-quote-form__input'
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            required
          >
            <option value=''>Select courier...</option>
            {COURIERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Estimated days — dropdown only */}
        <div className='seller-quote-form__field'>
          <label className='seller-quote-form__label'>
            Estimated Delivery Time <span style={{ color: '#c0392b' }}>*</span>
          </label>
          <select
            className='seller-quote-form__input'
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            required
          >
            <option value=''>Select timeframe...</option>
            {DELIVERY_DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button
          type='submit'
          className='seller-quote-form__submit'
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Submit Quote'}
        </button>

      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// OrderPage component
// ─────────────────────────────────────────────────────────────────────────
const OrderPage = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  // ── Local state ─────────────────────────────────────────────────────────
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Delivery quote actions
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Admin: mark delivered
  const [deliverLoading, setDeliverLoading] = useState(false);

  // Admin: release payout
  const [payoutLoading, setPayoutLoading] = useState(false);

  // ── Auth header config ───────────────────────────────────────────────────
  const config = {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  };

  // ── Fetch order on mount and after any action ────────────────────────────
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/orders/${orderId}`, config);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ── Cancel order ─────────────────────────────────────────────────────────
  const cancelOrderHandler = async () => {
    try {
      setCancelLoading(true);
      await axios.put(`/api/orders/${orderId}/cancel`, {}, config);
      showToast('Order cancelled. Stock has been restored.', 'success');
      setShowCancelModal(false);
      fetchOrder(); // refresh order data
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Approve delivery quote (Tier 2) ──────────────────────────────────────
  const approveQuoteHandler = async () => {
    try {
      setQuoteLoading(true);
      await axios.put(`/api/orders/${orderId}/delivery-quote/approve`, {}, config);
      showToast('Delivery quote approved. You can now complete payment.', 'success');
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve quote', 'error');
    } finally {
      setQuoteLoading(false);
    }
  };

  // ── Reject delivery quote (Tier 2) ───────────────────────────────────────
  const rejectQuoteHandler = async () => {
    try {
      setQuoteLoading(true);
      await axios.put(`/api/orders/${orderId}/delivery-quote/reject`, {}, config);
      showToast('Delivery quote rejected. Order has been cancelled.', 'info');
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject quote', 'error');
    } finally {
      setQuoteLoading(false);
    }
  };

  // ── Admin: mark order as delivered ───────────────────────────────────────
  const markDeliveredHandler = async () => {
    try {
      setDeliverLoading(true);
      await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      showToast('Order marked as delivered', 'success');
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order', 'error');
    } finally {
      setDeliverLoading(false);
    }
  };

  // ── Admin: release seller payout ─────────────────────────────────────────
  const releasePayoutHandler = async () => {
    try {
      setPayoutLoading(true);
      const { data } = await axios.put(`/api/orders/${orderId}/release-payout`, {}, config);
      showToast(data.message || 'Seller payout released', 'success');
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to release payout', 'error');
    } finally {
      setPayoutLoading(false);
    }
  };

  // ── Derive status step index for the timeline ────────────────────────────
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order?.status);

  // ── Render: loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='order-page order-page--loading'>
        <div className='order-page__spinner' aria-label='Loading order…' />
        <p>Loading your order…</p>
      </div>
    );
  }

  // ── Render: error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className='order-page order-page--error'>
        <FaExclamationTriangle aria-hidden='true' />
        <p>{error}</p>
        <button className='order-page__retry-btn' onClick={fetchOrder}>
          Try Again
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className='order-page'>

      {/* ── Page heading ──────────────────────────────────────────────── */}
      <div className='order-page__heading'>
        <h1 className='order-page__title'>
          Order <span className='order-page__id'>#{order._id.slice(-8).toUpperCase()}</span>
        </h1>
        <p className='order-page__date'>
          Placed on {new Date(order.createdAt).toLocaleDateString('en-KE', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      <div className='order-page__inner'>

        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN — order details
           ══════════════════════════════════════════════════════════════ */}
        <div className='order-page__left'>

          {/* ── Order items ────────────────────────────────────────── */}
          <div className='order-section'>
            <div className='order-section__header'>
              <FaShoppingBag className='order-section__icon' aria-hidden='true' />
              <h2 className='order-section__title'>Order Items</h2>
            </div>

            <ul className='order-items'>
              {order.orderItems.map((item) => (
                <li key={item._id} className='order-item'>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='order-item__img'
                  />
                  <div className='order-item__info'>
                    <Link
                      to={`/product/${item.product}`}
                      className='order-item__name'
                    >
                      {item.name}
                    </Link>
                    <span className='order-item__category'>{item.category}</span>
                    {item.unit && (
                      <span className='order-item__unit'>Unit: {item.unit}</span>
                    )}
                  </div>
                  <div className='order-item__price'>
                    {item.qty} × {formatKES(item.priceAtPurchase)}
                    <strong>{formatKES(item.qty * item.priceAtPurchase)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Delivery address ───────────────────────────────────── */}
          <div className='order-section'>
            <div className='order-section__header'>
              <FaTruck className='order-section__icon' aria-hidden='true' />
              <h2 className='order-section__title'>Delivery Address</h2>
            </div>

            <div className='order-detail-grid'>
              <div className='order-detail'>
                <span className='order-detail__label'>Address</span>
                <span className='order-detail__value'>{order.shippingAddress.address}</span>
              </div>
              <div className='order-detail'>
                <span className='order-detail__label'>Town / City</span>
                <span className='order-detail__value'>{order.shippingAddress.city}</span>
              </div>
              <div className='order-detail'>
                <span className='order-detail__label'>County</span>
                <span className='order-detail__value'>{order.shippingAddress.county}</span>
              </div>
              {order.shippingZone && (
                <div className='order-detail'>
                  <span className='order-detail__label'>Delivery Zone</span>
                  <span className='order-detail__value order-detail__value--accent'>
                    {order.shippingZone}
                  </span>
                </div>
              )}
            </div>

            {/* ── Tier 2 delivery quote section ─────────────────────── */}
            {order.shippingTier === 'quote_required' && (
              <div className='order-quote-section'>
                <h3 className='order-quote-section__title'>Delivery Quote</h3>

                {/* Seller quote form — shown to admin and sellers only */}
                {/* Buyer never sees this form — they only see the result */}
                {userInfo?.isAdmin &&
                  order.deliveryQuote?.status === 'pending' &&
                  order.sellerQuote?.status !== 'submitted' && (
                    <SellerQuoteForm
                      orderId={order._id}
                      shippingZone={order.shippingZone}
                      config={{ headers: { Authorization: `Bearer ${userInfo.token}` } }}
                      onSubmitted={fetchOrder}
                    />
                  )}

                {/* Admin sees submitted seller quote before forwarding to buyer */}
                {userInfo?.isAdmin && order.sellerQuote?.status === 'submitted' && (
                  <div className='order-quote-status order-quote-status--sent' style={{ marginBottom: '12px' }}>
                    <FaTruck aria-hidden='true' />
                    <div>
                      <strong>Seller Quote Received</strong>
                      <p>
                        Courier: {order.sellerQuote.courier} —{' '}
                        KES {order.sellerQuote.amount?.toLocaleString()} —{' '}
                        {order.sellerQuote.estimatedDays}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#888' }}>
                        Review this quote then use "Send Quote to Buyer" in the Admin Orders page to forward it.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pending — admin hasn't sent a quote yet */}
                {order.deliveryQuote?.status === 'pending' && (
                  <div className='order-quote-status order-quote-status--pending'>
                    <FaClock aria-hidden='true' />
                    <div>
                      <strong>Quote Pending</strong>
                      <p>
                        Our team is arranging a delivery quote for your bulk/heavy
                        goods order. You will be notified within 24 hours.
                      </p>
                    </div>
                  </div>
                )}


                {/* Sent — buyer can approve or reject */}
                {order.deliveryQuote?.status === 'sent' && (
                  <div className='order-quote-status order-quote-status--sent'>
                    <FaMoneyBillWave aria-hidden='true' />
                    <div className='order-quote-status__content'>
                      <strong>Delivery Quote Received</strong>
                      <p>
                        Our team has quoted <strong>{formatKES(order.deliveryQuote.amount)}</strong> for
                        delivery of your order.
                        {order.deliveryQuote.notes && (
                          <span className='order-quote-status__notes'>
                            {' '}Note: {order.deliveryQuote.notes}
                          </span>
                        )}
                      </p>
                      {/* Approve / Reject buttons */}
                      <div className='order-quote-actions'>
                        <button
                          className='order-quote-btn order-quote-btn--approve'
                          onClick={approveQuoteHandler}
                          disabled={quoteLoading}
                          aria-label='Approve delivery quote'
                        >
                          {quoteLoading ? 'Processing…' : 'Approve Quote'}
                        </button>
                        <button
                          className='order-quote-btn order-quote-btn--reject'
                          onClick={rejectQuoteHandler}
                          disabled={quoteLoading}
                          aria-label='Reject delivery quote and cancel order'
                        >
                          Reject & Cancel Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approved — buyer can now pay */}
                {order.deliveryQuote?.status === 'buyer_approved' && (
                  <div className='order-quote-status order-quote-status--approved'>
                    <FaCheckCircle aria-hidden='true' />
                    <div>
                      <strong>Quote Approved — {formatKES(order.deliveryQuote.amount)}</strong>
                      <p>
                        You approved this delivery quote on{' '}
                        {new Date(order.deliveryQuote.approvedAt).toLocaleDateString('en-KE')}.
                        Please complete payment to proceed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejected — order was cancelled */}
                {order.deliveryQuote?.status === 'buyer_rejected' && (
                  <div className='order-quote-status order-quote-status--rejected'>
                    <FaTimesCircle aria-hidden='true' />
                    <div>
                      <strong>Quote Rejected</strong>
                      <p>You rejected the delivery quote. This order has been cancelled.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Payment method ─────────────────────────────────────── */}
          <div className='order-section'>
            <div className='order-section__header'>
              <FaCreditCard className='order-section__icon' aria-hidden='true' />
              <h2 className='order-section__title'>Payment</h2>
            </div>
            <div className='order-payment-row'>
              <span className='order-payment-method'>{order.paymentMethod}</span>
              {order.isPaid ? (
                <span className='order-badge order-badge--paid'>
                  <FaCheckCircle aria-hidden='true' /> Paid — {new Date(order.paidAt).toLocaleDateString('en-KE')}
                </span>
              ) : (
                <span className='order-badge order-badge--unpaid'>
                  <FaClock aria-hidden='true' /> Awaiting Payment
                </span>
              )}
            </div>

            {/* Seller payout status — visible to admin and shown to buyer as trust signal */}
            {order.isDelivered && (
              <div className='order-payout-status'>
                {order.sellerPayoutReleased ? (
                  <span className='order-badge order-badge--payout-done'>
                    <FaCheckCircle aria-hidden='true' /> Seller payment released
                  </span>
                ) : (
                  <span className='order-badge order-badge--payout-pending'>
                    <FaClock aria-hidden='true' /> Seller payout pending admin release
                  </span>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN — status timeline + price summary + actions
           ══════════════════════════════════════════════════════════════ */}
        <div className='order-page__right'>

          {/* ── Order status timeline ──────────────────────────────── */}
          {order.status !== 'cancelled' && (
            <div className='order-status-card'>
              <h2 className='order-status-card__title'>Order Status</h2>
              <ol className='order-timeline' aria-label='Order progress'>
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.key}
                      className={[
                        'order-timeline__step',
                        isDone ? 'order-timeline__step--done' : '',
                        isCurrent ? 'order-timeline__step--current' : '',
                      ].join(' ')}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div className='order-timeline__icon-wrap' aria-hidden='true'>
                        <Icon className='order-timeline__icon' />
                      </div>
                      <span className='order-timeline__label'>{step.label}</span>
                      {/* Connector line between steps */}
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={[
                            'order-timeline__connector',
                            isDone ? 'order-timeline__connector--done' : '',
                          ].join(' ')}
                          aria-hidden='true'
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Cancelled status card */}
          {order.status === 'cancelled' && (
            <div className='order-status-card order-status-card--cancelled'>
              <FaTimesCircle className='order-status-card__cancel-icon' aria-hidden='true' />
              <h2 className='order-status-card__title'>Order Cancelled</h2>
              <p className='order-status-card__cancel-note'>
                Stock has been restored. If you paid, please contact support for a refund.
              </p>
            </div>
          )}

          {/* ── Price summary ──────────────────────────────────────── */}
          <div className='order-price-card'>
            <h2 className='order-price-card__title'>Order Summary</h2>

            <div className='order-price-lines'>
              <div className='order-price-line'>
                <span>Items</span>
                <span>{formatKES(order.itemsPrice)}</span>
              </div>
              <div className='order-price-line'>
                <span>
                  Delivery
                  {order.shippingTier === 'quote_required' && (
                    <span className='order-price-line__note'> (quoted)</span>
                  )}
                </span>
                <span>
                  {order.shippingTier === 'quote_required' && order.deliveryQuote?.amount
                    ? formatKES(order.deliveryQuote.amount)
                    : order.shippingPrice === 0
                      ? 'Pending quote'
                      : formatKES(order.shippingPrice)}
                </span>
              </div>
              <div className='order-price-line'>
                <span>VAT (included)</span>
                <span>{formatKES(order.taxPrice)}</span>
              </div>
              <div className='order-price-divider' aria-hidden='true' />

              <div className='order-price-line order-price-line--total'>
                <span>Total</span>
                <strong>{formatKES(order.totalPrice)}</strong>
              </div>

              {/* Show platform commission to admin only */}
              {userInfo?.isAdmin && order.platformCommission > 0 && (
                <div className='order-price-line order-price-line--commission'>
                  <span>Platform Commission (admin)</span>
                  <span>{formatKES(order.platformCommission)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Action buttons ─────────────────────────────────────── */}
          <div className='order-actions'>

            {/* Cancel button — only for unpaid, non-delivered, non-cancelled orders */}
            {!order.isPaid &&
              !order.isDelivered &&
              order.status !== 'cancelled' && (
                <button
                  className='order-action-btn order-action-btn--cancel'
                  onClick={() => setShowCancelModal(true)}
                  aria-label='Cancel this order'
                >
                  Cancel Order
                </button>
              )}

            {/* Admin: mark as delivered */}
            {userInfo?.isAdmin &&
              order.isPaid &&
              !order.isDelivered &&
              order.status !== 'cancelled' && (
                <button
                  className='order-action-btn order-action-btn--deliver'
                  onClick={markDeliveredHandler}
                  disabled={deliverLoading}
                  aria-label='Mark order as delivered'
                >
                  {deliverLoading ? 'Updating…' : 'Mark as Delivered'}
                </button>
              )}

            {/* Admin: release seller payout */}
            {userInfo?.isAdmin &&
              order.isDelivered &&
              order.isPaid &&
              !order.sellerPayoutReleased && (
                <button
                  className='order-action-btn order-action-btn--payout'
                  onClick={releasePayoutHandler}
                  disabled={payoutLoading}
                  aria-label='Release seller payout'
                >
                  <FaMoneyBillWave aria-hidden='true' />
                  {payoutLoading ? 'Releasing…' : 'Release Seller Payout'}
                </button>
              )}

          </div>

        </div>
      </div>

      {/* ── Cancel confirmation modal ──────────────────────────────────── */}
      {showCancelModal && (
        <div
          className='order-modal-overlay'
          role='dialog'
          aria-modal='true'
          aria-labelledby='cancel-modal-title'
        >
          <div className='order-modal'>
            <h3 className='order-modal__title' id='cancel-modal-title'>
              Cancel this order?
            </h3>
            <p className='order-modal__body'>
              Cancelling will restore all stock immediately. This action cannot be undone.
              If you need these goods, you will need to place a new order.
            </p>
            <div className='order-modal__actions'>
              <button
                className='order-modal__btn order-modal__btn--confirm'
                onClick={cancelOrderHandler}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling…' : 'Yes, Cancel Order'}
              </button>
              <button
                className='order-modal__btn order-modal__btn--dismiss'
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderPage;