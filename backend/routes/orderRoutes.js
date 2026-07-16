// backend/routes/orderRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone Order Routes — updated for Step 12/14.5
//
// NEW ROUTES ADDED:
//   GET  /pending-quotes           — admin: Tier 2 orders awaiting quote
//   GET  /payout-queue             — admin: orders ready for seller payout
//   PUT  /:id/delivery-quote/send  — admin: send delivery quote to buyer
//   PUT  /:id/delivery-quote/approve — buyer: approve delivery quote
//   PUT  /:id/delivery-quote/reject  — buyer: reject delivery quote
//   PUT  /:id/release-payout       — admin: release seller payout (escrow)
//
// IMPORTANT: Specific named routes (/myorders, /pending-quotes, /payout-queue)
// must be registered BEFORE the /:id param route, otherwise Express will
// interpret 'myorders' as an order ID and the route will never match.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  confirmDelivery,
  cancelOrder,
  getMyOrders,
  getAllOrders,
  sendDeliveryQuote,
  approveDeliveryQuote,
  rejectDeliveryQuote,
  releaseSellerPayout,
  getPendingQuoteOrders,
  getPayoutQueue,
  submitSellerQuote,
  updateOrderShipping,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// ── Named collection routes (must be before /:id) ─────────────────────────
router.route('/')
  .post(protect, createOrder)       // buyer places an order
  .get(protect, admin, getAllOrders); // admin gets all orders

// My orders — logged-in buyer's order history
router.get('/myorders', protect, getMyOrders);

// Admin: orders waiting for a Tier 2 delivery quote
router.get('/pending-quotes', protect, admin, getPendingQuoteOrders);

// Admin: orders ready to have seller payout released
router.get('/payout-queue', protect, admin, getPayoutQueue);

// ── Single order routes (/api/orders/:id/...) ─────────────────────────────
router.get('/:id', protect, getOrderById);

// Payment — buyer marks order as paid (Phase 1: admin confirms; Phase 3: auto via Daraja)
router.put('/:id/pay', protect, updateOrderToPaid);

// Delivery — admin marks order as delivered
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

// Delivery — buyer confirms receipt (only valid once seller has dispatched)
router.put('/:id/confirm-delivery', protect, confirmDelivery);

// Cancel — buyer (unpaid only) or admin (any time)
router.put('/:id/cancel', protect, cancelOrder);

// ── Tier 2 delivery quote flow ─────────────────────────────────────────────
// Admin sends quote → buyer sees it in dashboard → buyer approves or rejects
// Seller submits structured delivery quote for Tier 2 order
router.put('/:id/seller-quote/submit', protect, submitSellerQuote);

router.put('/:id/delivery-quote/send', protect, admin, sendDeliveryQuote);
router.put('/:id/delivery-quote/approve', protect, approveDeliveryQuote);
router.put('/:id/delivery-quote/reject', protect, rejectDeliveryQuote);

// ── Payout release (lightweight escrow) ───────────────────────────────────
// Admin explicitly releases seller payment after delivery confirmed
router.put('/:id/release-payout', protect, admin, releaseSellerPayout);

// ── Generic order update route (for future use) ───────────────────────────
// router.put('/:id', protect, updateOrder);
router.put('/:id/shipping', protect, admin, updateOrderShipping);

module.exports = router;