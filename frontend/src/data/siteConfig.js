// frontend/src/data/siteConfig.js
// ─────────────────────────────────────────────────────────────
// Single source of truth for business details used across the
// site (legal pages, footer, contact copy). When the real domain
// and company registration exist, change values HERE ONLY.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: 'ShopZone',
  // PLACEHOLDER — replace with the registered business name.
  legalName: 'ShopZone Wholesale',
  // PLACEHOLDER — a free Gmail works until a domain is bought.
  supportEmail: 'support@shopzone.com',
  // PLACEHOLDER — real number once a business line exists.
  supportPhone: '+254 700 000 000',
  location: 'Nairobi, Kenya',
  // PLACEHOLDERS — filled in once registration is complete.
  registrationNumber: '[Company registration number — to be added]',
  kraPin: '[KRA PIN — to be added]',
  odpcRegistration: '[ODPC registration number — to be added]',
  // Shown at the top of every legal document.
  legalLastUpdated: '18 October 2026',
  // While true, every legal page shows a "draft" notice banner.
  // Set to false once a lawyer has reviewed and approved the text.
  isPlaceholder: true,
};