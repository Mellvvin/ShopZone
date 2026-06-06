// backend/models/Notification.js
// ─────────────────────────────────────────────────────────────
// Notification model — stores all in-app notifications for users.
// Created by admin actions, order status changes, and enquiry replies.
// Sellers will also receive payout and approval notifications once
// the seller dashboard (Step 5) is built.
//
// type field separates transactional alerts from promotional ones
// so buyers can distinguish order updates from marketing messages.
// ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    // The user this notification belongs to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // transactional — order updates, quote responses, approvals, payouts
    // promotional  — marketing messages, new arrivals, platform announcements
    type: {
      type: String,
      enum: ['transactional', 'promotional'],
      default: 'transactional',
    },
    // Short headline shown in the dropdown panel
    title: { type: String, required: true },
    // Full message body
    message: { type: String, required: true },
    // Whether the user has read this notification
    isRead: { type: Boolean, default: false },
    // Optional links to related records — used for navigation on click
    relatedOrderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   default: null },
    relatedEnquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;