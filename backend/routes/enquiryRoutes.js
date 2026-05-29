// backend/routes/enquiryRoutes.js
// ─────────────────────────────────────────────────────────────
// Routes for the enquiry system.
//
// Public:
//   POST /api/enquiries          — submit any form
//
// Admin only:
//   GET  /api/enquiries          — list with filters
//   GET  /api/enquiries/:id      — single enquiry detail
//   PUT  /api/enquiries/:id      — update status / notes
//
// Note: the public POST route uses optionalAuth middleware
// (defined below) so logged-in users get their userId attached
// to the enquiry, but the route still works for anonymous users.
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();

const {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
} = require('../controllers/enquiryController');

const { protect, admin } = require('../middleware/authMiddleware');

// ── Optional auth helper ─────────────────────────────────────
// This is a lightweight middleware that runs protect() but does
// NOT reject the request if no token is present. It allows
// logged-in users to have their userId saved on the enquiry
// while still allowing anonymous/logged-out form submissions.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // If no token at all, skip auth and continue as anonymous
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  // Token is present — run the standard protect middleware
  protect(req, res, next);
};

// ── Public route ─────────────────────────────────────────────
// POST /api/enquiries — any visitor can submit a form.
// If the user is logged in their userId is attached.
router.post('/', optionalAuth, createEnquiry);

// ── Admin-only routes ────────────────────────────────────────
router.get('/',    protect, admin, getEnquiries);
router.get('/:id', protect, admin, getEnquiryById);
router.put('/:id', protect, admin, updateEnquiry);

module.exports = router;