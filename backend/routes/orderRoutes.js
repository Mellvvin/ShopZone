const express = require('express');
const router = express.Router();
const {
  createOrder,           // Changed from addOrderItems
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getAllOrders,          // Changed from getOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrder)        // Updated name here
  .get(protect, admin, getAllOrders); // Updated name here

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

module.exports = router;