// backend/models/Enquiry.js
// ─────────────────────────────────────────────────────────────
// Enquiry model — catch-all destination for all form submissions
// on ShopZone until the proper dedicated models are built.
//
// Migration path:
//   type: 'seller_application' → migrates to seller application
//     model when Step 6 (Seller Approval) is built
//   type: 'bulk_order' → migrates to RFQ model when Step 8
//     (Manual RFQ Flow) is built
//   type: 'contact' | 'support' → migrates to support ticket
//     model when Step 15 (Support Tickets) is built
//
// Forms that post here:
//   BulkOrdersPage    → type: 'bulk_order'
//   BecomeSellerPage  → type: 'seller_application'
//   ContactPage       → type: 'contact'
//   General enquiries → type: 'general'
// ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const enquirySchema = mongoose.Schema(
  {
    // ── Enquiry type ────────────────────────────────────────
    // Determines which admin queue this appears in and which
    // dedicated model it will migrate to in future steps.
    type: {
      type: String,
      required: true,
      enum: ['bulk_order', 'seller_application', 'contact', 'general', 'support'],
    },

    // ── Submitter identity ──────────────────────────────────
    // All name/email fields are required so admin always has
    // a way to respond. Phone and business are optional because
    // ShopZone serves both businesses AND individual buyers.
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    // Phone is optional — individuals may not have a business phone
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    // Business name is optional — individual buyers may not have one
    business: {
      type: String,
      default: '',
      trim: true,
    },

    // ── Message ─────────────────────────────────────────────
    // The main free-text message or notes from the submitter.
    message: {
      type: String,
      default: '',
      trim: true,
    },

    // ── Structured form data ─────────────────────────────────
    // Stores the full form payload as a flexible object.
    // This allows each form to submit its own fields (item,
    // quantity, county, budget for bulk orders; products,
    // county for seller applications etc.) without needing
    // a separate model for each form type.
    // When forms migrate to their dedicated models the relevant
    // fields are extracted from this object.
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ── Status ──────────────────────────────────────────────
    // Tracks where this enquiry is in the admin workflow.
    //   new       — just submitted, admin has not seen it yet
    //   read      — admin has opened and read it
    //   actioned  — admin has taken action (replied, sourced etc.)
    //   closed    — fully resolved and closed
    status: {
      type: String,
      enum: ['new', 'read', 'actioned', 'closed'],
      default: 'new',
    },

 // ── User link ────────────────────────────────────────────
    // If the submitter is a logged-in registered user, store
    // their user ID here so admin can see full enquiry history
    // per user and diagnose recurring issues.
    // Optional — anonymous / logged-out submissions leave this null.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Order link ───────────────────────────────────────────
    // Set when this enquiry is a support issue about a specific order.
    // type: 'support' enquiries should always have this set.
    // Links the enquiry to the order so admin can see full order
    // context alongside the complaint without asking the buyer for the ID.
 orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    // ── Attachments ──────────────────────────────────────────
    // Screenshot URLs uploaded by the submitter when they cannot
    // describe an issue in words. Each entry is the path returned
    // by POST /api/upload — the same upload endpoint already used
    // for seller product images. Stored as plain strings, not
    // ObjectIds. Used by ContactPage, BulkOrdersPage, and
    // BecomeSellerPage forms.
    attachments: {
      type: [String],
      default: [],
    },

    // ── Resolution tracking ──────────────────────────────────
    // Records when and by whom an enquiry was resolved.
    // Used for the resolved/unresolved filter in the admin view.
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Admin notes ──────────────────────────────────────────
    // Internal notes visible only to admin. Used to record
    // sourcing progress, contact attempts, or follow-up needed.
    // Never shown to the customer.
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt to every document
    timestamps: true,
  }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;