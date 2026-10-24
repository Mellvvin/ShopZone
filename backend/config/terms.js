// backend/config/terms.js
// ─────────────────────────────────────────────────────────────
// Single source of truth for the current Terms version (ISS-091).
// Bump this whenever the Terms of Service or Privacy Policy change
// materially, and update legalLastUpdated in
// frontend/src/data/siteConfig.js at the same time. Every account
// whose stored termsVersion differs is prompted to accept again and
// is blocked from placing orders or applying as a seller until it does.
// ─────────────────────────────────────────────────────────────
const TERMS_VERSION = '2026-10-24';

module.exports = { TERMS_VERSION };