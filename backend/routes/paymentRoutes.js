// backend/routes/paymentRoutes.js
// ─────────────────────────────────────────────────────────────
// Payment routes.
//
// Private (logged in):
//   POST /api/payments/order/:orderId   — create pending payment
//   GET  /api/payments/order/:orderId   — get payment for order
//
// Admin only:
//   PUT  /api/payments/:id/confirm      — confirm a payment
//   GET  /api/payments                  — list all payments
//
// Note: specific routes (order/:orderId, :id/confirm) must be
// registered before the generic /:id route to avoid Express
// treating 'order' or 'confirm' as a MongoDB ObjectId.
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();

const {
  createPayment,
  confirmPayment,
  getPaymentByOrder,
  getPayments,
  updatePayment, // For future use if we want to allow editing pending payments
} = require('../controllers/paymentController');

const { protect, admin } = require('../middleware/authMiddleware');

// ── Order-scoped routes — must be before /:id ─────────────────
router.post('/order/:orderId',  protect,       createPayment);
router.get('/order/:orderId',   protect,       getPaymentByOrder);

// ── Admin routes ──────────────────────────────────────────────
router.put('/:id/confirm',      protect, admin, confirmPayment);
router.get('/',                 protect, admin, getPayments);

// ── Update a pending payment record (admin only) ──────────────
// Used to correct amount or method before confirming.
router.put('/:id', protect, admin, updatePayment);


module.exports = router;