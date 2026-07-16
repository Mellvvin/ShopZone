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

    // ── Wishlist ────────────────────────────────────────────────
    // Products the buyer has bookmarked. Embedded array, same
    // lightweight pattern as Product.reviews — no separate
    // collection needed at this scale.
    wishlist: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Recently viewed ─────────────────────────────────────────
    // Tied to the account now (previously localStorage-only, device-
    // bound, in SearchBar.jsx). Capped at 50 entries by the controller
    // — newest first, oldest trimmed off on push. The profile tab and
    // the homepage/cart carousels all read from this, showing the
    // most recent 15.
    recentlyViewed: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Saved M-Pesa number for checkout ────────────────────────
    // Buyer's own convenience default at checkout — distinct from
    // sellerProfile.mpesaNumber below, which is where a seller's
    // payouts are sent. Optional, buyer opts in.
    savedMpesaNumber: { type: String, default: '' },

    // ── Notification preferences ────────────────────────────────
    // orderUpdates is not exposed as a toggle in the UI (operational,
    // not marketing) but stored here for consistency. The rest are
    // opt-out toggles the buyer controls from the profile tab.
    notificationPreferences: {
      orderUpdates:   { type: Boolean, default: true },
      promotions:     { type: Boolean, default: true },
      newsletter:     { type: Boolean, default: true },
      wishlistAlerts: { type: Boolean, default: true },
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
    sellerApprovedAt:  {
       type: Date,
        default: null },
        
    sellerSuspendedAt: {
      type: Date,
      default: null,
    },
    // ── Suspension duration tracking (ISS-016 follow-up) ────────────
    // sellerSuspensionDuration stores admin's chosen review window as
    // a label, purely for display — e.g. "3 days", "7 days", "14 days",
    // "Indefinite — manual review". It does not drive any automatic
    // unattended unsuspension; reinstatement always remains a deliberate
    // admin action via updateSellerStatus. This pair exists so admin is
    // never able to "suspend and forget" — the expiry date is always
    // visible on AdminSellersPage and AdminUserDetailPage as a reminder
    // that the case needs revisiting, and the seller is told exactly
    // when they'll be reconsidered.
    sellerSuspensionDuration: {
      type: String,
      default: '',
    },
    sellerSuspensionExpiresAt: {
      type: Date,
      default: null,
    },
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