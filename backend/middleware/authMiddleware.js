const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorised, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorised, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorised as admin' });
  }
};

// ── Seller middleware ──────────────────────────────────────────
// Must be used after protect — requires req.user to already be set.
// Checks that the user is an approved seller.
// Pending, suspended, and rejected sellers get a specific message
// so the frontend can show them meaningful feedback.
// ── Seller middleware ──────────────────────────────────────────
// Must be used after protect — requires req.user to already be set.
//
// ISS-018 FIX: this used to block 'suspended' outright, which is what
// locked suspended sellers out of their ENTIRE dashboard instead of
// just losing publish/fulfilment rights — the opposite of the intended
// design. A suspended seller must always be able to see and manage
// their own products and orders; suspension only blocks NEW product
// submissions (enforced separately by approvedSellerOnly below) and
// is enforced for going live/checkout elsewhere (productController's
// updateProduct approval guard, orderController's checkout guard).
//
// Allows: approved, suspended.
// Blocks: pending, rejected, none — and anyone who isn't a seller at all.
const seller = (req, res, next) => {
  if (!req.user || !req.user.isSeller) {
    return res.status(403).json({ message: 'Not authorised as a seller' });
  }

  if (req.user.sellerStatus === 'pending') {
    return res.status(403).json({
      message: 'Your seller application is under review. You will be notified once approved.',
    });
  }

  if (req.user.sellerStatus === 'rejected') {
    return res.status(403).json({
      message: 'Your seller application was not approved. Please contact ShopZone support.',
    });
  }

  if (req.user.sellerStatus !== 'approved' && req.user.sellerStatus !== 'suspended') {
    return res.status(403).json({ message: 'Not authorised as an approved seller' });
  }

  // approved or suspended both pass through — dashboard, product list,
  // order list, profile, and product editing all remain visible.
  next();
};

// ── Approved-seller-only middleware ─────────────────────────────
// Stricter than seller above — used specifically where suspension
// should genuinely block the action, not just publishing. Currently
// applied only to POST /api/seller/products (submitting a BRAND NEW
// product). A suspended seller can still edit an existing product
// (via seller above + PUT /api/seller/products/:id) but cannot add
// new inventory while suspended.
const approvedSellerOnly = (req, res, next) => {
  if (!req.user || !req.user.isSeller) {
    return res.status(403).json({ message: 'Not authorised as a seller' });
  }

  if (req.user.sellerStatus === 'suspended') {
    return res.status(403).json({
      message: 'Your seller account is currently suspended. You cannot submit new products until your account is reinstated, but you can still edit your existing products.',
    });
  }

  if (req.user.sellerStatus !== 'approved') {
    return res.status(403).json({ message: 'Not authorised as an approved seller' });
  }

  next();
};

// ── Optional auth ──────────────────────────────────────────────
// Like protect but does not reject unauthenticated requests.
// Sets req.user if a valid token is present, leaves it undefined
// if no token or an invalid token is sent.
// Used on public routes that need to know who is logged in
// without requiring login — e.g. the seller application form.
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next(); // no token — continue as anonymous
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    // Invalid token — ignore it and continue as anonymous
  }
  next();
};

module.exports = { 
  protect,
  admin,
  seller,
  approvedSellerOnly,
  optionalProtect
   };