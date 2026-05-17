// backend/controllers/userController.js
// ─────────────────────────────────────────────────────────────
// Handles all user-related logic:
//   registerUser, loginUser, logoutUser,
//   getUserProfile, updateUserProfile,
//   getAllUsers, getUserById, updateUser, deleteUser
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
    // Rules: at least 8 chars, one uppercase, one number.
    // Enforced here so the API is protected even if called directly.
    const passwordRules = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRules.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include one uppercase letter and one number.',
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

    // ── Create user ───────────────────────────────────────────
    // Password hashing is handled by the pre-save hook in User.js
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      accountType: accountType || 'individual',
      businessName: accountType === 'business' ? businessName.trim() : '',
      businessType: accountType === 'business' ? businessType || '' : '',
      county: county || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        businessName: user.businessName,
        businessType: user.businessType,
        county: user.county,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
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

    // Check user exists and password matches
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
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user (client handles token removal)
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
        isAdmin: user.isAdmin,
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
      // Update fields if provided, otherwise keep existing values
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone ?? user.phone;
      user.county = req.body.county ?? user.county;
      user.accountType = req.body.accountType || user.accountType;
      user.businessName = req.body.businessName ?? user.businessName;
      user.businessType = req.body.businessType ?? user.businessType;

      // Only hash and update password if a new one was provided
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        accountType: updatedUser.accountType,
        businessName: updatedUser.businessName,
        businessType: updatedUser.businessType,
        county: updatedUser.county,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
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
    // Exclude password field from results
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
};