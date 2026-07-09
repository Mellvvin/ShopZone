// frontend/src/components/InvoiceModal/InvoiceModal.jsx
// ─────────────────────────────────────────────────────────────
// Printable buyer-facing invoice — issued at order placement.
// Distinct from ReceiptModal: a receipt proves payment already
// happened; an invoice is a demand for payment issued when the
// order is created. Reuses ReceiptModal's VAT math and item
// table shape since orderItemSchema is identical either way.
//
// eTIMS note: ShopZone has no KRA PIN yet, so this is a
// buyer-facing document only — no QR code, no eTIMS submission.
// kraPin prop is left undefined until that registration happens;
// the line simply doesn't render until it's supplied.
//
// Usage:
//   <InvoiceModal order={order} kraPin={null} onClose={() => setShowInvoice(false)} />
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { FaTimes, FaPrint, FaFileInvoiceDollar } from 'react-icons/fa';
import { formatKES } from '../../utils/formatKES';
import { formatDateTime } from '../../utils/formatDateTime';
import './InvoiceModal.css';

const InvoiceModal = ({ order, kraPin, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // VAT inclusive — same extraction as ReceiptModal
  const vatAmount = order.totalPrice * 16 / 116;

  // Invoice number — own sequence would live on the order document
  // once a backend field exists (e.g. order.invoiceNumber). Until
  // then, derive a stable display number from the order id + date
  // so it's consistent across reprints, not random per render.
  const invoiceNumber = `INV-${order._id.slice(-8).toUpperCase()}`;

  const handlingTagLabels = {
    fragile:        'Fragile',
    keep_upright:   'Keep Upright',
    stack_limit:    'Stack Limit',
    perishable:     'Perishable',
    no_compression: 'No Compression',
  };

  return (
    <div
      className='invoice-overlay'
      role='dialog'
      aria-modal='true'
      aria-label='Order invoice'
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className='invoice-modal'>

        {/* ── Toolbar — hidden on print ─────────────────────── */}
        <div className='invoice-toolbar no-print'>
          <button
            className='invoice-toolbar__print'
            onClick={() => window.print()}
            aria-label='Print or save invoice as PDF'
          >
            <FaPrint aria-hidden='true' /> Print / Save as PDF
          </button>
          <button
            className='invoice-toolbar__close'
            onClick={onClose}
            aria-label='Close invoice'
          >
            <FaTimes aria-hidden='true' />
          </button>
        </div>

        {/* ── Printable invoice content ─────────────────────── */}
        <div className='invoice-doc' id='invoice-print-area'>

          {/* Header */}
          <div className='invoice-doc__header'>
            <div className='invoice-doc__brand'>
              Shop<span>Zone</span>
            </div>
            <p className='invoice-doc__tagline'>
              Kenya's Wholesale Marketplace — Nairobi, Kenya
            </p>
            <p className='invoice-doc__type'>
              <FaFileInvoiceDollar aria-hidden='true' /> Invoice
            </p>
          </div>

          {/* Bill From / Bill To */}
          <div className='invoice-doc__parties'>
            <div className='invoice-doc__party'>
              <span className='invoice-doc__party-label'>Bill From</span>
              <p className='invoice-doc__party-name'>ShopZone Wholesale Marketplace</p>
              <p>Nairobi, Kenya</p>
              {kraPin && <p>KRA PIN: {kraPin}</p>}
            </div>
            <div className='invoice-doc__party invoice-doc__party--right'>
              <span className='invoice-doc__party-label'>Bill To</span>
              <p className='invoice-doc__party-name'>
                {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
              </p>
              <p>{order.shippingAddress?.address}</p>
              {order.shippingAddress?.apartment && <p>{order.shippingAddress.apartment}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.county}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Invoice meta */}
          <div className='invoice-doc__meta'>
            <div className='invoice-doc__meta-block'>
              <span className='invoice-doc__meta-label'>Invoice Number</span>
              <span className='invoice-doc__meta-value'>{invoiceNumber}</span>
            </div>
            <div className='invoice-doc__meta-block'>
              <span className='invoice-doc__meta-label'>Order Reference</span>
              <span className='invoice-doc__meta-value'>
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className='invoice-doc__meta-block invoice-doc__meta-block--right'>
              <span className='invoice-doc__meta-label'>Issue Date</span>
              <span className='invoice-doc__meta-value'>
                {formatDateTime(order.createdAt)}
              </span>
              <span className='invoice-doc__meta-sub'>Payment due on order placement</span>
            </div>
          </div>

          {/* Items table */}
          <table className='invoice-doc__table'>
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
                  <td>
                    {item.name}
                    <div className='invoice-doc__item-unit'>
                      {item.unitType || item.unit || 'Per Unit'}
                      {item.itemsPerUnit > 1 && (
                        <> — ≈ {formatKES(item.priceAtPurchase / item.itemsPerUnit)} per piece ({item.itemsPerUnit}/unit)</>
                      )}
                    </div>
                  </td>
                  <td className='text-right'>{item.qty}</td>
                  <td className='text-right'>{formatKES(item.priceAtPurchase)}</td>
                  <td className='text-right'>{formatKES(item.qty * item.priceAtPurchase)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Handling instructions, if any were selected */}
          {order.handlingTags?.length > 0 && (
            <div className='invoice-doc__handling'>
              <span className='invoice-doc__handling-label'>Handling Instructions:</span>
              {order.handlingTags.map((tag) => (
                <span key={tag} className='invoice-doc__handling-tag'>
                  {handlingTagLabels[tag] || tag}
                </span>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className='invoice-doc__totals'>
            <div className='invoice-doc__totals-row'>
              <span>Subtotal (goods)</span>
              <span>{formatKES(order.itemsPrice)}</span>
            </div>
            <div className='invoice-doc__totals-row'>
              <span>Delivery fee</span>
              <span>{formatKES(order.shippingPrice)}</span>
            </div>
            <div className='invoice-doc__totals-row invoice-doc__totals-row--vat'>
              <span>VAT 16% (inclusive — extracted from total)</span>
              <span>{formatKES(vatAmount)}</span>
            </div>
            <div className='invoice-doc__totals-divider' />
            <div className='invoice-doc__totals-row invoice-doc__totals-row--total'>
              <span>AMOUNT DUE</span>
              <strong>{formatKES(order.totalPrice)}</strong>
            </div>
          </div>

          {/* Footer */}
          <div className='invoice-doc__footer'>
            <p><strong>ShopZone Wholesale Marketplace</strong></p>
            <p>Nairobi, Kenya</p>
            <p>VAT is inclusive and extracted at 16/116 of the total price.</p>
            <p>
              {kraPin
                ? 'This is a tax invoice issued in accordance with KRA regulations.'
                : 'This is a computer-generated invoice. It is not a KRA-registered tax invoice.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;