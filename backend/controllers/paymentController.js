// backend/controllers/paymentController.js
// ─────────────────────────────────────────────────────────────
// Handles payment creation and confirmation for ShopZone orders.
//
// Routes:
//   POST /api/payments/order/:orderId  — create a pending payment
//   PUT  /api/payments/:id/confirm     — admin confirms a payment
//   GET  /api/payments/order/:orderId  — get payment for an order
//   GET  /api/payments                 — admin: list all payments
//
// Step 20 note:
//   When M-Pesa STK Push is wired, the Daraja callback will call
//   the same confirmPayment logic used here for manual confirmations.
//   The Payment model is already structured to accept all STK fields.
// ─────────────────────────────────────────────────────────────
const Payment      = require('../models/Payment');
const Order        = require('../models/Order');
const Notification = require('../models/Notification');

// ── Local KES formatter for error messages ───────────────────
const formatKES = (n) =>
  `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

// @desc    Create a pending payment record for an order
// @route   POST /api/payments/order/:orderId
// @access  Private
// Called when an order is placed so there is always a Payment
// document waiting to be confirmed. Also used if admin needs to
// manually create a payment record after the fact.
const createPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order owner or admin can create a payment for it
    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    // Check if a payment already exists for this order
    const existing = await Payment.findOne({ orderId: order._id });
    if (existing) {
      return res.json(existing); // return existing instead of creating duplicate
    }

    const payment = new Payment({
      orderId: order._id,
      userId:  order.user,
      method:  req.body.method || 'mpesa_manual',
      amount:  order.totalPrice,
      status:  'pending',
    });

    const saved = await payment.save();

    // Link the payment back to the order
    order.paymentId = saved._id;
    await order.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm a payment (admin manual confirmation)
// @route   PUT /api/payments/:id/confirm
// @access  Private/Admin
//
// Admin pastes the raw M-Pesa message or fills in the reference.
// This marks the payment confirmed, marks the order as paid,
// links paymentId on the order, and sends a notification to buyer.
const confirmPayment = async (req, res) => {
  try {
    const {
      rawMessage,
      mpesaReceiptNumber,
      reference,
      method,
      notes,
    } = req.body;

   const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'confirmed') {
      return res.status(400).json({ message: 'Payment is already confirmed' });
    }

    // ── Fetch the order first — needed for amount validation ──
    // Must come before the validation block to avoid the
    // "Cannot access 'order' before initialization" error.
    const order = await Order.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ── Amount validation ────────────────────────────────────
    // Reject if the payment amount on the record is less than 95%
    // of the order total. This blocks admin accidentally confirming
    // a KES 9 M-Pesa message on a KES 100,000 order.
    // The 5% tolerance handles rounding differences across methods.
    // STK Push in Step 20 will validate exact amounts automatically.
    const minimumAcceptable = order.totalPrice * 0.95;
    if (payment.amount < minimumAcceptable) {
      return res.status(400).json({
        message: `Payment amount of ${formatKES(payment.amount)} is less than 95% of the order total of ${formatKES(order.totalPrice)}. Update the payment amount before confirming, or verify you have the correct M-Pesa message.`,
      });
    }

    // ── Parse M-Pesa receipt number from raw message if not provided ──
    // Simple regex extraction — if admin pastes the full SMS text,
    // we pull out the receipt code automatically.
    // Pattern: starts with capital letters and digits, e.g. QHJ4X2K9PL
    let receiptNumber = mpesaReceiptNumber || '';
    if (!receiptNumber && rawMessage) {
      const match = rawMessage.match(/\b([A-Z0-9]{8,12})\b/);
      if (match) receiptNumber = match[1];
    }

    // ── Update the Payment document ──────────────────────────
    payment.status             = 'confirmed';
    payment.rawMessage         = rawMessage         || '';
    payment.mpesaReceiptNumber = receiptNumber;
    payment.reference          = reference          || '';
    payment.confirmedBy        = req.user._id;
    payment.confirmedAt        = new Date();
    if (method) payment.method = method;
    if (notes)  payment.notes  = notes;

    await payment.save();

    order.isPaid    = true;
    order.paidAt    = new Date();
    order.paymentId = payment._id;
    order.paymentResult = {
      id:           receiptNumber || reference || 'MANUAL',
      status:       'COMPLETED',
      update_time:  new Date().toISOString(),
      emailAddress: '',
    };
    // Advance order status from pending to processing
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    await order.save();

    // ── Create notification for the buyer ────────────────────
    // This is the first place in the codebase where a Notification
    // is created for a payment event — closing Issue 6 partially.
const notification = new Notification({
      userId:         order.user,
      type:           'transactional',
      title:          'Payment Confirmed',
      message:        `Your payment of KES ${order.totalPrice.toLocaleString('en-KE', { minimumFractionDigits: 2 })} for order #${order._id.toString().slice(-8).toUpperCase()} has been received. Your order is now being processed.`,
      relatedOrderId: order._id,
      link:           `/order/${order._id}`,
      isRead:         false,
    });

    await notification.save();

    res.json({
      message: 'Payment confirmed. Order marked as paid.',
      payment,
      orderId: order._id,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment for a specific order
// @route   GET /api/payments/order/:orderId
// @access  Private
// Used by OrderPage to show the current payment status and details.
const getPaymentByOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order owner or admin can view the payment
    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    const payment = await Payment.findOne({ orderId: req.params.orderId })
      .populate('confirmedBy', 'name');

    if (!payment) {
      return res.status(404).json({ message: 'No payment record found for this order' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all payments (admin only)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate('orderId', 'totalPrice status')
      .populate('userId', 'name email')
      .populate('confirmedBy', 'name');

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a pending payment record before confirmation
// @route   PUT /api/payments/:id
// @access  Private/Admin
//
// Allows admin to correct the amount, method, or notes on a
// payment record before confirming it. Cannot edit confirmed payments.
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'confirmed') {
      return res.status(400).json({
        message: 'Cannot edit a confirmed payment. Contact support if a correction is needed.',
      });
    }

    const { amount, method, notes } = req.body;

    // Validate amount if provided
    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number.' });
      }
      payment.amount = numAmount;
    }

    if (method)           payment.method = method;
    if (notes !== undefined) payment.notes  = notes;

    const updated = await payment.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Exports ──────────────────────────────────────────────────
module.exports = {
  createPayment,
  confirmPayment,
  updatePayment,
  getPaymentByOrder,
  getPayments,
};