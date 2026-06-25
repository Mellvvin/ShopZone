// frontend/src/utils/formatDateTime.js
// ─────────────────────────────────────────────────────────────
// Shared date/time formatter for ShopZone.
//
// PROBLEM THIS SOLVES:
// toLocaleString() / toLocaleDateString() use the VIEWING DEVICE's
// system timezone when no timeZone option is given. If a buyer's,
// seller's, or admin's computer has its clock set to the wrong
// timezone, every order date on the platform displays incorrectly —
// even though the timestamp stored in MongoDB (always UTC) is
// correct. This is exactly what happened: an order placed at
// 8:18pm Nairobi time was stored as 17:18 UTC, which is CORRECT,
// but a viewing device on a different timezone setting displayed
// it as 6:18pm.
//
// FIX:
// Every order, payment, and delivery timestamp on ShopZone is
// always displayed in Africa/Nairobi time (UTC+3), explicitly,
// no matter what timezone the viewer's device thinks it's in.
// This matches how the business operates — delivery windows and
// "quote within 24 hours" promises are Nairobi-based — and it
// means a misconfigured device, or a buyer viewing from another
// country, always sees the same unambiguous Nairobi-relative time
// the operations team sees.
//
// Usage:
//   import { formatDate, formatDateTime } from '../utils/formatDateTime';
//   formatDate(order.createdAt)      → "23 June 2026"
//   formatDateTime(order.createdAt)  → "23 June 2026, 8:18 PM"
// ─────────────────────────────────────────────────────────────

const NAIROBI_TZ = 'Africa/Nairobi';

// Full date, no time — e.g. order placed date headers
export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: NAIROBI_TZ,
  });
};

// Full date and time — e.g. "Placed on", "Paid", "Confirmed on"
export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: NAIROBI_TZ,
  });
};

// Compact date — used in table rows and list views
export const formatDateShort = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: NAIROBI_TZ,
  });
};