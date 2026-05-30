// backend/routes/productRoutes.js
// ─────────────────────────────────────────────────────────────
// Product routes — all /api/products endpoints.
//
// IMPORTANT: specific named routes like /brands must be
// registered BEFORE the /:id param route. If /:id comes first,
// Express matches the word "brands" as a MongoDB ObjectId and
// throws a CastError before the correct handler runs.
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductBrands,
  getPlatformStats,
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');

// ── Public: get all products with optional filters ────────────
// GET /api/products
// GET /api/products?keyword=rice&category=Food+%26+Grocery
// GET /api/products?brand=Unilever
// GET /api/products?featured=true
// GET /api/products?deals=true
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// ── Public: get distinct brand names with product counts ──────
// GET /api/products/brands
// Must be registered before /:id to avoid brand being cast as ObjectId
router.get('/brands', getProductBrands);

// ── Public: platform-wide stats for stats strips ──────────────
// GET /api/products/stats
// Returns totalProducts, totalOrdersFulfilled, totalApprovedSellers,
// countiesServed, totalBulkEnquiries, totalCategories
// Also registered before /:id for the same reason as /brands
router.get('/stats', getPlatformStats);

// ── Protected: submit a product review ───────────────────────
// POST /api/products/:id/reviews
router.route('/:id/reviews')
  .post(protect, createProductReview);

// ── Public/Admin: single product by ID ───────────────────────
// GET    /api/products/:id
// PUT    /api/products/:id  (admin only)
// DELETE /api/products/:id  (admin only)
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;