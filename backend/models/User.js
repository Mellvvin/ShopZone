// backend/models/User.js
// ─────────────────────────────────────────────────────────────
// User model — defines the shape of every user document in MongoDB.
//
// Updated to capture B2B wholesale buyer details:
//   phone        — required for M-Pesa payments and delivery
//   accountType  — 'individual' or 'business'
//   businessName — only required when accountType is 'business'
//   businessType — Retailer / Wholesaler / Distributor / Other
//   county       — one of Kenya's 47 counties
// ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    // ── Core auth fields ─────────────────────────────────────
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // ── Contact ──────────────────────────────────────────────
    // Required for M-Pesa and delivery coordination
    phone: {
      type: String,
      default: '',
    },

    // ── Account type ─────────────────────────────────────────
    // 'individual' — personal buyer / someone starting out
    // 'business'   — registered business buyer
    accountType: {
      type: String,
      enum: ['individual', 'business'],
      default: 'individual',
    },

    // ── Business details — only populated when accountType is 'business'
    businessName: {
      type: String,
      default: '',
    },
    // What kind of business they run
    businessType: {
      type: String,
      enum: ['Retailer', 'Wholesaler', 'Distributor', 'Other', ''],
      default: '',
    },

    // ── Location ─────────────────────────────────────────────
    // Kenya county — used for delivery logistics and analytics
    county: {
      type: String,
      default: '',
    },

    // ── Platform role ────────────────────────────────────────
    // true = admin access to the dashboard
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Password comparison method ────────────────────────────────
// Called during login to check the entered password against
// the hashed version stored in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Pre-save hook — hash password before saving ───────────────
// Only runs when the password field has been modified so that
// updating other fields (name, phone etc.) does not re-hash.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;