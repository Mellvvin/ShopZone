// backend/models/Product.js
// ─────────────────────────────────────────────────────────────
// Product model — defines the shape of every product document
// stored in MongoDB.
//
// New fields added in Step 9:
//   tags        — array of keyword strings for tag-based search
//   isFeatured  — true = show in Featured Products on homepage
//   isOnSale    — true = show in Deals / On Sale section
//   isClearance — true = show in Clearance section
//   salePrice   — discounted price shown when on sale or clearance
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
    // Which admin/seller created this product
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
    // Wholesale unit type shown as a pill on product cards
    // e.g. 'Per Unit', 'Bale', 'Carton', 'Dozen', 'Kg', 'Box', 'Sack'
    unit: {
      type: String,
      default: 'Per Unit',
      enum: ['Per Unit', 'Bale', 'Carton', 'Dozen', 'Kg', 'Box', 'Sack'],
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