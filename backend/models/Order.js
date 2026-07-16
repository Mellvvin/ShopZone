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
//   • Added handoff, deliveryConfirmedBy, disputeWindowExpiresAt — the
//     hybrid delivery confirmation system. Seller confirms handoff to
//     courier (mandatory, self-serve, no admin approval needed) which
//     starts a 5-day window for the buyer to confirm receipt; if the
//     buyer takes no action, the order auto-confirms as delivered on
//     next fetch. A 72-hour dispute window then gates seller payout
//     eligibility, during which the buyer can report a problem via
//     the existing Enquiries flow.
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

  // ── Wholesale unit snapshot (Step 11 / ISS-013) ──────────────────────
  // Same protective principle as priceAtPurchase — these three fields
  // are copied from the Product document at the exact moment the order
  // is created and are never looked up live afterward. This guarantees
  // the unit context a buyer saw and paid against can never silently
  // change if the seller edits the product later.
  //
  // unitType      — full buyer-facing unit, e.g. "Carton", "Sack", "Bale"
  // itemsPerUnit  — how many individual pieces are inside one unit
  // weightPerUnit — weight in kg of one unit (also used by Tier 2 logic)
  //
  // All optional with sensible defaults so existing orders placed before
  // this field existed are unaffected and simply show no breakdown.
  unitType:      { type: String, default: 'Per Unit' },
  itemsPerUnit:  { type: Number, default: null },
  weightPerUnit: { type: Number, default: null },

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

// ── Handling instructions — structured tags only, never free text ───
    // A buyer flagging "fragile" or "keep upright" is legitimate packaging
    // guidance the seller genuinely needs. A free-text field for this same
    // purpose was rejected — a buyer could write a phone number or contact
    // request into it, and that text would be shown directly to a seller,
    // breaking the golden rule. Predefined checkbox tags close that leak
    // vector completely rather than filtering it after the fact, exactly
    // matching the pattern already proven on the seller delivery quote
    // form (submitSellerQuote — structured fields only, no free text).
    handlingTags: {
      type: [String],
      enum: ['fragile', 'keep_upright', 'stack_limit', 'perishable', 'no_compression'],
      default: [],
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

  // ── Payment reference ────────────────────────────────────────────────
    // Set after payment is confirmed. Links this order to its Payment
    // document so the full payment audit trail is always reachable.
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Payment',
    },

    // ── Payment status ──────────────────────────────────────────────────
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

   // ── Seller handoff to courier (mandatory step) ───────────────────────
    // Recorded when the seller confirms goods have left their premises.
    // This is the trigger that starts the delivery clock — status moves
    // to 'dispatched' the moment this is set. No admin approval required;
    // this is a self-serve seller action by design, so sellers are never
    // blocked waiting on admin to release outgoing stock.
    handoff: {
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
      trackingRef: { type: String, default: '' }, // optional plate number / tracking code
      confirmedAt: { type: Date },
    },

    // ── Delivery status ─────────────────────────────────────────────────
    // isDelivered becomes true through one of three paths, recorded in
    // deliveryConfirmedBy for the admin audit trail and the seller's
    // My Payments timeline:
    //   'buyer' — buyer clicked Confirm Received
    //   'auto'  — 5 days passed after handoff with no buyer action
    //   'admin' — admin manually marked delivered (edge cases only)
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    deliveryConfirmedBy: {
      type: String,
      enum: ['buyer', 'auto', 'admin', null],
      default: null,
    },

    // ── Dispute window ─────────────────────────────────────────────────
    // Set the moment isDelivered becomes true, regardless of which path
    // triggered it. Seller payout cannot be released by admin until this
    // has passed. Buyer sees a "Report a Problem" option (routes into the
    // existing Enquiries flow with this order pre-attached) any time
    // before this expires.
    disputeWindowExpiresAt: { type: Date },

    // ── Seller payout (lightweight escrow) ──────────────────────────────
    // Admin sets this to true after:
    //   1. isDelivered = true
    //   2. disputeWindowExpiresAt has passed
    //   3. Admin manually releases payment to seller
    // Auto-release on a schedule remains a future enhancement — for now
    // admin always takes the explicit final action.
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
orderSchema.index({ status: 1, 'handoff.confirmedAt': 1 });         // auto-confirm sweep on fetch

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;