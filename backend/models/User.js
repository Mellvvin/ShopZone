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
    isAdmin: { type: Boolean, default: false },
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