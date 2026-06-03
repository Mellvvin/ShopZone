// AdminOrderListPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone Admin — Order Management Page — updated for Step 12/14.5
//
// PURPOSE:
//   Admin view of all orders. Lets the admin manage the full order lifecycle:
//   view, mark delivered, release seller payout, and send delivery quotes
//   for Tier 2 (bulk/heavy goods) orders.
//
// WHAT CHANGED FROM ORIGINAL:
//   • Three tabs added: All Orders | Pending Quotes | Payout Queue
//     — Pending Quotes: Tier 2 orders where admin needs to send a delivery quote
//     — Payout Queue: delivered + paid orders waiting for seller payout release
//   • Order table shows new status column with colour-coded badges
//   • Tier 2 flag shown on orders that have bulk/heavy items
//   • Send Delivery Quote modal — admin enters KES amount + optional notes
//   • Release Payout button on the payout queue tab
//   • Mark Delivered modal unchanged in structure
//   • All prices in KES format
//   • showToast used for all success and error feedback
//
// STRUCTURE:
//   Tab bar (All | Pending Quotes | Payout Queue)
//   → orders table for current tab
//   → Send Quote modal (Tier 2 tab)
//   → Mark Delivered modal (All tab)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import {
  FaClipboardList,
  FaTruck,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
} from 'react-icons/fa';
import './AdminOrderListPage.css';

// ── Helper: format KES ────────────────────────────────────────────────────
const formatKES = (amount) =>
  `KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

// ── Status badge config ───────────────────────────────────────────────────
// Maps each order status to a CSS modifier and label
const STATUS_CONFIG = {
  pending: { label: 'Pending', mod: 'pending' },
  processing: { label: 'Processing', mod: 'processing' },
  dispatched: { label: 'Dispatched', mod: 'dispatched' },
  delivered: { label: 'Delivered', mod: 'delivered' },
  cancelled: { label: 'Cancelled', mod: 'cancelled' },
};

// ─────────────────────────────────────────────────────────────────────────
// AdminOrderListPage component
// ─────────────────────────────────────────────────────────────────────────
const AdminOrderListPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // ── Page title ─────────────────────────────────────────────
  useEffect(() => { document.title = 'Admin: Order List — ShopZone'; }, []);

// ── Tab state ────────────────────────────────────────────────────────────
  // 'all' | 'quotes' | 'payouts' | 'fulfilled' | 'cancelled'
  const [activeTab, setActiveTab] = useState('all');

  // ── Orders data ──────────────────────────────────────────────────────────
  const [allOrders, setAllOrders] = useState([]);
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [payoutQueue, setPayoutQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Mark Delivered modal ─────────────────────────────────────────────────
  const [deliverModal, setDeliverModal] = useState(false);
  const [deliverOrder, setDeliverOrder] = useState(null);
  const [deliverLoading, setDeliverLoading] = useState(false);

  // ── Send Quote modal (Tier 2) ────────────────────────────────────────────
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteOrder, setQuoteOrder] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);

  // ── Payout loading state (keyed by order ID) ─────────────────────────────
  const [payoutLoadingId, setPayoutLoadingId] = useState(null);

  // ── Auth header ──────────────────────────────────────────────────────────
  const config = {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  };

  // ── Fetch all three lists ────────────────────────────────────────────────
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [ordersRes, quotesRes, payoutsRes] = await Promise.all([
        axios.get('/api/orders', config),
        axios.get('/api/orders/pending-quotes', config),
        axios.get('/api/orders/payout-queue', config),
      ]);
      setAllOrders(ordersRes.data);
      setPendingQuotes(quotesRes.data);
      setPayoutQueue(payoutsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.isAdmin) { navigate('/'); return; }
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mark order as delivered ──────────────────────────────────────────────
  const markDeliveredHandler = async () => {
    if (!deliverOrder) return;
    try {
      setDeliverLoading(true);
      await axios.put(`/api/orders/${deliverOrder._id}/deliver`, {}, config);
      showToast(`Order #${deliverOrder._id.slice(-6).toUpperCase()} marked as delivered`, 'success');
      setDeliverModal(false);
      setDeliverOrder(null);
      fetchAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order', 'error');
    } finally {
      setDeliverLoading(false);
    }
  };

  // ── Send delivery quote (Tier 2) ─────────────────────────────────────────
  const sendQuoteHandler = async () => {
    if (!quoteOrder || !quoteAmount) return;
    try {
      setQuoteLoading(true);
      await axios.put(
        `/api/orders/${quoteOrder._id}/delivery-quote/send`,
        { amount: Number(quoteAmount), notes: quoteNotes },
        config
      );
      showToast(
        `Delivery quote of ${formatKES(quoteAmount)} sent to buyer`,
        'success'
      );
      setQuoteModal(false);
      setQuoteOrder(null);
      setQuoteAmount('');
      setQuoteNotes('');
      fetchAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send quote', 'error');
    } finally {
      setQuoteLoading(false);
    }
  };

  // ── Release seller payout ────────────────────────────────────────────────
  const releasePayoutHandler = async (order) => {
    try {
      setPayoutLoadingId(order._id);
      const { data } = await axios.put(
        `/api/orders/${order._id}/release-payout`,
        {},
        config
      );
      showToast(data.message || 'Seller payout released', 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to release payout', 'error');
    } finally {
      setPayoutLoadingId(null);
    }
  };

// ── Derived lists for new tabs ────────────────────────────────────────────
  // Fulfilled: delivered, paid, and payout released — order is fully complete
  const fulfilledOrders = allOrders.filter(
    (o) => o.isDelivered && o.isPaid && o.sellerPayoutReleased
  );
  // Cancelled: any order with cancelled status
  const cancelledOrders = allOrders.filter((o) => o.status === 'cancelled');

  // ── Current tab's data ───────────────────────────────────────────────────
  const tabOrders = activeTab === 'all'
    ? allOrders
    : activeTab === 'quotes'
      ? pendingQuotes
      : activeTab === 'payouts'
        ? payoutQueue
        : activeTab === 'fulfilled'
          ? fulfilledOrders
          : cancelledOrders;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='admin-orders-page'>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className='admin-orders-page__header'>
        <div className='admin-orders-page__title-row'>
          <FaClipboardList className='admin-orders-page__icon' aria-hidden='true' />
          <h1 className='admin-orders-page__title'>Order Management</h1>
        </div>

        {/* Summary counts */}
        <div className='admin-orders-counts'>
          <div className='admin-orders-count'>
            <span className='admin-orders-count__num'>{allOrders.length}</span>
            <span className='admin-orders-count__label'>Total Orders</span>
          </div>
          <div className='admin-orders-count admin-orders-count--alert'>
            <span className='admin-orders-count__num'>{pendingQuotes.length}</span>
            <span className='admin-orders-count__label'>Quotes Needed</span>
          </div>
          <div className='admin-orders-count admin-orders-count--payout'>
            <span className='admin-orders-count__num'>{payoutQueue.length}</span>
            <span className='admin-orders-count__label'>Payout Ready</span>
          </div>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className='admin-orders-tabs' role='tablist'>
        <button
          className={`admin-orders-tab ${activeTab === 'all' ? 'admin-orders-tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
          role='tab'
          aria-selected={activeTab === 'all'}
        >
          <FaClipboardList aria-hidden='true' />
          All Orders
          <span className='admin-orders-tab__count'>{allOrders.length}</span>
        </button>

        <button
          className={`admin-orders-tab ${activeTab === 'quotes' ? 'admin-orders-tab--active' : ''}`}
          onClick={() => setActiveTab('quotes')}
          role='tab'
          aria-selected={activeTab === 'quotes'}
        >
          <FaTruck aria-hidden='true' />
          Pending Quotes
          {pendingQuotes.length > 0 && (
            <span className='admin-orders-tab__count admin-orders-tab__count--alert'>
              {pendingQuotes.length}
            </span>
          )}
        </button>

        <button
          className={`admin-orders-tab ${activeTab === 'payouts' ? 'admin-orders-tab--active' : ''}`}
          onClick={() => setActiveTab('payouts')}
          role='tab'
          aria-selected={activeTab === 'payouts'}
        >
          <FaMoneyBillWave aria-hidden='true' />
          Payout Queue
          {payoutQueue.length > 0 && (
            <span className='admin-orders-tab__count admin-orders-tab__count--payout'>
              {payoutQueue.length}
            </span>
          )}
        </button>

        <button
          className={`admin-orders-tab ${activeTab === 'fulfilled' ? 'admin-orders-tab--active' : ''}`}
          onClick={() => setActiveTab('fulfilled')}
          role='tab'
          aria-selected={activeTab === 'fulfilled'}
        >
          <FaCheckCircle aria-hidden='true' />
          Fulfilled
          <span className='admin-orders-tab__count admin-orders-tab__count--fulfilled'>
            {fulfilledOrders.length}
          </span>
        </button>

        <button
          className={`admin-orders-tab ${activeTab === 'cancelled' ? 'admin-orders-tab--active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
          role='tab'
          aria-selected={activeTab === 'cancelled'}
        >
          <FaTimesCircle aria-hidden='true' />
          Cancelled
          {cancelledOrders.length > 0 && (
            <span className='admin-orders-tab__count admin-orders-tab__count--cancelled'>
              {cancelledOrders.length}
            </span>
          )}
        </button>

      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className='admin-orders-loading'>
          <div className='admin-orders-spinner' aria-label='Loading…' />
          <p>Loading orders…</p>
        </div>
      ) : error ? (
        <div className='admin-orders-error'>
          <FaExclamationTriangle aria-hidden='true' />
          <p>{error}</p>
          <button className='admin-orders-retry-btn' onClick={fetchAllData}>
            Retry
          </button>
        </div>
      ) : tabOrders.length === 0 ? (
        <div className='admin-orders-empty'>
          <p>
            {activeTab === 'all'       && 'No orders yet.'}
            {activeTab === 'quotes'    && 'No pending delivery quotes. All Tier 2 orders have been actioned.'}
            {activeTab === 'payouts'   && 'No orders in the payout queue. All delivered orders have been settled.'}
            {activeTab === 'fulfilled' && 'No fully completed orders yet.'}
            {activeTab === 'cancelled' && 'No cancelled orders.'}
          </p>
        </div>
      ) : (
        <div className='admin-orders-table-wrap'>
          <table className='admin-orders-table' aria-label='Orders table'>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Delivered</th>
                {activeTab === 'quotes' && <th>Quote Status</th>}
                {activeTab === 'payouts' && <th>Payout</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tabOrders.map((order, idx) => {
                const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, mod: 'pending' };
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={order._id}
                    className={`admin-orders-table__row ${isEven ? '' : 'admin-orders-table__row--alt'}`}
                  >
                    {/* Order ID */}
                    <td className='admin-orders-table__id'>
                      #{order._id.slice(-8).toUpperCase()}
                      {/* Flag Tier 2 orders */}
                      {order.hasTier2Items && (
                        <span
                          className='admin-orders-table__tier2-flag'
                          title='Contains bulk/heavy goods'
                          aria-label='Bulk goods order'
                        >
                          Bulk
                        </span>
                      )}
                    </td>

                    {/* Buyer */}
                    <td>
                      <div className='admin-orders-table__buyer'>
                        <span>{order.user?.name || '—'}</span>
                        <span className='admin-orders-table__buyer-email'>
                          {order.user?.email}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className='admin-orders-table__date'>
                      {new Date(order.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>

                    {/* Total */}
                    <td className='admin-orders-table__total'>
                      {formatKES(order.totalPrice)}
                      {order.platformCommission > 0 && (
                        <span className='admin-orders-table__commission'>
                          Comm: {formatKES(order.platformCommission)}
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${statusCfg.mod}`}>
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Paid */}
                    <td>
                      {order.isPaid ? (
                        <span className='admin-bool-badge admin-bool-badge--yes'>
                          <FaCheckCircle aria-hidden='true' />
                          {new Date(order.paidAt).toLocaleDateString('en-KE', {
                            day: 'numeric', month: 'short'
                          })}
                        </span>
                      ) : (
                        <span className='admin-bool-badge admin-bool-badge--no'>
                          <FaTimesCircle aria-hidden='true' /> No
                        </span>
                      )}
                    </td>

                    {/* Delivered */}
                    <td>
                      {order.isDelivered ? (
                        <span className='admin-bool-badge admin-bool-badge--yes'>
                          <FaCheckCircle aria-hidden='true' />
                          {new Date(order.deliveredAt).toLocaleDateString('en-KE', {
                            day: 'numeric', month: 'short'
                          })}
                        </span>
                      ) : (
                        <span className='admin-bool-badge admin-bool-badge--no'>
                          <FaTimesCircle aria-hidden='true' /> No
                        </span>
                      )}
                    </td>

                    {/* Quote status column (Pending Quotes tab only) */}
                    {activeTab === 'quotes' && (
                      <td>
                        <span className='admin-quote-status'>
                          <FaClock aria-hidden='true' /> Awaiting quote
                        </span>
                      </td>
                    )}

                    {/* Payout status column (Payout Queue tab only) */}
                    {activeTab === 'payouts' && (
                      <td>
                        {order.sellerPayoutReleased ? (
                          <span className='admin-bool-badge admin-bool-badge--yes'>
                            <FaCheckCircle aria-hidden='true' /> Released
                          </span>
                        ) : (
                          <span className='admin-bool-badge admin-bool-badge--no'>
                            <FaClock aria-hidden='true' /> Pending
                          </span>
                        )}
                      </td>
                    )}

                    {/* Actions */}
                    <td>
                      <div className='admin-orders-table__actions'>

                        {/* View order */}
                        <Link
                          to={`/order/${order._id}`}
                          className='admin-table-btn admin-table-btn--view'
                          aria-label={`View order ${order._id.slice(-6)}`}
                        >
                          <FaEye aria-hidden='true' /> View
                        </Link>

                        {/* Mark delivered — only for paid, undelivered orders */}
                        {order.isPaid && !order.isDelivered && order.status !== 'cancelled' && (
                          <button
                            className='admin-table-btn admin-table-btn--deliver'
                            onClick={() => { setDeliverOrder(order); setDeliverModal(true); }}
                            aria-label={`Mark order ${order._id.slice(-6)} as delivered`}
                          >
                            <FaTruck aria-hidden='true' /> Deliver
                          </button>
                        )}

                        {/* Send quote — Tier 2 orders only */}
                        {activeTab === 'quotes' && (
                          <button
                            className='admin-table-btn admin-table-btn--quote'
                            onClick={() => { setQuoteOrder(order); setQuoteModal(true); }}
                            aria-label={`Send delivery quote for order ${order._id.slice(-6)}`}
                          >
                            <FaTruck aria-hidden='true' /> Send Quote
                          </button>
                        )}

                        {/* Release payout — Payout Queue tab only */}
                        {activeTab === 'payouts' && !order.sellerPayoutReleased && (
                          <button
                            className='admin-table-btn admin-table-btn--payout'
                            onClick={() => releasePayoutHandler(order)}
                            disabled={payoutLoadingId === order._id}
                            aria-label={`Release payout for order ${order._id.slice(-6)}`}
                          >
                            <FaMoneyBillWave aria-hidden='true' />
                            {payoutLoadingId === order._id ? 'Releasing…' : 'Release'}
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mark Delivered Modal ─────────────────────────────────────── */}
      {deliverModal && deliverOrder && (
        <div
          className='admin-modal-overlay'
          role='dialog'
          aria-modal='true'
          aria-labelledby='deliver-modal-title'
        >
          <div className='admin-modal'>
            <h3 className='admin-modal__title' id='deliver-modal-title'>
              Mark as Delivered?
            </h3>
            <p className='admin-modal__body'>
              Order <strong>#{deliverOrder._id.slice(-8).toUpperCase()}</strong> will be marked as delivered.
              The buyer will be notified. This makes the order eligible for seller payout release.
            </p>
            <div className='admin-modal__actions'>
              <button
                className='admin-modal__btn admin-modal__btn--confirm'
                onClick={markDeliveredHandler}
                disabled={deliverLoading}
              >
                {deliverLoading ? 'Updating…' : 'Yes, Mark Delivered'}
              </button>
              <button
                className='admin-modal__btn admin-modal__btn--dismiss'
                onClick={() => { setDeliverModal(false); setDeliverOrder(null); }}
                disabled={deliverLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Delivery Quote Modal ────────────────────────────────── */}
      {quoteModal && quoteOrder && (
        <div
          className='admin-modal-overlay'
          role='dialog'
          aria-modal='true'
          aria-labelledby='quote-modal-title'
        >
          <div className='admin-modal'>
            <h3 className='admin-modal__title' id='quote-modal-title'>
              Send Delivery Quote
            </h3>
            <p className='admin-modal__body'>
              Order <strong>#{quoteOrder._id.slice(-8).toUpperCase()}</strong> —{' '}
              {quoteOrder.shippingAddress?.county} zone.
              Enter the confirmed courier quote below. The buyer will approve or reject it.
            </p>

            {/* Quote amount input */}
            <div className='admin-modal__field'>
              <label className='admin-modal__label' htmlFor='quote-amount'>
                Delivery Quote Amount (KES) <span className='admin-modal__required'>*</span>
              </label>
              <input
                id='quote-amount'
                type='number'
                className='admin-modal__input'
                placeholder='e.g. 1500'
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                min='1'
                required
              />
            </div>

            {/* Optional notes */}
            <div className='admin-modal__field'>
              <label className='admin-modal__label' htmlFor='quote-notes'>
                Notes (optional)
              </label>
              <input
                id='quote-notes'
                type='text'
                className='admin-modal__input'
                placeholder='e.g. Fargo courier, estimated 3 days'
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
              />
            </div>

            <div className='admin-modal__actions'>
              <button
                className='admin-modal__btn admin-modal__btn--confirm'
                onClick={sendQuoteHandler}
                disabled={quoteLoading || !quoteAmount}
              >
                {quoteLoading ? 'Sending…' : 'Send Quote to Buyer'}
              </button>
              <button
                className='admin-modal__btn admin-modal__btn--dismiss'
                onClick={() => {
                  setQuoteModal(false);
                  setQuoteOrder(null);
                  setQuoteAmount('');
                  setQuoteNotes('');
                }}
                disabled={quoteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrderListPage;