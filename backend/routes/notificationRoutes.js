// backend/routes/notificationRoutes.js
// ─────────────────────────────────────────────────────────────
// Notification routes — all private (require JWT).
// The read-all route must be defined BEFORE /:id/read so Express
// does not try to match 'read-all' as a MongoDB ObjectId.
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markOneRead,
  markAllRead,
} = require('../controllers/notificationController');

// GET  /api/notifications         — fetch all for logged-in user
router.get('/', protect, getNotifications);

// PUT  /api/notifications/read-all — mark all as read (before /:id)
router.put('/read-all', protect, markAllRead);

// PUT  /api/notifications/:id/read — mark one as read
router.put('/:id/read', protect, markOneRead);

module.exports = router;