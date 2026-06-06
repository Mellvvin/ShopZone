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
const seller = (req, res, next) => {
  if (!req.user || !req.user.isSeller) {
    return res.status(403).json({ message: 'Not authorised as a seller' });
  }

  if (req.user.sellerStatus === 'pending') {
    return res.status(403).json({
      message: 'Your seller application is under review. You will be notified once approved.',
    });
  }

  if (req.user.sellerStatus === 'suspended') {
    return res.status(403).json({
      message: 'Your seller account has been suspended. Please contact ShopZone support.',
    });
  }

  if (req.user.sellerStatus === 'rejected') {
    return res.status(403).json({
      message: 'Your seller application was not approved. Please contact ShopZone support.',
    });
  }

  if (req.user.sellerStatus !== 'approved') {
    return res.status(403).json({ message: 'Not authorised as an approved seller' });
  }

  next();
};

module.exports = { protect, admin, seller };