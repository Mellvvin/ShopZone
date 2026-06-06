// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    accountType: { type: String, enum: ['individual', 'business'], default: 'individual' },
    businessName: { type: String, default: '' },
    businessType: { type: String, enum: ['Retailer', 'Wholesaler', 'Distributor', 'Other', ''], default: '' },
 county: { type: String, default: '' },
    // ── Saved delivery address ────────────────────────────────
    // Stored on the user so ShippingPage can pre-fill on checkout.
    // All fields optional — existing users have no address saved yet.
    shippingAddress: {
      address:   { type: String, default: '' },
      apartment: { type: String, default: '' },
      city:      { type: String, default: '' },
      county:    { type: String, default: '' },
      country:   { type: String, default: 'Kenya' },
    },
   isAdmin: { type: Boolean, default: false },

    // ── Seller role fields ────────────────────────────────────
    // Added in Step 4. All optional — existing users default to
    // isSeller: false and sellerStatus: 'none' automatically.
    isSeller: { type: Boolean, default: false },

    // sellerStatus tracks where the seller is in the approval flow:
    //   none      — not a seller, has not applied
    //   pending   — application submitted, awaiting admin review
    //   approved  — active approved seller
    //   suspended — was approved but has been suspended by admin
    //   rejected  — application was rejected
    sellerStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'suspended', 'rejected'],
      default: 'none',
    },

    // sellerProfile holds the seller's business details collected
    // during the application. Populated when status moves to pending.
    sellerProfile: {
      businessName:    { type: String, default: '' },
      businessAddress: { type: String, default: '' },
      description:     { type: String, default: '' },
      kraPin:          { type: String, default: '' },
      mpesaNumber:     { type: String, default: '' },
    },

    // Timestamps for key seller lifecycle events — admin-only visibility
    sellerApprovedAt:  { type: Date, default: null },
    sellerSuspendedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Password comparison method ─────────────────────────────────
// Called in loginUser to verify the entered password against
// the hashed password stored in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook removed — password is hashed directly in the
// controller to avoid a conflict with the bcryptjs UMD build
// which overwrites the Mongoose middleware next/done parameter.

const User = mongoose.model('User', userSchema);
module.exports = User;