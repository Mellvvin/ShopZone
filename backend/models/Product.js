// backend/models/Product.js
// ─────────────────────────────────────────────────────────────
// Product model — defines the shape of every product document
// stored in MongoDB.
//
// Fields added in Step 9:
//   tags        — array of keyword strings for tag-based search
//   isFeatured  — true = show in Featured Products on homepage
//   isOnSale    — true = show in Deals / On Sale section
//   isClearance — true = show in Clearance section
//   salePrice   — discounted price shown when on sale or clearance
//
// Fields added in Block A (wholesale clarity + brand):
//   brand               — product brand name e.g. "Unilever", "Samsung"
//   unitType            — richer unit enum replacing the old unit field
//   minimumOrderQuantity — MOQ — minimum units a buyer must order
//   itemsPerUnit        — how many pieces inside one carton/bale/sack
//   weightPerUnit       — weight of one unit in kg
//   dimensions          — physical size string e.g. "40 x 30 x 20 cm"
//   isBulkOnly          — if true, cannot be bought as single pieces
//   leadTimeDays        — days from confirmed order to dispatch
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ── Review sub-schema ─────────────────────────────────────────
// Each product has an array of reviews embedded directly in the
// product document rather than a separate collection.
const reviewSchema = mongoose.Schema(
  {
    // The display name of the reviewer
    name: {
      type: String,
      required: true,
    },
    // Star rating 1–5
    rating: {
      type: Number,
      required: true,
    },
    // Written review comment
    comment: {
      type: String,
      required: true,
    },
    // Reference to the User who left this review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    // Automatically adds createdAt and updatedAt to each review
    timestamps: true,
  }
);

// ── Product schema ────────────────────────────────────────────
const productSchema = mongoose.Schema(
  {
  // ── Ownership ───────────────────────────────────────────
    // Which admin account created this product listing
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Which seller supplies this product.
    // Set by admin when approving a seller's product submission.
    // Optional — products without a seller are admin-managed directly.
    // Used by the seller dashboard to filter products per seller.
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'User',
    },

    // ── Core product info ───────────────────────────────────
    name: {
      type: String,
      required: true,
    },
    // Path to the uploaded image file e.g. /uploads/image-123.jpg
    image: {
      type: String,
      default: '/images/sample.jpg',
    },
    // Top-level category e.g. 'Electronics', 'Fashion & Apparel'
    category: {
      type: String,
      required: true,
    },
    // Detailed product description shown on the product page
    description: {
      type: String,
      required: true,
    },

    // ── Pricing ─────────────────────────────────────────────
    // Standard full price of the product
    price: {
      type: Number,
      default: 0,
    },
    // ── NEW: Sale price ─────────────────────────────────────
    // Discounted price shown when isOnSale or isClearance is true.
    // If null, the product has no active discount.
    salePrice: {
      type: Number,
      default: null,
    },

  // ── Inventory ────────────────────────────────────────────
    // How many units are currently in stock
    countInStock: {
      type: Number,
      default: 0,
    },

    // ── Legacy unit field — kept for backward compatibility ──
    // The old unit field is preserved so existing products and
    // any code still referencing product.unit does not break.
    // New products should use unitType instead.
    unit: {
      type: String,
      default: 'Per Unit',
      enum: ['Per Unit', 'Bale', 'Carton', 'Dozen', 'Kg', 'Box', 'Sack'],
    },

    // ── NEW: Brand ───────────────────────────────────────────
    // The product brand name e.g. "Unilever", "Samsung", "Bidco".
    // Used by the BrandsPage to group and filter products by brand.
    // Optional — products without a brand set simply won't appear
    // on the BrandsPage brand filter.
    brand: {
      type: String,
      default: '',
      trim: true,
    },

    // ── NEW: Rich unit type ──────────────────────────────────
    // Replaces the old unit enum with a more complete wholesale
    // unit set. Shown prominently on product cards and detail pages
    // so buyers know exactly what one unit means before ordering.
    unitType: {
      type: String,
      default: 'Per Unit',
      enum: [
        'Per Unit',   // single item
        'Bale',       // compressed fabric or clothing bundle
        'Carton',     // sealed cardboard box of items
        'Sack',       // large woven bag e.g. 50kg maize sack
        'Dozen',      // 12 pieces
        'Kg',         // sold by weight
        'Box',        // generic box
        'Roll',       // fabric, wire, or sheet material on a roll
        'Litre',      // liquid products
        'Pallet',     // full pallet load
        'Piece',      // individual piece within a larger unit
        'Pack',       // sealed multi-item pack
      ],
    },

    // ── NEW: Minimum Order Quantity ──────────────────────────
    // The minimum number of units a buyer must add to cart.
    // Enforced at the cart and checkout level — buyers cannot
    // proceed below this quantity. Defaults to 1 (no minimum).
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ── NEW: Items per unit ──────────────────────────────────
    // How many individual pieces are inside one unit.
    // Example: a carton of Sunlight soap contains 24 bars.
    // Shown on the product detail page to help buyers calculate
    // cost per piece. Optional — leave null if not applicable.
    itemsPerUnit: {
      type: Number,
      default: null,
    },

    // ── NEW: Weight per unit ─────────────────────────────────
    // The weight of one unit in kilograms.
    // Used by the Tier 2 delivery quote system to calculate
    // shipping costs for heavy or bulk orders.
    // Optional — leave null if not applicable.
    weightPerUnit: {
      type: Number,
      default: null,
    },

    // ── NEW: Dimensions ──────────────────────────────────────
    // Physical dimensions of one unit as a human-readable string.
    // Example: "60 x 40 x 30 cm" or "50kg sack, 80cm tall".
    // Shown on product detail page. Optional.
    dimensions: {
      type: String,
      default: '',
      trim: true,
    },

  // ── Submission status ────────────────────────────────────
    // Controls whether this product is publicly visible.
    // Seller-submitted products start as 'submitted' and require
    // admin approval before becoming 'approved' (publicly visible).
    // Admin-created products default to 'approved' immediately.
    //
    // draft        — seller started but hasn't submitted yet
    // submitted    — seller submitted, waiting for admin review
    // needs_changes — admin sent back with feedback
    // approved     — publicly visible on the storefront
    // rejected     — permanently declined
    // archived     — removed from public view, kept for records
    status: {
      type: String,
      enum: ['draft', 'submitted', 'needs_changes', 'approved', 'rejected', 'archived'],
      default: 'approved', // admin-created products are live immediately
    },

    // Admin feedback when status is 'needs_changes' or 'rejected'
    adminFeedback: {
      type: String,
      default: '',
    },

    // ── NEW: Bulk only flag ───────────────────────────────────
    // If true, this product cannot be purchased as single pieces.
    // The product detail page and cart will enforce the MOQ and
    // make it clear this is a wholesale-only listing.
    isBulkOnly: {
      type: Boolean,
      default: false,
    },

    // ── NEW: Lead time in days ───────────────────────────────
    // Number of days from a confirmed order to dispatch.
    // Example: 2 means the seller needs 2 days to prepare the
    // goods before handing to courier. Shown on product detail
    // page so buyers can plan their restocking schedules.
    // Optional — null means lead time is not specified.
    leadTimeDays: {
      type: Number,
      default: null,
    },

    // ── Reviews ──────────────────────────────────────────────
    // Array of embedded review documents using the reviewSchema above
    reviews: [reviewSchema],
    // Average star rating — recalculated every time a review is added
    rating: {
      type: Number,
      default: 0,
    },
    // Total number of reviews — kept in sync with reviews.length
    numReviews: {
      type: Number,
      default: 0,
    },

    // ── NEW: Tags ────────────────────────────────────────────
    // Array of keyword strings used for tag-based search and filtering.
    // Example: ['bulk', 'wholesale', 'imported', 'fresh', 'organic']
    // Stored in lowercase for consistent matching.
    tags: {
      type: [String],
      default: [],
    },

    // ── NEW: Homepage / merchandising flags ─────────────────
    // These three boolean flags control where the product appears
    // on the homepage and special offers page.

    // isFeatured — true = product appears in the Featured Products
    // section on the homepage. Set by admin in the product edit page.
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // isOnSale — true = product appears in the Deals / On Sale section.
    // Should also have a salePrice set when this is true.
    isOnSale: {
      type: Boolean,
      default: false,
    },
    // isClearance — true = product appears in the Clearance section.
    // Typically used for end-of-line or overstocked items.
    isClearance: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically adds createdAt and updatedAt to each product
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;