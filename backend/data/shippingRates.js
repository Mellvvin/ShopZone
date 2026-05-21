// shippingRates.js
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone delivery rate constants.
//
// SYSTEM OVERVIEW:
//   Tier 1 — Standard goods (most categories)
//     Flat rate by buyer's county. Rate is looked up at order creation using
//     the county stored on the buyer's shipping address. No buyer-courier
//     contact. ShopZone coordinates dispatch with the seller.
//
//   Tier 2 — Heavy / bulk goods
//     Applies to: Hardware & Tools, Agriculture & Garden, Fabric & Textiles.
//     Delivery fee is marked as QUOTE_REQUIRED at order creation.
//     Admin obtains a courier quote and sends it to the buyer via their
//     dashboard. Buyer approves. Order proceeds.
//
// HOW TO UPDATE RATES:
//   Review quarterly against Sendy and Fargo published rate cards.
//   Update the KES values in COUNTY_SHIPPING_RATES below.
//   No code changes needed anywhere else — orderController reads from here.
//
// USAGE (backend):
//   const { getShippingRate, isTier2Category, SHIPPING_CONSTANTS } = require('./shippingRates');
// ─────────────────────────────────────────────────────────────────────────────

// ── Tier 2 categories — these always require a delivery quote ─────────────
// Must match MongoDB category strings exactly.
const TIER_2_CATEGORIES = [
  'Hardware & Tools',
  'Agriculture & Garden',
  'Fabric & Textiles',
];

// ── Delivery zones and their KES flat rates ───────────────────────────────
// Each zone maps to a list of Kenyan counties (all 47 covered).
// The rate is the flat delivery fee charged to the buyer at checkout.
// Tier 2 surcharge is added ON TOP of the base rate for bulk/heavy orders
// that still get a quote — it is a deposit to cover minimum logistics cost.

const SHIPPING_ZONES = [
  {
    zone: 'Nairobi',
    rate: 300,              // KES — cheapest, most suppliers here
    tier2Surcharge: 500,    // KES extra for bulk goods quote deposit
    estimatedDays: '1–2 days',
    counties: ['Nairobi'],
  },
  {
    zone: 'Central Kenya',
    rate: 500,
    tier2Surcharge: 800,
    estimatedDays: '2–3 days',
    counties: ['Kiambu', 'Machakos', 'Kajiado', "Murang'a", 'Kirinyaga'],
  },
  {
    zone: 'Rift Valley',
    rate: 700,
    tier2Surcharge: 1200,
    estimatedDays: '2–4 days',
    counties: ['Nakuru', 'Naivasha', 'Kericho', 'Bomet', 'Laikipia'],
  },
  {
    zone: 'Nyanza & Western',
    rate: 900,
    tier2Surcharge: 1500,
    estimatedDays: '3–5 days',
    counties: ['Kisumu', 'Kakamega', 'Siaya', 'Homa Bay', 'Migori', 'Nyamira', 'Vihiga', 'Busia'],
  },
  {
    zone: 'North Rift',
    rate: 900,
    tier2Surcharge: 1500,
    estimatedDays: '3–5 days',
    counties: ['Uasin Gishu', 'Trans Nzoia', 'Baringo', 'Elgeyo-Marakwet', 'Nandi', 'Samburu', 'West Pokot'],
  },
  {
    zone: 'Eastern',
    rate: 800,
    tier2Surcharge: 1400,
    estimatedDays: '2–4 days',
    counties: ['Kitui', 'Makueni', 'Embu', 'Tharaka-Nithi', 'Meru'],
  },
  {
    zone: 'Coast',
    rate: 1000,
    tier2Surcharge: 1800,
    estimatedDays: '3–5 days',
    counties: ['Mombasa', 'Kilifi', 'Kwale', 'Taita Taveta', 'Lamu', 'Tana River'],
  },
  {
    zone: 'North Eastern',
    rate: 1500,
    tier2Surcharge: 2500,
    estimatedDays: '5–7 days',
    counties: ['Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Turkana'],
  },
  {
    zone: 'Rest of Kenya',
    rate: 800,             // fallback for any county not listed above
    tier2Surcharge: 1400,
    estimatedDays: '3–5 days',
    counties: [],          // empty = catches everything else
  },
];

// ── Platform constants ────────────────────────────────────────────────────
const SHIPPING_CONSTANTS = {
  VAT_RATE: 0.16,                  // 16% VAT applied to goods subtotal
  QUOTE_REQUIRED_PLACEHOLDER: 0,   // Stored in DB when Tier 2 quote is pending
  QUOTE_REQUIRED_LABEL: 'Quote Required', // Shown in UI for Tier 2 orders
  MIN_FREE_SHIPPING: null,         // null = no free shipping threshold (B2B policy)
  COMMISSION_DEFAULT: 0.06,        // 6% default platform commission (tracked, not charged yet)
};

// ── Flat rate lookup — build a county → rate map at module load ───────────
// This pre-computes the lookup so getShippingRate() is O(1) at runtime.
const _countyRateMap = {};
const _countyZoneMap = {};

for (const zone of SHIPPING_ZONES) {
  for (const county of zone.counties) {
    const key = county.toLowerCase().trim();
    _countyRateMap[key] = {
      rate: zone.rate,
      tier2Surcharge: zone.tier2Surcharge,
      zone: zone.zone,
      estimatedDays: zone.estimatedDays,
    };
    _countyZoneMap[key] = zone.zone;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// getShippingRate(county)
// ─────────────────────────────────────────────────────────────────────────
// Returns the shipping data for a given county string.
// Falls back to 'Rest of Kenya' if county is not found.
//
// @param  {string} county  — the buyer's county from shippingAddress
// @returns {object} { rate, tier2Surcharge, zone, estimatedDays }
// ─────────────────────────────────────────────────────────────────────────
const getShippingRate = (county) => {
  if (!county) {
    // No county provided — fall back to rest of Kenya rate
    const fallback = SHIPPING_ZONES.find((z) => z.zone === 'Rest of Kenya');
    return {
      rate: fallback.rate,
      tier2Surcharge: fallback.tier2Surcharge,
      zone: fallback.zone,
      estimatedDays: fallback.estimatedDays,
    };
  }

  const key = county.toLowerCase().trim();
  if (_countyRateMap[key]) {
    return _countyRateMap[key];
  }

  // County not in any explicit list — use fallback
  const fallback = SHIPPING_ZONES.find((z) => z.zone === 'Rest of Kenya');
  return {
    rate: fallback.rate,
    tier2Surcharge: fallback.tier2Surcharge,
    zone: fallback.zone,
    estimatedDays: fallback.estimatedDays,
  };
};

// ─────────────────────────────────────────────────────────────────────────
// isTier2Category(category)
// ─────────────────────────────────────────────────────────────────────────
// Returns true if ALL items in an order belong to Tier 2 categories.
// If even one item is a standard category, Tier 1 rate applies and
// the bulk items are noted in the order for manual follow-up.
//
// @param  {string} category — product category string from the order item
// @returns {boolean}
// ─────────────────────────────────────────────────────────────────────────
const isTier2Category = (category) => {
  return TIER_2_CATEGORIES.includes(category);
};

// ─────────────────────────────────────────────────────────────────────────
// hasAnyTier2Item(orderItems)
// ─────────────────────────────────────────────────────────────────────────
// Returns true if ANY item in the order is a Tier 2 category.
// Used to flag mixed orders for admin attention.
//
// @param  {Array} orderItems — array of order item objects with .category
// @returns {boolean}
// ─────────────────────────────────────────────────────────────────────────
const hasAnyTier2Item = (orderItems) => {
  return orderItems.some((item) => isTier2Category(item.category));
};

// ─────────────────────────────────────────────────────────────────────────
// isFullyTier2Order(orderItems)
// ─────────────────────────────────────────────────────────────────────────
// Returns true only if EVERY item is a Tier 2 category.
// A fully Tier 2 order sets shippingPrice to 0 and marks quoteRequired.
//
// @param  {Array} orderItems
// @returns {boolean}
// ─────────────────────────────────────────────────────────────────────────
const isFullyTier2Order = (orderItems) => {
  return orderItems.every((item) => isTier2Category(item.category));
};

// ── All 47 counties as an array (for frontend dropdowns) ─────────────────
// This matches the Kenya counties dropdown in RegisterPage and ShippingPage.
const ALL_KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
  'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi',
  'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya',
  'Taita Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana',
  'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];

module.exports = {
  getShippingRate,
  isTier2Category,
  hasAnyTier2Item,
  isFullyTier2Order,
  SHIPPING_ZONES,
  SHIPPING_CONSTANTS,
  TIER_2_CATEGORIES,
  ALL_KENYA_COUNTIES,
};
