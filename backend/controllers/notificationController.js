// backend/controllers/notificationController.js
// ─────────────────────────────────────────────────────────────
// Handles notification retrieval and read-state management.
//
// Routes:
//   GET  /api/notifications        — get all for logged-in user
//   PUT  /api/notifications/:id/read — mark one as read
//   PUT  /api/notifications/read-all — mark all as read
//
// Notifications are created by other controllers (orderController,
// enquiryController, etc.) when significant events occur.
// There is no public POST endpoint — notifications are system-generated.
// ─────────────────────────────────────────────────────────────
const Notification = require('../models/Notification');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
// Returns newest first, limited to 50 so the dropdown stays fast.
const getNotifications = async (req, res) => {
  try {
    // Default limit stays 50 for the bell dropdown. The full
    // /notifications page passes ?limit= for a larger one-shot fetch.
    // Capped at 200 regardless of what is requested so a malformed or
    // malicious query can't force an unbounded fetch.
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 200)
      : 50;

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Also return the unread count so the badge can update without
    // counting client-side
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markOneRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      // Ensure the notification belongs to the requesting user
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read for the logged-in user
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markOneRead, markAllRead };