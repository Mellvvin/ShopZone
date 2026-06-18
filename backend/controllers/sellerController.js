// backend/controllers/sellerController.js
// ─────────────────────────────────────────────────────────────
// Seller dashboard API — all routes protected by protect + seller
// middleware. Only approved sellers can reach these endpoints.
//
// Functions:
//   getSellerDashboard — overview stats for the seller's dashboard
//   getSellerProducts  — products assigned to this seller
//   getSellerOrders    — orders containing this seller's products
// ─────────────────────────────────────────────────────────────
const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');

// @desc    Get seller dashboard overview stats
// @route   GET /api/seller/dashboard
// @access  Private/Seller
const getSellerDashboard = async (req, res) => {
  try {
    // Total products assigned to this seller
    const totalProducts = await Product.countDocuments({ seller: req.user._id });

    // Total orders containing at least one of this seller's products
    // Phase 2: orders will be split per seller automatically.
    // Phase 1: we count orders where any item matches a seller product.
    const sellerProductIds = await Product.find(
      { seller: req.user._id },
      '_id'
    );
    const ids = sellerProductIds.map((p) => p._id);

    const totalOrders = await Order.countDocuments({
      'orderItems.product': { $in: ids },
      status: { $ne: 'cancelled' },
    });

    const pendingOrders = await Order.countDocuments({
      'orderItems.product': { $in: ids },
      status: 'pending',
    });

    const fulfilledOrders = await Order.countDocuments({
      'orderItems.product': { $in: ids },
      status: 'delivered',
    });

    // Payout released count
    const payoutReleased = await Order.countDocuments({
      'orderItems.product': { $in: ids },
      sellerPayoutReleased: true,
    });

    // ── Earnings calculations ─────────────────────────────────
    // totalEarnings: sum of (priceAtPurchase × qty) for this seller's
    // items across all paid delivered orders, minus platform commission.
    // pendingPayoutAmount: same but for orders not yet paid out.
    //
    // We calculate per-item because an order may contain both this
    // seller's products and other products — we only count this
    // seller's items, not the full order total.
    const COMMISSION_RATE = 0.06; // mirrors SHIPPING_CONSTANTS.COMMISSION_DEFAULT

    const allRelevantOrders = await Order.find({
      'orderItems.product': { $in: ids },
      isPaid:     true,
      isDelivered: true,
    });

    let totalEarnings       = 0; // KES earned across all paid+delivered orders
    let pendingPayoutAmount = 0; // KES in delivered+paid orders not yet released

    for (const order of allRelevantOrders) {
      // Only sum this seller's items, not the entire order
      const sellerItems = order.orderItems.filter((item) =>
        ids.map(String).includes(String(item.product))
      );

      const sellerSubtotal = sellerItems.reduce(
        (sum, item) => sum + item.priceAtPurchase * item.qty,
        0
      );

      // Deduct commission to get what the seller actually receives
      const sellerNet = sellerSubtotal * (1 - COMMISSION_RATE);
      totalEarnings += sellerNet;

      if (!order.sellerPayoutReleased) {
        pendingPayoutAmount += sellerNet;
      }
    }

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      fulfilledOrders,
      payoutReleased,
      totalEarnings:       Number(totalEarnings.toFixed(2)),
      pendingPayoutAmount: Number(pendingPayoutAmount.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products assigned to this seller
// @route   GET /api/seller/products
// @access  Private/Seller
const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders containing this seller's products
// @route   GET /api/seller/orders
// @access  Private/Seller
// Customer identity is never exposed — only fulfillment-safe fields returned.
const getSellerOrders = async (req, res) => {
  try {
    const sellerProductIds = await Product.find(
      { seller: req.user._id },
      '_id'
    );
    const ids = sellerProductIds.map((p) => p._id);

    const orders = await Order.find({
      'orderItems.product': { $in: ids },
    }).sort({ createdAt: -1 });

    // Strip customer identity — seller only sees fulfillment-safe data
    const safeOrders = orders.map((order) => ({
      _id:          order._id,
      status:       order.status,
      shippingTier: order.shippingTier,
      shippingZone: order.shippingZone,
      isPaid:       order.isPaid,
      isDelivered:  order.isDelivered,
      createdAt:    order.createdAt,
      // Only the items belonging to this seller
      orderItems: order.orderItems.filter((item) =>
        ids.map(String).includes(String(item.product))
      ),
      // Delivery quote if this is a Tier 2 order
      deliveryQuote:       order.deliveryQuote,
      sellerQuote:         order.sellerQuote,
      sellerPayoutReleased: order.sellerPayoutReleased,
      // County only — never full address, never customer name or phone
      deliveryCounty: order.shippingAddress?.county || '',
    }));

    res.json(safeOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller's own profile data
// @route   GET /api/seller/profile
// @access  Private/Seller
const getSellerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email phone sellerProfile sellerStatus sellerApprovedAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller's own profile data
// @route   PUT /api/seller/profile
// @access  Private/Seller
const updateSellerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only update sellerProfile sub-fields — never isAdmin, isSeller, sellerStatus
    const { businessName, businessAddress, description, kraPin, mpesaNumber } = req.body;

    user.sellerProfile = {
      businessName:    businessName    ?? user.sellerProfile?.businessName    ?? '',
      businessAddress: businessAddress ?? user.sellerProfile?.businessAddress ?? '',
      description:     description     ?? user.sellerProfile?.description     ?? '',
      kraPin:          kraPin          ?? user.sellerProfile?.kraPin          ?? '',
      mpesaNumber:     mpesaNumber     ?? user.sellerProfile?.mpesaNumber     ?? '',
    };

    await user.save();
    res.json({ message: 'Profile updated successfully', sellerProfile: user.sellerProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a new product for admin review
// @route   POST /api/seller/products
// @access  Private/Seller
//
// Seller-submitted products always start with status 'submitted'.
// They are NOT publicly visible until admin approves them.
// The seller field is set to req.user._id automatically.
// The user field (who created the record) is also set to req.user._id.
// Admin can later override any field before approving.
const createSellerProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      countInStock,
      brand,
      unitType,
      minimumOrderQuantity,
      itemsPerUnit,
      weightPerUnit,
      dimensions,
      isBulkOnly,
      leadTimeDays,
      tags,
    } = req.body;

    // ── Required field validation ────────────────────────────
    if (!name || !description || !category || price === undefined) {
      return res.status(400).json({
        message: 'Name, description, category, and price are required.',
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({ message: 'Product name must be at least 3 characters.' });
    }

    if (description.trim().length < 20) {
      return res.status(400).json({ message: 'Description must be at least 20 characters.' });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ message: 'Price cannot be negative.' });
    }

    // ── Build the product document ───────────────────────────
    const product = new Product({
      // Ownership — both user and seller point to the submitting seller
      user:   req.user._id,
      seller: req.user._id,

      // Core fields
      name:        name.trim(),
      description: description.trim(),
      category,
      price:       Number(price),
      countInStock: Number(countInStock) || 0,

      // Wholesale fields
      brand:                brand?.trim()              || '',
      unitType:             unitType                   || 'Per Unit',
      minimumOrderQuantity: Number(minimumOrderQuantity) || 1,
      itemsPerUnit:         itemsPerUnit ? Number(itemsPerUnit) : null,
      weightPerUnit:        weightPerUnit ? Number(weightPerUnit) : null,
      dimensions:           dimensions?.trim()         || '',
      isBulkOnly:           Boolean(isBulkOnly),
      leadTimeDays:         leadTimeDays ? Number(leadTimeDays) : null,

      // Tags — accept comma-separated string or array
      tags: Array.isArray(tags)
        ? tags.map(t => t.trim().toLowerCase()).filter(Boolean)
        : (tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean),

      // Merchandising flags — seller cannot set these, admin controls them
      isFeatured:  false,
      isOnSale:    false,
      isClearance: false,

      // Status — always 'submitted', never 'approved', for seller submissions
      // Admin must explicitly approve before the product goes public
      status: 'submitted',

  // Image — seller uploads before submitting; validated in the frontend.
      // Falls back to placeholder only if somehow missing.
      image: req.body.image || '/images/sample.jpg',
    });

    const saved = await product.save();

    res.status(201).json({
      message: 'Product submitted successfully. ShopZone admin will review it before it goes live.',
      product: saved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSellerDashboard,
  getSellerProducts,
  getSellerOrders,
  getSellerProfile,
  updateSellerProfile,
  createSellerProduct,
};