// frontend/src/utils/formatKES.js
// ─────────────────────────────────────────────────────────────
// Shared currency formatter for all KES price display across
// the ShopZone frontend.
//
// Usage:
//   import { formatKES } from '../utils/formatKES';
//   formatKES(2400)      → "KES 2,400.00"
//   formatKES(1999.5)    → "KES 1,999.50"
//   formatKES(null)      → "KES 0.00"
//
// This replaces the repeated pattern:
//   `KES ${Number(x).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
// which is error-prone and scattered across dozens of components.
// ─────────────────────────────────────────────────────────────

export const formatKES = (amount) => {
  const value = Number(amount) || 0;
  return `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
};