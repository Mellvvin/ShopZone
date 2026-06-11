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

// optionalAuth removed — POST /api/enquiries now requires login.
// All enquiries must be linked to a real user account.

// ── Authenticated route ───────────────────────────────────────
// POST /api/enquiries — user must be logged in.
// Enforces that all enquiries are linked to a real user account.
// This prevents anonymous spam, DOS via dummy data, and ensures
// every enquiry appears correctly on AdminUserDetailPage.
router.post('/', protect, createEnquiry);

// ── Admin-only routes ────────────────────────────────────────
router.get('/',    protect, admin, getEnquiries);
router.get('/:id', protect, admin, getEnquiryById);
router.put('/:id', protect, admin, updateEnquiry);

module.exports = router;