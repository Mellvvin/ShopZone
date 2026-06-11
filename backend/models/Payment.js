// backend/models/Payment.js
// ─────────────────────────────────────────────────────────────
// Payment model — single source of truth for every payment on
// ShopZone regardless of method (M-Pesa STK, manual M-Pesa,
// bank transfer, or admin confirmation).
//
// This model is the foundation for Step 20 (M-Pesa STK Push).
// When Daraja is wired, the STK callback will find or create a
// Payment document and call the same confirmPayment logic that
// admin uses today for manual confirmations.
//
// Foreign key chain:
//   Payment.orderId  → Order._id
//   Payment.userId   → User._id
//   Order.paymentId  → Payment._id  (set after payment confirmed)
//
// Do NOT add pre-save hooks. Password hashing stays in controllers.
// ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // ── Links ────────────────────────────────────────────────
    // orderId is required — every payment must reference an order
    orderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Order',
      required: true,
    },
    // userId — the buyer who made the payment
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // ── Payment method ───────────────────────────────────────
    // STK Push is the target. Manual and bank transfer are the
    // fallback until Daraja is live.
    method: {
      type: String,
      enum: [
        'mpesa_stk',      // Daraja STK Push (Step 20)
        'mpesa_manual',   // User paid manually, admin confirms
        'bank_transfer',  // Bank transfer, admin confirms
        'cash',           // Cash on collection, admin confirms
        'other',          // Any other method
      ],
      required: true,
      default: 'mpesa_manual',
    },

    // ── Status ───────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        'pending',    // payment initiated, not yet confirmed
        'confirmed',  // payment received and verified
        'failed',     // payment failed or rejected
        'disputed',   // payment under dispute
        'refunded',   // payment refunded
      ],
      default: 'pending',
    },

    // ── Amount ───────────────────────────────────────────────
    amount: {
      type:     Number,
      required: true,
    },

    // ── M-Pesa fields ────────────────────────────────────────
    // mpesaReceiptNumber — the transaction code from M-Pesa
    // e.g. QHJ4X2K9PL — extracted from STK callback or parsed
    // from the raw SMS message pasted by admin
    mpesaReceiptNumber: {
      type:    String,
      default: '',
    },

    // rawMessage — the full M-Pesa SMS confirmation message as
    // pasted by admin. Stored verbatim as an audit trail.
    // Example: "QHJ4X2K9PL Confirmed. KES 3,500.00 received from
    // JOHN KAMAU 0722XXXXXX on 8/6/26 at 10:32 AM."
    rawMessage: {
      type:    String,
      default: '',
    },

    // reference — generic payment reference used for bank
    // transfers and other non-M-Pesa methods
    reference: {
      type:    String,
      default: '',
    },

    // ── Manual confirmation fields ───────────────────────────
    // Set when an admin manually confirms a payment
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    confirmedAt: {
      type: Date,
    },

    // ── STK Push fields (Step 20) ────────────────────────────
    // These are populated by the Daraja callback when STK is live
    stkCheckoutRequestId: {
      type:    String,
      default: '',
    },
    stkResultCode: {
      type:    Number,
    },
    stkResultDesc: {
      type:    String,
      default: '',
    },

    // ── Notes ────────────────────────────────────────────────
    // Admin notes on this payment — internal only
    notes: {
      type:    String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Indexes ──────────────────────────────────────────────────
paymentSchema.index({ orderId: 1 });                    // find payment by order
paymentSchema.index({ userId: 1, createdAt: -1 });      // user payment history
paymentSchema.index({ status: 1 });                     // filter by status
paymentSchema.index({ mpesaReceiptNumber: 1 });         // dedup M-Pesa receipts

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;