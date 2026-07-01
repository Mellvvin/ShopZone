// backend/routes/sellerRoutes.js
// ─────────────────────────────────────────────────────────────
// All seller dashboard routes.
// Every route requires protect + seller middleware —
// only approved sellers can access these endpoints.
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const {
  getSellerDashboard,
  getSellerProducts,
  getSellerOrders,
  getSellerProfile,
  updateSellerProfile,
  createSellerProduct,
  updateSellerProduct,
} = require('../controllers/sellerController');
const { protect, seller, approvedSellerOnly } = require('../middleware/authMiddleware');

// GET /api/seller/dashboard — overview stats
router.get('/dashboard', protect, seller, getSellerDashboard);

// GET  /api/seller/products — seller's own products in every status,
//      including suspended/archived — sellers must always be able to
//      see their own inventory (ISS-018).
// POST /api/seller/products — submit a BRAND NEW product. Gated by
//      approvedSellerOnly, not seller — suspended sellers can manage
//      what they already have but cannot add new inventory.
router.route('/products')
  .get(protect, seller, getSellerProducts)
  .post(protect, approvedSellerOnly, createSellerProduct);

// PUT /api/seller/products/:id — edit an EXISTING product the seller
//     owns. Gated by seller (not approvedSellerOnly) specifically so
//     a suspended seller can fix a rejected/needs_changes/archived
//     product — that is the whole point of keeping their dashboard
//     visible while suspended (ISS-019).
router.route('/products/:id')
  .put(protect, seller, updateSellerProduct);

// GET /api/seller/orders — orders containing seller's products (customer identity hidden)
router.get('/orders', protect, seller, getSellerOrders);

// GET /api/seller/profile — seller's own profile data
// PUT /api/seller/profile — update seller's own profile data
router.route('/profile')
  .get(protect, seller, getSellerProfile)
  .put(protect, seller, updateSellerProfile);

module.exports = router;