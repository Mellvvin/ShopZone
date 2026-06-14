// frontend/src/components/ReceiptModal/ReceiptModal.jsx
// ─────────────────────────────────────────────────────────────
// Printable receipt modal.
//
// Opens as a full-screen overlay with a styled receipt.
// The receipt shows: ShopZone header, order items table, VAT
// breakdown, delivery fee, total, and payment details.
//
// "Print / Save as PDF" button triggers window.print().
// A @media print rule in ReceiptModal.css hides the overlay chrome
// and only prints the receipt content.
//
// Usage:
//   <ReceiptModal order={order} payment={paymentRecord} onClose={() => setShowReceipt(false)} />
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { FaTimes, FaPrint, FaCheckCircle } from 'react-icons/fa';
import { formatKES } from '../../utils/formatKES';
import './ReceiptModal.css';

const ReceiptModal = ({ order, payment, onClose }) => {
  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // VAT is inclusive — extracted as price × 16/116
  const vatAmount = order.totalPrice * 16 / 116;

  const methodLabel = (method) => {
    const map = {
      mpesa_manual:  'M-Pesa (Manual)',
      mpesa_stk:     'M-Pesa (STK Push)',
      bank_transfer: 'Bank Transfer',
      cash:          'Cash',
      other:         'Other',
    };
    return map[method] || method;
  };

  return (
    <div
      className='receipt-overlay'
      role='dialog'
      aria-modal='true'
      aria-label='Order receipt'
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className='receipt-modal'>

        {/* ── Modal toolbar — hidden on print ──────────────── */}
        <div className='receipt-toolbar no-print'>
          <button
            className='receipt-toolbar__print'
            onClick={() => window.print()}
            aria-label='Print or save receipt as PDF'
          >
            <FaPrint aria-hidden='true' /> Print / Save as PDF
          </button>
          <button
            className='receipt-toolbar__close'
            onClick={onClose}
            aria-label='Close receipt'
          >
            <FaTimes aria-hidden='true' />
          </button>
        </div>

        {/* ── Printable receipt content ─────────────────────── */}
        <div className='receipt-doc' id='receipt-print-area'>

          {/* Header */}
          <div className='receipt-doc__header'>
            <div className='receipt-doc__brand'>
              Shop<span>Zone</span>
            </div>
            <p className='receipt-doc__tagline'>
              Kenya's Wholesale Marketplace — Nairobi, Kenya
            </p>
            <p className='receipt-doc__type'>Tax Invoice / Receipt</p>
          </div>

          {/* Order meta */}
          <div className='receipt-doc__meta'>
            <div className='receipt-doc__meta-block'>
              <span className='receipt-doc__meta-label'>Order Reference</span>
              <span className='receipt-doc__meta-value'>
                #{order._id.slice(-8).toUpperCase()}
              </span>
              <span className='receipt-doc__meta-sub'>{order._id}</span>
            </div>
            <div className='receipt-doc__meta-block receipt-doc__meta-block--right'>
              <span className='receipt-doc__meta-label'>Order Date</span>
              <span className='receipt-doc__meta-value'>
                {new Date(order.createdAt).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              {order.paidAt && (
                <span className='receipt-doc__meta-sub'>
                  Paid: {new Date(order.paidAt).toLocaleString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Items table */}
          <table className='receipt-doc__table'>
            <thead>
              <tr>
                <th>Item</th>
                <th className='text-right'>Qty</th>
                <th className='text-right'>Unit Price</th>
                <th className='text-right'>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item._id || item.product}>
                  <td>{item.name}</td>
                  <td className='text-right'>{item.qty}</td>
                  <td className='text-right'>{formatKES(item.priceAtPurchase)}</td>
                  <td className='text-right'>{formatKES(item.qty * item.priceAtPurchase)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className='receipt-doc__totals'>
            <div className='receipt-doc__totals-row'>
              <span>Subtotal (goods)</span>
              <span>{formatKES(order.itemsPrice)}</span>
            </div>
            <div className='receipt-doc__totals-row'>
              <span>Delivery fee</span>
              <span>{formatKES(order.shippingPrice)}</span>
            </div>
            <div className='receipt-doc__totals-row receipt-doc__totals-row--vat'>
              <span>VAT 16% (inclusive — extracted from total)</span>
              <span>{formatKES(vatAmount)}</span>
            </div>
            <div className='receipt-doc__totals-divider' />
            <div className='receipt-doc__totals-row receipt-doc__totals-row--total'>
              <span>TOTAL</span>
              <strong>{formatKES(order.totalPrice)}</strong>
            </div>
          </div>

          {/* Payment details — only shown when payment is confirmed */}
          {payment && payment.status === 'confirmed' && (
            <div className='receipt-doc__payment'>
              <div className='receipt-doc__payment-title'>
                <FaCheckCircle aria-hidden='true' /> Payment Confirmed
              </div>
              <div className='receipt-doc__payment-grid'>
                <div className='receipt-doc__payment-row'>
                  <span>Method</span>
                  <span>{methodLabel(payment.method)}</span>
                </div>
                {payment.mpesaReceiptNumber && (
                  <div className='receipt-doc__payment-row'>
                    <span>M-Pesa Receipt</span>
                    <span className='receipt-doc__code'>{payment.mpesaReceiptNumber}</span>
                  </div>
                )}
                {payment.reference && (
                  <div className='receipt-doc__payment-row'>
                    <span>Reference</span>
                    <span className='receipt-doc__code'>{payment.reference}</span>
                  </div>
                )}
                <div className='receipt-doc__payment-row'>
                  <span>Amount Received</span>
                  <span className='receipt-doc__payment-amount'>
                    {formatKES(payment.amount)}
                  </span>
                </div>
                {payment.confirmedAt && (
                  <div className='receipt-doc__payment-row'>
                    <span>Confirmed On</span>
                    <span>
                      {new Date(payment.confirmedAt).toLocaleString('en-KE', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='receipt-doc__footer'>
            <p><strong>ShopZone Wholesale Marketplace</strong></p>
            <p>Nairobi, Kenya</p>
            <p>VAT is inclusive and extracted at 16/116 of the total price.</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;