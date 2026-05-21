// backend/models/Order.js
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone Order model — updated for Step 12/14.5
//
// CHANGES FROM ORIGINAL:
//   • Added shippingTier ('standard' | 'quote_required')
//     — 'standard'       = Tier 1 flat county rate, charged at checkout
//     — 'quote_required' = Tier 2 bulk/heavy goods, admin quotes post-order
//
//   • Added deliveryQuote fields for the Tier 2 admin quote flow:
//     — deliveryQuoteAmount   : admin enters the actual courier quote
//     — deliveryQuoteStatus   : 'pending' | 'sent' | 'approved' | 'rejected'
//     — deliveryQuoteSentAt   : when admin sent the quote to buyer
//     — deliveryQuoteApprovedAt: when buyer approved
//
//   • Added shippingZone — snapshot of which zone the buyer's county maps to
//     (e.g. 'Nairobi', 'Coast') recorded at order creation so rate history
//     is preserved even if the rate table changes later
//
//   • Added sellerPayoutReleased — tracks whether admin has released funds
//     to the seller after delivery. False by default (lightweight escrow).
//     Phase 3: this becomes automated via T+2 after isDelivered = true.
//
//   • Added platformCommission — records ShopZone's commission amount at
//     order creation. Not charged yet (manual reconciliation in Phase 1)
//     but stored for admin dashboard visibility.
//
//   • Added hasTier2Items — boolean flag so admin can quickly filter orders
//     that contain bulk/heavy goods and need quote attention
//
// UNCHANGED:
//   • orderItems, shippingAddress, paymentMethod, paymentResult
//   • itemsPrice, shippingPrice, taxPrice, totalPrice
//   • isPaid, paidAt, isDelivered, deliveredAt
//   • status (pending/cancelled)
//   • user reference
//   • timestamps
//
// NOTE: Password hashing is done in the controller, not in any pre-save hook.
// Do NOT add pre-save hooks to this file.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ── Review sub-schema (unchanged) ────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

// ── Order item sub-schema ─────────────────────────────────────────────────
// priceAtPurchase is a SNAPSHOT of the price at the moment the order was
// placed. This means if a seller later changes the product price, past
// orders are not affected. Critical for financial integrity.
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true }, // original price (kept for reference)
  priceAtPurchase: { type: Number, required: true }, // snapshot — used for billing
  category: { type: String, required: true }, // needed for Tier 2 detection
  unit: { type: String },                 // e.g. 'per dozen', 'per kg'
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
});

// ── Main Order schema ─────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── Who placed the order ────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    // ── What was ordered ────────────────────────────────────────────────
    orderItems: [orderItemSchema],

    // ── Where to deliver ────────────────────────────────────────────────
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      county: { type: String, required: true }, // used for rate lookup
      country: { type: String, required: true, default: 'Kenya' },
    },

    // ── Delivery tier ───────────────────────────────────────────────────
    // 'standard'       = Tier 1 — flat county rate applied at checkout
    // 'quote_required' = Tier 2 — admin must quote before order proceeds
    shippingTier: {
      type: String,
      enum: ['standard', 'quote_required'],
      default: 'standard',
    },

    // Snapshot of which zone the buyer's county mapped to at order time
    // Preserved even if the rate table is updated later
    shippingZone: {
      type: String,
      default: '',
    },

    // Flag: true if ANY item in the order is a Tier 2 category
    // Lets admin quickly filter orders needing delivery quote attention
    hasTier2Items: {
      type: Boolean,
      default: false,
    },

    // ── Tier 2 delivery quote flow ──────────────────────────────────────
    // These fields are only used when shippingTier = 'quote_required'
    deliveryQuote: {
      amount: { type: Number, default: 0 },    // admin enters the courier quote (KES)
      status: {
        type: String,
        enum: ['pending', 'sent', 'buyer_approved', 'buyer_rejected'],
        default: 'pending',
      },
      sentAt: { type: Date },    // when admin sent the quote notification
      approvedAt: { type: Date },    // when buyer clicked "Approve Quote"
      notes: { type: String },  // admin notes on the quote (e.g. courier name)
    },

    // ── Payment ─────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      required: true,
    },

    paymentResult: {
      id: { type: String },
      status: { type: String },
      updateTime: { type: String },
      emailAddress: { type: String },
    },

    // ── Pricing ─────────────────────────────────────────────────────────
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    // ShopZone's commission amount — recorded at order creation
    // Not automatically deducted in Phase 1 — used for admin reconciliation
    // In Phase 3+ this is auto-deducted from seller payout
    platformCommission: {
      type: Number,
      default: 0.0,
    },

    // ── Payment status ──────────────────────────────────────────────────
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    // ── Delivery status ─────────────────────────────────────────────────
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    // ── Seller payout (lightweight escrow) ──────────────────────────────
    // Admin sets this to true after:
    //   1. isDelivered = true
    //   2. No dispute raised within the window
    //   3. Admin manually releases payment to seller
    // Phase 3: auto-releases T+2 after isDelivered via a scheduled job
    // ── Seller delivery quote (Option B — structured fields only) ────────────
    // Seller submits a quote for Tier 2 orders. No free text fields —
    // all fields are structured to prevent off-platform contact.
    sellerQuote: {
      amount: { type: Number, default: 0 },
      courier: {
        type: String,
        enum: [
          'Fargo Courier',
          'Sendy',
          'G4S Courier',
          'Wells Fargo Kenya',
          'Matatu Network',
          'Boda Boda',
          'Own Delivery Vehicle',
          'Other',
        ],
      },
      estimatedDays: {
        type: String,
        enum: ['1-2 days', '2-3 days', '3-5 days', '5-7 days'],
      },
      submittedAt: { type: Date },
      // Status of the seller quote before admin forwards to buyer
      status: {
        type: String,
        enum: ['none', 'submitted', 'forwarded_to_buyer'],
        default: 'none',
      },
    },

    // ── Seller payout (lightweight escrow) ──────────────────────────────────
    sellerPayoutReleased: { type: Boolean, default: false },
    sellerPayoutReleasedAt: { type: Date },

    // ── Order lifecycle status ──────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Indexes for common admin queries ─────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });       // my orders, newest first
orderSchema.index({ status: 1 });                     // filter by status
orderSchema.index({ hasTier2Items: 1, 'deliveryQuote.status': 1 }); // admin quote queue
orderSchema.index({ sellerPayoutReleased: 1, isDelivered: 1 });     // payout queue

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;