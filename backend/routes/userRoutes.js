const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateSellerStatus,
  getUserFullProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getRecentlyViewed,
  trackRecentlyViewed,
  updateNotificationPreferences,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);        // POST /api/users
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ── Wishlist ──────────────────────────────────────────────────
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// ── Recently viewed ───────────────────────────────────────────
router.get('/recently-viewed', protect, getRecentlyViewed);
router.post('/recently-viewed/:productId', protect, trackRecentlyViewed);

// ── Notification preferences ─────────────────────────────────
router.put('/notification-preferences', protect, updateNotificationPreferences);

router.route('/')
  .get(protect, admin, getAllUsers);

// Full profile aggregation — must be before /:id to avoid route conflict
router.get('/:id/full-profile', protect, admin, getUserFullProfile);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Seller status update — admin only
// Must be after /:id to avoid route conflict
router.put('/:id/seller-status', protect, admin, updateSellerStatus);

module.exports = router;