// backend/controllers/userController.js
// ─────────────────────────────────────────────────────────────
// Handles all user-related logic:
//   registerUser, loginUser, logoutUser,
//   getUserProfile, updateUserProfile,
//   getAllUsers, getUserById, updateUser, deleteUser
//
// Note: password hashing is done directly in this controller
// instead of a Mongoose pre-save hook, to avoid a conflict
// with the bcryptjs UMD build overwriting Mongoose middleware
// callback parameters.
// ─────────────────────────────────────────────────────────────
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── JWT generator ─────────────────────────────────────────────
// Creates a signed token with the user's ID as payload.
// Expires in 30 days.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      accountType,
      businessName,
      businessType,
      county,
    } = req.body;

    // ── Password strength validation ──────────────────────────
    // At least 8 characters, one uppercase letter, one number.
    // Enforced here so the API is protected even when called directly.
    const passwordRules = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRules.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include one uppercase letter and one number.',
      });
    }

    // ── Check for duplicate email ─────────────────────────────
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'An account with this email already exists.',
      });
    }

    // ── Business validation ───────────────────────────────────
    // Business name is required when accountType is 'business'.
    if (accountType === 'business' && !businessName?.trim()) {
      return res.status(400).json({
        message: 'Business name is required for business accounts.',
      });
    }

    // ── Hash password directly ────────────────────────────────
    // Done here instead of a pre-save hook to avoid bcryptjs
    // UMD build conflict with Mongoose middleware parameters.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ── Create user ───────────────────────────────────────────
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      accountType: accountType || 'individual',
      businessName: accountType === 'business' ? businessName.trim() : '',
      businessType: accountType === 'business' ? businessType || '' : '',
      county: county || '',
    });

    if (user) {
    res.status(201).json({
        _id:          user._id,
        name:         user.name,
        email:        user.email,
        phone:        user.phone,
        accountType:  user.accountType,
        businessName: user.businessName,
        businessType: user.businessType,
        county:       user.county,
        shippingAddress: user.shippingAddress || {},
        createdAt:    user.createdAt,
       isAdmin:      user.isAdmin,
        isSeller:     user.isSeller,
        sellerStatus: user.sellerStatus,
        token:        generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user and return JWT
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check user exists and password matches the stored hash
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        businessName: user.businessName,
        businessType: user.businessType,
        county: user.county,
        shippingAddress: user.shippingAddress || {},
        createdAt: user.createdAt,
        isAdmin:      user.isAdmin,
        isSeller:     user.isSeller,
        sellerStatus: user.sellerStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user — client handles token removal
// @route   POST /api/users/logout
// @access  Private
const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        businessName: user.businessName,
        businessType: user.businessType,
        county: user.county,
        shippingAddress: user.shippingAddress || {},
        savedMpesaNumber: user.savedMpesaNumber || '',
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
        isAdmin:      user.isAdmin,
        isSeller:     user.isSeller,
        sellerStatus: user.sellerStatus,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update each field only if a new value was provided
      user.name             = req.body.name             || user.name;
      user.email            = req.body.email            || user.email;
      user.phone            = req.body.phone            ?? user.phone;
      user.county           = req.body.county           ?? user.county;
      user.accountType      = req.body.accountType      || user.accountType;
      user.businessName     = req.body.businessName     ?? user.businessName;
      user.businessType     = req.body.businessType     ?? user.businessType;
      user.savedMpesaNumber = req.body.savedMpesaNumber ?? user.savedMpesaNumber;

      // ── Save full delivery address if provided ────────────
      // Each sub-field updated independently so partial updates
      // (e.g. only county) do not wipe other address fields.
      if (req.body.shippingAddress) {
        const incoming = req.body.shippingAddress;
        user.shippingAddress = {
          address:   incoming.address   ?? user.shippingAddress?.address   ?? '',
          apartment: incoming.apartment ?? user.shippingAddress?.apartment ?? '',
          city:      incoming.city      ?? user.shippingAddress?.city      ?? '',
          county:    incoming.county    ?? user.shippingAddress?.county    ?? '',
          country:   incoming.country   ?? user.shippingAddress?.country   ?? 'Kenya',
        };
        // Keep the top-level county in sync with the delivery county
        user.county = user.shippingAddress.county || user.county;
      }

      // Password update is no longer handled here.
      // Password changes go through the forgot-password reset flow (Step 24).

      const updatedUser = await user.save();

      res.json({
        _id:          updatedUser._id,
        name:         updatedUser.name,
        email:        updatedUser.email,
        phone:        updatedUser.phone,
        accountType:  updatedUser.accountType,
        businessName: updatedUser.businessName,
        businessType: updatedUser.businessType,
        county:       updatedUser.county,
        shippingAddress: updatedUser.shippingAddress || {},
        savedMpesaNumber: updatedUser.savedMpesaNumber || '',
        notificationPreferences: updatedUser.notificationPreferences,
        createdAt:    updatedUser.createdAt,
        isAdmin:      updatedUser.isAdmin,
        isSeller:     updatedUser.isSeller,
        sellerStatus: updatedUser.sellerStatus,
        token:        generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user by ID (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user by ID (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user's seller status (admin only)
// @route   PUT /api/users/:id/seller-status
// @access  Private/Admin
//
// CASCADE LOGIC (ISS-016 — CRITICAL FIX):
// Suspending a seller used to only touch this User document. Every one
// of that seller's products stayed at status: 'approved' and remained
// fully live and orderable on the public storefront — meaning ShopZone
// could keep collecting buyer payments for goods from a seller admin
// had just flagged as risky enough to suspend. Fixed as follows:
//
//   suspended  → every product owned by this seller currently at
//                'approved' is bulk-updated to 'archived', pulling it
//                off the public storefront immediately, in this
//                same request.
//
//   reinstated (sellerStatus set back to 'approved' from a previous
//                'suspended' state) → archived products are NOT
//                auto-restored to 'approved'. Per the platform's
//                standing posture — admin approval protects buyer
//                trust, self-service is reserved for low-risk actions
//                only — a suspension is evidence something went wrong,
//                so reinstatement drops those products to 'submitted'
//                instead, back into the normal admin review queue,
//                rather than silently re-exposing whatever risk
//                triggered the suspension. Admin re-approves each one
//                deliberately.
//
//   rejected/none → no product cascade. By the time a seller reaches
//                these states they either never had approved products
//                (rejected before approval) or the existing branch
//                already strips isSeller — no separate product action
//                is implied by this transition.
//
// Product and Notification are required locally here rather than
// imported at the top of the file, matching the existing pattern
// already used in getUserFullProfile below.
const updateSellerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { sellerStatus, suspensionDuration } = req.body;

    // Validate the incoming status value
    const validStatuses = ['none', 'pending', 'approved', 'suspended', 'rejected'];
    if (!validStatuses.includes(sellerStatus)) {
      return res.status(400).json({ message: 'Invalid seller status value' });
    }

    // ── Suspension duration validation ───────────────────────────────
    const DURATION_DAYS = {
      '3_days':    3,
      '7_days':    7,
      '14_days':   14,
      'indefinite': null,
    };
    if (sellerStatus === 'suspended' && !(suspensionDuration in DURATION_DAYS)) {
      return res.status(400).json({
        message: 'A suspension duration is required (3_days, 7_days, 14_days, or indefinite).',
      });
    }

    // ── THE ACTUAL BUG ────────────────────────────────────────────
    // previousStatus, productsAffected, Product, and Notification were
    // all referenced further down in this function but never declared
    // or required anywhere — that is exactly why "previousStatus is not
    // defined" was thrown on every suspend/reinstate attempt. Declared
    // once, here, before anything is mutated.
    const previousStatus = user.sellerStatus;
    let productsAffected = 0;
    const Product      = require('../models/Product');
    const Notification = require('../models/Notification');

    // ── Apply the status change to the user document ─────────────
    user.sellerStatus = sellerStatus;

    if (sellerStatus === 'approved') {
      user.isSeller = true;
      user.sellerApprovedAt = Date.now();
      user.sellerSuspendedAt = null;
      user.sellerSuspensionDuration = '';
      user.sellerSuspensionExpiresAt = null;
    } else if (sellerStatus === 'suspended') {
      user.isSeller = true;
      user.sellerSuspendedAt = Date.now();
      user.sellerSuspensionDuration = suspensionDuration;
      const days = DURATION_DAYS[suspensionDuration];
      user.sellerSuspensionExpiresAt = days
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        : null;
    } else if (sellerStatus === 'rejected' || sellerStatus === 'none') {
      user.isSeller = false;
      user.sellerApprovedAt = null;
      user.sellerSuspendedAt = null;
      user.sellerSuspensionDuration = '';
      user.sellerSuspensionExpiresAt = null;
    }

    const updatedUser = await user.save();

    if (sellerStatus === 'suspended') {
      // ── ISS-017 FIX ─────────────────────────────────────────
      // The previous version of this block queried { status: 'archived' }
      // and moved matches to 'submitted' — that is the REINSTATEMENT
      // query, present in the suspend branch by mistake. It never
      // touched a single live or pending product. Corrected here: sweep
      // every product this seller owns that is currently approved (live
      // on the storefront), submitted, or needs_changes (sitting in the
      // normal review queue) into 'archived', tagged with
      // archivedBySellerSuspension: true so reinstatement later only
      // ever revives exactly what THIS suspension touched.
      const cascadeResult = await Product.updateMany(
        {
          seller: user._id,
          status: { $in: ['approved', 'submitted', 'needs_changes'] },
        },
        {
          $set: {
            status: 'archived',
            archivedBySellerSuspension: true,
            adminFeedback: 'Removed from storefront — seller account suspended.',
          },
        }
      );
      productsAffected = cascadeResult.modifiedCount;

      try {
        const durationLabel = {
          '3_days':    '3 days',
          '7_days':    '7 days',
          '14_days':   '14 days',
          'indefinite': 'an indefinite period — ShopZone will review your case manually',
        }[suspensionDuration] || suspensionDuration;

        const expiryLine = user.sellerSuspensionExpiresAt
          ? ` You will be reconsidered on or after ${new Date(user.sellerSuspensionExpiresAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}.`
          : '';

        await new Notification({
          userId:  user._id,
          type:    'transactional',
          title:   'Seller Account Suspended',
          message: `Your seller account has been suspended for ${durationLabel}. ${productsAffected} product(s) have been removed from the storefront and are no longer visible to buyers.${expiryLine} You can still view and edit your products from your dashboard while suspended. Contact ShopZone support for more information.`,
          link:    '/seller/dashboard',
          isRead:  false,
        }).save();
      } catch (notifErr) {
        console.error('Seller suspension notification failed:', notifErr.message);
      }
    }

    if (sellerStatus === 'approved' && previousStatus === 'suspended') {
      // ── ISS-017 FIX — reinstatement scoped correctly ─────────
      // Only revives products carrying archivedBySellerSuspension: true,
      // set by THIS suspension's cascade above. A product archived for
      // an unrelated reason before the suspension ever happened does
      // not carry that flag and is left completely untouched. Revived
      // products go to 'submitted', not straight back to 'approved' —
      // a suspension is evidence something needed review, so admin
      // looks again deliberately rather than the listing silently
      // reappearing on its own.
      const cascadeResult = await Product.updateMany(
        { seller: user._id, archivedBySellerSuspension: true },
        {
          $set: {
            status: 'submitted',
            returningAfterSuspension: true,
            archivedBySellerSuspension: false,
            adminFeedback: '',
          },
        }
      );
      productsAffected = cascadeResult.modifiedCount;

      try {
        await new Notification({
          userId:  user._id,
          type:    'transactional',
          title:   'Seller Account Reinstated',
          message: `Your seller account has been reinstated. ${productsAffected} product(s) have been moved back into the review queue and will go live again once approved. Check your dashboard for status.`,
          link:    '/seller/dashboard',
          isRead:  false,
        }).save();
      } catch (notifErr) {
        console.error('Seller reinstatement notification failed:', notifErr.message);
      }
    }

   res.json({
      _id:                       updatedUser._id,
      name:                      updatedUser.name,
      email:                     updatedUser.email,
      isSeller:                  updatedUser.isSeller,
      sellerStatus:              updatedUser.sellerStatus,
      sellerApprovedAt:          updatedUser.sellerApprovedAt,
      sellerSuspendedAt:         updatedUser.sellerSuspendedAt,
      sellerSuspensionDuration:  updatedUser.sellerSuspensionDuration,
      sellerSuspensionExpiresAt: updatedUser.sellerSuspensionExpiresAt,
      productsAffected,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full profile for a user — all linked history (admin only)
// @route   GET /api/users/:id/full-profile
// @access  Private/Admin
const getUserFullProfile = async (req, res) => {
  try {
    const Order        = require('../models/Order');
    const Product      = require('../models/Product');
    const Enquiry      = require('../models/Enquiry');
    const Notification = require('../models/Notification');

    // Run all queries in parallel for performance
    const [user, orders, products, enquiries, notifications] = await Promise.all([
      // User document — exclude password
      User.findById(req.params.id).select('-password').lean(),

      // All orders where this user is the buyer — newest first
      Order.find({ user: req.params.id })
        .sort({ createdAt: -1 })
        .select('_id totalPrice status isPaid isDelivered createdAt orderItems hasTier2Items')
        .lean(),

      // All products where seller field matches this user — newest first
      Product.find({ seller: req.params.id })
        .sort({ createdAt: -1 })
        .select('_id name price image category brand countInStock isOnSale isClearance isFeatured createdAt')
        .lean(),

      // All enquiries submitted by this user — newest first
      Enquiry.find({ userId: req.params.id })
        .sort({ createdAt: -1 })
        .select('_id type status message business createdAt resolvedAt adminNotes')
        .lean(),

      // All notifications sent to this user — newest first, limit 50
      Notification.find({ userId: req.params.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .select('_id type title message isRead createdAt relatedOrderId')
        .lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user,
      orders,
      products,
      enquiries,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the logged-in user's wishlist (populated with product details)
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('wishlist')
      .populate('wishlist.product', 'name price image category countInStock unitType');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Newest-added first; silently drop any entry whose product was deleted
    const wishlist = user.wishlist
      .filter((entry) => entry.product)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a product to the logged-in user's wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyIn = user.wishlist.some(
      (entry) => entry.product.toString() === req.params.productId
    );
    if (alreadyIn) {
      return res.status(400).json({ message: 'This product is already in your wishlist.' });
    }

    user.wishlist.push({ product: req.params.productId, addedAt: Date.now() });
    await user.save();

    res.status(201).json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a product from the logged-in user's wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist = user.wishlist.filter(
      (entry) => entry.product.toString() !== req.params.productId
    );
    await user.save();

    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Recently viewed cap ──────────────────────────────────────────
// Stored up to this many; carousels and the profile tab display the
// most recent 15 client-side.
const RECENTLY_VIEWED_CAP = 50;

// @desc    Get the logged-in user's recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('recentlyViewed')
      .populate('recentlyViewed.product', 'name price image category countInStock unitType');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const recentlyViewed = user.recentlyViewed
      .filter((entry) => entry.product)
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

    res.json(recentlyViewed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a product as recently viewed by the logged-in user
// @route   POST /api/users/recently-viewed/:productId
// @access  Private
//
// Moves the product to the front if already present (re-viewing bumps
// it back to "most recent" instead of creating a duplicate entry),
// then trims the list to RECENTLY_VIEWED_CAP, oldest dropped first.
const trackRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.recentlyViewed = user.recentlyViewed.filter(
      (entry) => entry.product.toString() !== req.params.productId
    );
    user.recentlyViewed.unshift({ product: req.params.productId, viewedAt: Date.now() });
    user.recentlyViewed = user.recentlyViewed.slice(0, RECENTLY_VIEWED_CAP);

    await user.save();
    res.status(201).json({ message: 'Recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update the logged-in user's notification preferences
// @route   PUT /api/users/notification-preferences
// @access  Private
//
// orderUpdates is accepted here for completeness but the frontend never
// exposes a toggle for it — it's operational, not marketing, so it's
// effectively always on.
const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { orderUpdates, promotions, newsletter, wishlistAlerts } = req.body;

    user.notificationPreferences = {
      orderUpdates:   orderUpdates   ?? user.notificationPreferences?.orderUpdates   ?? true,
      promotions:     promotions     ?? user.notificationPreferences?.promotions     ?? true,
      newsletter:     newsletter     ?? user.notificationPreferences?.newsletter     ?? true,
      wishlistAlerts: wishlistAlerts ?? user.notificationPreferences?.wishlistAlerts ?? true,
    };

    await user.save();
    res.json({
      message: 'Notification preferences updated',
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Exports ───────────────────────────────────────────────────
module.exports = {
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
};