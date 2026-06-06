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
} = require('../controllers/sellerController');
const { protect, seller } = require('../middleware/authMiddleware');

// GET /api/seller/dashboard — overview stats
router.get('/dashboard', protect, seller, getSellerDashboard);

// GET /api/seller/products — seller's own products
router.get('/products', protect, seller, getSellerProducts);

// GET /api/seller/orders — orders containing seller's products (customer identity hidden)
router.get('/orders', protect, seller, getSellerOrders);

// GET /api/seller/profile — seller's own profile data
// PUT /api/seller/profile — update seller's own profile data
router.route('/profile')
  .get(protect, seller, getSellerProfile)
  .put(protect, seller, updateSellerProfile);

module.exports = router;