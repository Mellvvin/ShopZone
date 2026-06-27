// backend/controllers/orderController.js
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone Order Controller — updated for Step 12/14.5
//
// CHANGES FROM ORIGINAL:
//
//   createOrder:
//     • Validates stock ATOMICALLY before creating the order.
//       Uses MongoDB findOneAndUpdate with $gte check — if two buyers
//       try to buy the last 10 units simultaneously, only one succeeds.
//       The other gets a clear "insufficient stock" error. No overselling.
//     • Decrements countInStock for every item after stock is confirmed.
//     • Calculates shippingPrice from the county-based rate table
//       (shippingRates.js) instead of accepting it blindly from the frontend.
//       Frontend can no longer manipulate the shipping price.
//     • Detects Tier 2 categories — sets shippingTier, hasTier2Items,
//       deliveryQuote.status = 'pending' for bulk/heavy goods orders.
//     • Records platformCommission at order creation for admin reconciliation.
//     • Snapshots priceAtPurchase on each item so price changes don't
//       affect existing orders.
//     • Validates that shippingAddress.county is present.
//
//   approveDeliveryQuote (NEW):
//     • Buyer approves a Tier 2 delivery quote sent by admin.
//     • Updates deliveryQuote.status to 'buyer_approved'.
//
//   rejectDeliveryQuote (NEW):
//     • Buyer rejects the quote — order status set to 'cancelled',
//       stock is restored.
//
//   sendDeliveryQuote (NEW — admin only):
//     • Admin enters the courier quote amount and sends it to the buyer.
//
//   releaseSellerPayout (NEW — admin only):
//     • Admin releases funds to seller after delivery confirmed.
//       Sets sellerPayoutReleased = true. Phase 3: this becomes automatic.
//
//   updateOrderToDelivered:
//     • Now also updates order status to 'delivered'.
//
//   cancelOrder:
//     • Now RESTORES stock when an order is cancelled (was missing before).
//
// ALL OTHER FUNCTIONS unchanged in behaviour.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const {
  getShippingRate,
  hasAnyTier2Item,
  isFullyTier2Order,
  SHIPPING_CONSTANTS,
} = require('../data/shippingRates');

// ─────────────────────────────────────────────────────────────────────────
// HELPER: restore stock for a list of order items
// Used by cancelOrder and rejectDeliveryQuote
// ─────────────────────────────────────────────────────────────────────────
const _restoreStock = async (orderItems) => {
  for (const item of orderItems) {
    const updatedProduct = await Product.findByIdAndUpdate(
      item.product,
      { $inc: { countInStock: item.qty } }, // add back the quantity
      { new: true }
    );

    // ── Stock restored notification ────────────────────────────────
    // Lower urgency than the low/out-of-stock warnings — this is good
    // news (an order was cancelled or a delivery quote was rejected,
    // so stock went back up), but it keeps the seller's dashboard
    // figures from silently drifting out of sync with reality.
    // Skipped for admin-managed products with no seller. Wrapped in
    // try/catch — must never block the calling cancel/reject flow.
    if (updatedProduct?.seller) {
      try {
        const restoredNotification = new Notification({
          userId:  updatedProduct.seller,
          type:    'transactional',
          title:   'Stock Restored',
          message: `An order for "${updatedProduct.name}" was cancelled or its delivery quote was rejected. ${item.qty} unit(s) were added back to your stock — you now have ${updatedProduct.countInStock} available.`,
          link:    '/seller/dashboard',
          isRead:  false,
        });
        await restoredNotification.save();
      } catch (notifErr) {
        console.error('Stock restored notification failed:', notifErr.message);
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────
// createOrder
// POST /api/orders
// Protected — buyer must be logged in
// ─────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,    // calculated on frontend, we re-verify server-side
      taxPrice,      // 16% VAT — re-verified server-side
    } = req.body;

    // ── Basic validation ────────────────────────────────────────────────
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.county) {
      return res.status(400).json({
        message: 'Shipping address must include a county for delivery pricing',
      });
    }

    // ── Step 1: Atomic stock check + decrement for EVERY item ───────────
    // We process items sequentially. If any item fails the stock check,
    // we restore all previously decremented items and reject the order.
    // This guarantees no partial fulfillment bugs.
    const decrementedItems = []; // track what we've already decremented

    for (const item of orderItems) {
      // ── Suspended-seller guard (ISS-016 follow-up) ──────────────────
      // The product cascade in userController.js's updateSellerStatus
      // already archives a suspended seller's approved products, which
      // pulls them off the public listing — but a buyer who already had
      // the product page or an old cart open before the suspension
      // happened could still reach checkout with stale client state, or
      // hit this endpoint directly. This closes that race the same way
      // price is re-verified server-side rather than trusted from the
      // frontend. Runs before the atomic stock decrement so a blocked
      // item never touches stock at all — nothing to restore if it fails.
      const sellerCheck = await Product.findById(item.product)
        .select('seller name')
        .populate('seller', 'sellerStatus');

      if (sellerCheck?.seller?.sellerStatus === 'suspended') {
        await _restoreStock(decrementedItems);
        return res.status(400).json({
          message: `"${sellerCheck.name}" is currently unavailable — this seller's account is temporarily suspended. Please remove this item from your cart and try again.`,
          productId: item.product,
        });
      }

      // Atomic operation:
      // "Find this product where countInStock >= qty requested, then decrement"
      // If countInStock < qty, the query returns null — no update happens.
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          countInStock: { $gte: item.qty }, // ATOMIC: only succeeds if stock is sufficient
        },
        {
          $inc: { countInStock: -item.qty }, // decrement atomically
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Stock check failed for this item.
        // Check if the product even exists or if it's just out of stock.
        const product = await Product.findById(item.product);

        if (!product) {
          // Restore any items we already decremented before this failure
          await _restoreStock(decrementedItems);
          return res.status(404).json({
            message: `Product not found: ${item.name}`,
          });
        }

        // Product exists but insufficient stock
        await _restoreStock(decrementedItems);
        return res.status(400).json({
          message: `Insufficient stock for "${item.name}". ` +
            `Requested: ${item.qty}, Available: ${product.countInStock}. ` +
            `Please update your cart or use the Request Goods feature to ` +
            `find a supplier with sufficient stock.`,
          productId: item.product,
          available: product.countInStock,
        });
      }

      // This item decremented successfully — track it in case a later item fails
      decrementedItems.push({ product: item.product, qty: item.qty });

      // ── Low stock notification (ISS-006) ───────────────────────────
      // Fires once stock has been decremented for this item. Only
      // notifies if the product has an assigned seller — admin-managed
      // products with no seller have nobody to notify.
      // Threshold is <= 5: covers both "running low" and "just hit zero",
      // using two different message tones so a seller can tell which
      // situation they're in without opening the dashboard.
      // Wrapped in try/catch — a notification failure must never roll
      // back or interrupt order creation, exactly like the other five
      // order-event notifications in this file.
      if (updatedProduct.seller && updatedProduct.countInStock <= 5) {
        try {
          const isOutOfStock = updatedProduct.countInStock === 0;
          const lowStockNotification = new Notification({
            userId:  updatedProduct.seller,
            type:    'transactional',
            title:   isOutOfStock ? 'Out of Stock Warning' : 'Low Stock Warning',
            message: isOutOfStock
              ? `Your product "${updatedProduct.name}" is now out of stock. Update your stock count on your dashboard so buyers know when it will be available again.`
              : `Your product "${updatedProduct.name}" is running low — only ${updatedProduct.countInStock} left. Update your stock count soon to avoid going out of stock.`,
            link:    '/seller/dashboard',
            isRead:  false,
          });
          await lowStockNotification.save();
        } catch (notifErr) {
          console.error('Low stock notification failed:', notifErr.message);
        }
      }
    }

    // ── Step 2: Get the county shipping data ────────────────────────────
    // Tier 2 detection happens AFTER Step 3 once we have real product
    // categories from the database. The frontend cart items do NOT carry
    // a category field — only verifiedOrderItems (built in Step 3) do.
    // Running Tier 2 detection here on req.body.orderItems would always
    // return false because item.category would be undefined.
    const shippingData = getShippingRate(shippingAddress.county);

    // Placeholders — filled in after Step 3 once we have real categories
    let shippingTier  = 'standard';
    let shippingPrice = shippingData.rate;

   // ── Step 3: Server-side price verification ──────────────────────────
    // Re-calculate items price from actual product data to prevent
    // frontend price manipulation. We use the DB price at the time of order.
    let serverItemsPrice = 0;
    const verifiedOrderItems = [];

    // ── Seller fulfilment notification map ────────────────────────────
    // Groups this order's items by seller so each seller can be notified
    // once order creation succeeds, listing only their own products and
    // quantities — never the buyer's identity, per the golden rule. This
    // is an in-memory map only; it is not persisted and not added to the
    // order schema, since it exists purely to fan out notifications.
    const sellerItemsMap = {};

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      // Use salePrice if product is on sale, otherwise regular price
      const unitPrice = (product.isOnSale && product.salePrice)
        ? product.salePrice
        : product.price;

      serverItemsPrice += unitPrice * item.qty;

      // Track this item under its seller for the fulfilment notification
      // fan-out below. Admin-managed products with no seller are skipped —
      // there is no seller account to notify.
      if (product.seller) {
        const sellerId = product.seller.toString();
        if (!sellerItemsMap[sellerId]) sellerItemsMap[sellerId] = [];
        sellerItemsMap[sellerId].push({ name: product.name, qty: item.qty });
      }

      verifiedOrderItems.push({
        name: product.name,
        qty: item.qty,
        image: product.image,
        price: product.price,        // original price for reference
        priceAtPurchase: unitPrice,            // actual price charged — snapshot
        category: product.category,     // needed for Tier 2 detection
        unit: product.unit || '',
        // ── Wholesale unit snapshot (Step 11 / ISS-013) ────────────────
        // Copied from the product document right now, at order creation,
        // so this order's display never changes even if the seller edits
        // unitType, itemsPerUnit, or weightPerUnit on the product later.
        unitType:      product.unitType || 'Per Unit',
        itemsPerUnit:  product.itemsPerUnit  ?? null,
        weightPerUnit: product.weightPerUnit ?? null,
        product: product._id,
      });
    }

    // ── Step 3b: Tier 2 detection — using verified items with real categories
    // Now that verifiedOrderItems has category populated from the database,
    // we can correctly detect Tier 2 items.
    const orderHasTier2     = hasAnyTier2Item(verifiedOrderItems);
    const orderIsFullyTier2 = isFullyTier2Order(verifiedOrderItems);

    if (orderIsFullyTier2) {
      // Entirely bulk/heavy goods — full Tier 2 flow
      shippingTier  = 'quote_required';
      shippingPrice = 0; // Admin will set the real amount after quoting
    } else if (orderHasTier2) {
      // Mixed order — apply tier 1 flat rate + tier 2 surcharge and flag
      // for admin attention. Admin can override via updateOrderShipping.
      shippingTier  = 'standard';
      shippingPrice = shippingData.rate + shippingData.tier2Surcharge;
    }

    // ── Step 4: Calculate tax and total server-side ─────────────────────
    // VAT is inclusive — extract the component from the price rather than adding on top
    // Formula: VAT component = price × 16 / 116
    const serverTaxPrice = Number(
      (serverItemsPrice * 16 / 116).toFixed(2)
    );
    // Total = items (VAT already inside) + shipping only
    const serverTotalPrice = Number(
      (serverItemsPrice + shippingPrice).toFixed(2)
    );

    // ── Step 5: Calculate and record platform commission ─────────────────
    // Not charged in Phase 1 — stored for admin reconciliation dashboard.
    // Phase 3: deducted automatically from seller payout.
    const platformCommission = Number(
      (serverItemsPrice * SHIPPING_CONSTANTS.COMMISSION_DEFAULT).toFixed(2)
    );

    // ── Step 6: Create the order ────────────────────────────────────────
    const order = new Order({
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod,
      shippingTier,
      shippingZone: shippingData.zone,
      hasTier2Items: orderHasTier2,
      itemsPrice: Number(serverItemsPrice.toFixed(2)),
      shippingPrice: Number(shippingPrice.toFixed(2)),
      taxPrice: serverTaxPrice,
      totalPrice: serverTotalPrice,
      platformCommission,
      // Tier 2 delivery quote initialised if needed
      deliveryQuote: orderIsFullyTier2
        ? { amount: 0, status: 'pending' }
        : undefined,
      status: 'pending',
    });

const createdOrder = await order.save();

    // ── Step 7: Notify buyer that order has been placed ──────────────────
    // Uses type 'transactional' — the only valid type for order events.
    // relatedOrderId enables the View Order link in the notification bell.
    try {
    const orderNotification = new Notification({
        userId:         req.user._id,
        type:           'transactional',
        title:          'Order Placed',
        message:        `Your order #${createdOrder._id.toString().slice(-8).toUpperCase()} has been placed successfully. ` +
                        (orderIsFullyTier2
                          ? 'Our team will contact you within 24 hours with a delivery quote.'
                          : `Total: KES ${serverTotalPrice.toLocaleString('en-KE', { minimumFractionDigits: 2 })}.`),
        relatedOrderId: createdOrder._id,
        link:           `/order/${createdOrder._id}`,
        isRead:         false,
      });
await orderNotification.save();
    } catch (notifErr) {
      // Notification failure must never crash the order creation.
      // Log it and continue — the order is already saved.
      console.error('Order placed notification failed:', notifErr.message);
    }

    // ── Step 7b: Notify each seller that their product(s) were ordered ───
    // One notification per seller represented in this order, listing only
    // that seller's own product names and quantities. Never the buyer's
    // name, county, address, or any other identifying detail — the same
    // privacy boundary already enforced in getSellerOrders.
    for (const [sellerId, items] of Object.entries(sellerItemsMap)) {
      try {
        const itemSummary = items.map((i) => `${i.qty} × ${i.name}`).join(', ');
        const sellerOrderNotification = new Notification({
          userId:  sellerId,
          type:    'transactional',
          title:   'New Order Received',
          message: `You have a new order to fulfil: ${itemSummary}. Check your dashboard for stock and quote requirements.`,
          link:    '/seller/dashboard',
          isRead:  false,
        });
        await sellerOrderNotification.save();
      } catch (notifErr) {
        console.error('Seller order notification failed:', notifErr.message);
      }
    }

    // ── Step 8: Build response with delivery context ─────────────────────
    const response = {
      ...createdOrder.toObject(),
      shippingInfo: {
        zone: shippingData.zone,
        estimatedDays: shippingData.estimatedDays,
        tier: shippingTier,
        // Tell the frontend clearly what's happening with delivery
        message: orderIsFullyTier2
          ? 'Your order contains bulk or heavy goods. Our team will contact you within 24 hours with a delivery quote before your order is processed.'
          : orderHasTier2
            ? 'Your order includes some bulk items. A delivery surcharge has been applied. Our team may contact you if additional coordination is needed.'
            : `Standard delivery to ${shippingData.zone} — ${shippingData.estimatedDays}`,
      },
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// getOrderById
// GET /api/orders/:id
// Protected — owner or admin
// ─────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email phone'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order owner or an admin can view it
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(401).json({ message: 'Not authorised to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// updateOrderToPaid
// PUT /api/orders/:id/pay
// Protected — owner
// ─────────────────────────────────────────────────────────────────────────
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Cannot pay for a cancelled order
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for a cancelled order' });
    }

    // Cannot pay for a Tier 2 order where the delivery quote hasn't been approved
    if (
      order.shippingTier === 'quote_required' &&
      order.deliveryQuote.status !== 'buyer_approved'
    ) {
      return res.status(400).json({
        message: 'Please approve the delivery quote before completing payment',
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing'; // advance status on payment
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.payer?.email_address || '',
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// updateOrderToDelivered
// PUT /api/orders/:id/deliver
// Admin only
// ─────────────────────────────────────────────────────────────────────────
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered'; // advance the status enum

    // Phase 1: admin manually releases payout after this.
    // Phase 3: a scheduled job will auto-release after T+2 from deliveredAt.
    // We do NOT auto-release here — admin must explicitly confirm.

const updatedOrder = await order.save();

    // Notify buyer that their order has been delivered
    try {
   const deliveredNotification = new Notification({
        userId:         order.user,
        type:           'transactional',
        title:          'Order Delivered',
        message:        `Your order #${order._id.toString().slice(-8).toUpperCase()} has been marked as delivered. ` +
                        'If you have any issues with your delivery, please report it from your order page.',
        relatedOrderId: order._id,
        link:           `/order/${order._id}`,
        isRead:         false,
      });
      await deliveredNotification.save();
    } catch (notifErr) {
      console.error('Order delivered notification failed:', notifErr.message);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// cancelOrder
// PUT /api/orders/:id/cancel
// Protected — owner (if not paid) or admin (any time)
// ─────────────────────────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Non-admin: can only cancel their own unpaid orders
    if (!req.user.isAdmin) {
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorised' });
      }
      if (order.isPaid) {
        return res.status(400).json({
          message: 'Cannot cancel a paid order. Please contact support to request a refund.',
        });
      }
      if (order.isDelivered) {
        return res.status(400).json({ message: 'Cannot cancel a delivered order' });
      }
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // ── Restore stock for every item in the cancelled order ─────────────
    // This is the fix that was missing from the original controller.
    // When an order is cancelled, the reserved stock goes back to available.
    await _restoreStock(order.orderItems);

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    res.json({
      ...updatedOrder.toObject(),
      message: 'Order cancelled. Stock has been restored.',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// sendDeliveryQuote  (NEW)
// PUT /api/orders/:id/delivery-quote/send
// Admin only — for Tier 2 orders
// ─────────────────────────────────────────────────────────────────────────
const sendDeliveryQuote = async (req, res) => {
  try {
    const { amount, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A valid quote amount (KES) is required' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.shippingTier !== 'quote_required') {
      return res.status(400).json({ message: 'This order does not require a delivery quote' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot send quote for a cancelled order' });
    }

    // Set the quote details
    order.deliveryQuote.amount = amount;
    order.deliveryQuote.status = 'sent';
    order.deliveryQuote.sentAt = Date.now();
    order.deliveryQuote.notes = notes || '';

    // Update the total price to include the confirmed delivery quote
    order.shippingPrice = amount;
    order.totalPrice = Number(
      (order.itemsPrice + amount + order.taxPrice).toFixed(2)
    );

const updatedOrder = await order.save();

    // Notify buyer that a delivery quote is waiting for their approval
    try {
   const quoteNotification = new Notification({
        userId:         order.user,
        type:           'transactional',
        title:          'Delivery Quote Ready',
        message:        `A delivery quote of KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })} has been sent for order #${order._id.toString().slice(-8).toUpperCase()}. ` +
                        'Please review and approve or reject it to continue.',
        relatedOrderId: order._id,
        link:           `/order/${order._id}`,
        isRead:         false,
      });
      await quoteNotification.save();
    } catch (notifErr) {
      console.error('Quote sent notification failed:', notifErr.message);
    }

    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// approveDeliveryQuote  (NEW)
// PUT /api/orders/:id/delivery-quote/approve
// Protected — order owner only
// ─────────────────────────────────────────────────────────────────────────
const approveDeliveryQuote = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the buyer who placed the order can approve
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorised' });
    }

    if (order.deliveryQuote.status !== 'sent') {
      return res.status(400).json({
        message: 'No quote has been sent for this order yet, or it has already been actioned',
      });
    }

    order.deliveryQuote.status = 'buyer_approved';
    order.deliveryQuote.approvedAt = Date.now();

    const updatedOrder = await order.save();
    res.json({
      ...updatedOrder.toObject(),
      message: 'Delivery quote approved. You can now complete your payment.',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// rejectDeliveryQuote  (NEW)
// PUT /api/orders/:id/delivery-quote/reject
// Protected — order owner only
// Cancels the order and restores stock
// ─────────────────────────────────────────────────────────────────────────
const rejectDeliveryQuote = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorised' });
    }

    if (order.deliveryQuote.status !== 'sent') {
      return res.status(400).json({ message: 'No active quote to reject' });
    }

// Buyer rejected the quote — cancel the order and restore stock
    order.deliveryQuote.status = 'buyer_rejected';
    order.status = 'cancelled';

    // Restore stock since order won't proceed
    await _restoreStock(order.orderItems);

    const updatedOrder = await order.save();

    // Notify buyer that their order is cancelled following quote rejection
    try {
 const rejectNotification = new Notification({
        userId:         order.user,
        type:           'transactional',
        title:          'Order Cancelled',
        message:        `You rejected the delivery quote for order #${order._id.toString().slice(-8).toUpperCase()}. ` +
                        'The order has been cancelled and stock restored. You can place a new order at any time.',
        relatedOrderId: order._id,
        link:           `/order/${order._id}`,
        isRead:         false,
      });
      await rejectNotification.save();
    } catch (notifErr) {
      console.error('Quote rejected notification failed:', notifErr.message);
    }

    res.json({
      ...updatedOrder.toObject(),
      message: 'Delivery quote rejected. Order has been cancelled and stock restored.',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// releaseSellerPayout  (NEW)
// PUT /api/orders/:id/release-payout
// Admin only — lightweight escrow release
// ─────────────────────────────────────────────────────────────────────────
const releaseSellerPayout = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isDelivered) {
      return res.status(400).json({
        message: 'Cannot release payout before order is marked as delivered',
      });
    }

    if (!order.isPaid) {
      return res.status(400).json({
        message: 'Cannot release payout for an unpaid order',
      });
    }

    if (order.sellerPayoutReleased) {
      return res.status(400).json({ message: 'Payout has already been released for this order' });
    }

    order.sellerPayoutReleased = true;
    order.sellerPayoutReleasedAt = Date.now();

const updatedOrder = await order.save();

    // Notify the order user (buyer) that payout has been released.
    // In Step 5 when the seller dashboard is live, this notification
    // will be sent to the seller's userId instead.
    // For now order.user is the buyer — this gives admin a confirmation trail.
    try {
    const payoutNotification = new Notification({
        userId:         order.user,
        type:           'transactional',
        title:          'Payout Released',
        message:        `The seller payout for order #${order._id.toString().slice(-8).toUpperCase()} has been released. ` +
                        `KES ${(order.totalPrice - order.platformCommission - order.shippingPrice).toLocaleString('en-KE', { minimumFractionDigits: 2 })} sent to supplier.`,
        relatedOrderId: order._id,
        link:           `/order/${order._id}`,
        isRead:         false,
      });
      await payoutNotification.save();
    } catch (notifErr) {
      console.error('Payout released notification failed:', notifErr.message);
    }

    res.json({
      ...updatedOrder.toObject(),
      message: `Payout of KES ${(order.totalPrice - order.platformCommission - order.shippingPrice).toFixed(2)} ` +
        `released to seller. Platform commission: KES ${order.platformCommission.toFixed(2)}.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// getMyOrders
// GET /api/orders/myorders
// Protected — returns orders for the logged-in buyer
// ─────────────────────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// getAllOrders
// GET /api/orders
// Admin only
// ─────────────────────────────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// getPendingQuoteOrders  (NEW)
// GET /api/orders/pending-quotes
// Admin only — returns all Tier 2 orders awaiting a delivery quote
// ─────────────────────────────────────────────────────────────────────────
const getPendingQuoteOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      shippingTier: 'quote_required',
      'deliveryQuote.status': 'pending',
      status: { $ne: 'cancelled' },
    })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// getPayoutQueue  (NEW)
// GET /api/orders/payout-queue
// Admin only — orders ready for seller payout
// (delivered, paid, payout not yet released)
// ─────────────────────────────────────────────────────────────────────────
const getPayoutQueue = async (req, res) => {
  try {
    const orders = await Order.find({
      isDelivered: true,
      isPaid: true,
      sellerPayoutReleased: false,
      status: 'delivered',
    })
      .populate('user', 'name email')
      .sort({ deliveredAt: 1 }); // oldest delivered first

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// submitSellerQuote  (NEW)
// PUT /api/orders/:id/seller-quote/submit
// Seller only — submits a structured delivery quote for a Tier 2 order.
//
// Only accepts structured fields — no free text anywhere.
// Amount is capped at 3× the zone base rate to prevent inflation abuse.
// On success the quote status is set to 'submitted' and admin is
// responsible for forwarding it to the buyer via sendDeliveryQuote.
// ─────────────────────────────────────────────────────────────────────────────
const submitSellerQuote = async (req, res) => {
  try {
    const { amount, courier, estimatedDays } = req.body;

    // ── Validate all fields are present ─────────────────────
    if (!amount || !courier || !estimatedDays) {
      return res.status(400).json({
        message: 'Amount, courier, and estimated days are all required.',
      });
    }

    // ── Validate amount is a positive number ─────────────────
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Quote amount must be greater than 0.' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ── Only Tier 2 orders need a seller quote ────────────────
    if (order.shippingTier !== 'quote_required') {
      return res.status(400).json({
        message: 'This order does not require a delivery quote.',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot submit a quote for a cancelled order.',
      });
    }

    // ── Cap validation — max 3× the zone base rate ────────────
    // Prevents sellers from inflating delivery costs.
    // Zone base rates mirror shippingRates.js
    const ZONE_BASE_RATES = {
      'Nairobi': 300,
      'Central Kenya': 500,
      'Rift Valley': 700,
      'Nyanza & Western': 900,
      'North Rift': 900,
      'Eastern': 800,
      'Coast': 1000,
      'North Eastern': 1500,
      'Rest of Kenya': 800,
    };

    const baseRate = ZONE_BASE_RATES[order.shippingZone] || 800;
    const maxAllowed = baseRate * 3;

    if (Number(amount) > maxAllowed) {
      return res.status(400).json({
        message: `Quote amount of KES ${amount} exceeds the maximum allowed for ${order.shippingZone} zone (KES ${maxAllowed}). Please contact support if you believe this limit is incorrect.`,
      });
    }

    // ── Save the seller quote ─────────────────────────────────
    order.sellerQuote = {
      amount: Number(amount),
      courier,
      estimatedDays,
      submittedAt: Date.now(),
      status: 'submitted',
    };

    const updatedOrder = await order.save();
    res.json({
      ...updatedOrder.toObject(),
      message: 'Quote submitted. ShopZone admin will review and forward it to the buyer.',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: update shipping price on an unpaid order
// @route   PUT /api/orders/:id/shipping
// @access  Private/Admin
//
// Allows admin to correct the flat-rate delivery fee that was
// estimated at checkout. Can only be done while the order is unpaid.
// Once paid, the shipping price is locked as part of the payment record.
const updateOrderShipping = async (req, res) => {
  try {
    const { shippingPrice } = req.body;

    if (shippingPrice === undefined || Number(shippingPrice) < 0) {
      return res.status(400).json({ message: 'A valid shipping price is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({
        message: 'Cannot change shipping price on a paid order.',
      });
    }

    const oldShipping = order.shippingPrice;
    const newShipping = Number(shippingPrice);

    // Recalculate total price with the corrected shipping
    order.shippingPrice = newShipping;
    order.totalPrice    = order.itemsPrice + newShipping + order.taxPrice;

    const updated = await order.save();

    res.json({
      message: `Shipping updated from KES ${oldShipping.toFixed(2)} to KES ${newShipping.toFixed(2)}. Order total recalculated.`,
      order: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
  getMyOrders,
  getAllOrders,
  // New exports
  sendDeliveryQuote,
  approveDeliveryQuote,
  rejectDeliveryQuote,
  releaseSellerPayout,
  getPendingQuoteOrders,
  getPayoutQueue,
  submitSellerQuote,
  updateOrderShipping,
};