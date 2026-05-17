// backend/data/products.js
// ─────────────────────────────────────────────────────────────
// Seed data for the Product collection.
// Run with: node seeder.js from the backend folder.
//
// Updated to add products for:
//   Baby & Kids, Sports & Outdoors, Health & Wellness
// ─────────────────────────────────────────────────────────────

const products = [
  // ── 1. Electronics ───────────────────────────────────────
  {
    name: 'Samsung A15 Smartphones — Carton of 10',
    image: '/images/sample.jpg',
    category: 'Electronics',
    description: 'Wholesale carton of 10 Samsung A15 smartphones. Popular entry-level Android handsets, ideal for retail resale. Comes with manufacturer warranty.',
    price: 45000,
    salePrice: 40000,
    countInStock: 25,
    unit: 'Carton',
    rating: 4.5,
    numReviews: 8,
    tags: ['smartphones', 'samsung', 'electronics', 'wholesale', 'android'],
    isFeatured: true,
    isOnSale: true,
    isClearance: false,
  },

  // ── 2. Fashion & Apparel ──────────────────────────────────
  {
    name: "Men's Cotton T-Shirts — Bale of 50",
    image: '/images/sample.jpg',
    category: 'Fashion & Apparel',
    description: "Bale of 50 assorted men's cotton round-neck T-shirts. Mixed sizes S–XL, mixed colours. Ideal for market traders and clothing retailers.",
    price: 8500,
    salePrice: null,
    countInStock: 60,
    unit: 'Bale',
    rating: 4.2,
    numReviews: 5,
    tags: ['clothing', 'tshirts', 'mens', 'cotton', 'fashion', 'bulk'],
    isFeatured: true,
    isOnSale: false,
    isClearance: false,
  },

  // ── 3. Food & Grocery ────────────────────────────────────
  {
    name: 'Pembe Maize Flour — Sack of 90kg',
    image: '/images/sample.jpg',
    category: 'Food & Grocery',
    description: 'Pembe brand maize flour in a 90kg sack. Finely milled, ideal for uji and ugali. Popular staple for grocery stores and distributors across Kenya.',
    price: 3800,
    salePrice: 3500,
    countInStock: 120,
    unit: 'Sack',
    rating: 4.8,
    numReviews: 14,
    tags: ['flour', 'maize', 'pembe', 'staple', 'food', 'grocery', 'bulk'],
    isFeatured: true,
    isOnSale: true,
    isClearance: false,
  },

  // ── 4. Home & Kitchen ────────────────────────────────────
  {
    name: 'Sufuria Set — Aluminium Cooking Pots (Box of 12)',
    image: '/images/sample.jpg',
    category: 'Home & Kitchen',
    description: 'Box of 12 aluminium sufurias in assorted sizes (20cm–32cm). Heavy gauge, suitable for daily commercial cooking. Popular in hotels, schools and households.',
    price: 7200,
    salePrice: null,
    countInStock: 40,
    unit: 'Box',
    rating: 4.3,
    numReviews: 6,
    tags: ['sufuria', 'cooking', 'aluminium', 'kitchen', 'pots', 'wholesale'],
    isFeatured: false,
    isOnSale: false,
    isClearance: false,
  },

  // ── 5. Beauty & Personal Care ────────────────────────────
  {
    name: 'Vaseline Body Lotion 400ml — Carton of 24',
    image: '/images/sample.jpg',
    category: 'Beauty & Personal Care',
    description: 'Carton of 24 Vaseline Intensive Care body lotions (400ml each). Fast-moving FMCG product for supermarkets, pharmacies and cosmetics retailers.',
    price: 5500,
    salePrice: 4800,
    countInStock: 80,
    unit: 'Carton',
    rating: 4.6,
    numReviews: 11,
    tags: ['vaseline', 'lotion', 'beauty', 'skincare', 'fmcg', 'wholesale'],
    isFeatured: false,
    isOnSale: true,
    isClearance: false,
  },

  // ── 6. Hardware & Tools ──────────────────────────────────
  {
    name: 'Stanley Hammer — Box of 12',
    image: '/images/sample.jpg',
    category: 'Hardware & Tools',
    description: 'Box of 12 Stanley claw hammers (16oz). Fibreglass handle, steel head. Ideal for hardware shops, construction suppliers and tool retailers.',
    price: 9600,
    salePrice: null,
    countInStock: 30,
    unit: 'Box',
    rating: 4.4,
    numReviews: 4,
    tags: ['hammer', 'stanley', 'tools', 'hardware', 'construction', 'wholesale'],
    isFeatured: false,
    isOnSale: false,
    isClearance: true,
  },

  // ── 7. Office & Stationery ───────────────────────────────
  {
    name: 'Bic Ballpoint Pens — Carton of 50 Dozen',
    image: '/images/sample.jpg',
    category: 'Office & Stationery',
    description: 'Carton of 50 dozen Bic Cristal ballpoint pens (blue). The most popular pen in Kenya. Ideal for stationery shops, schools and office suppliers.',
    price: 4200,
    salePrice: 3800,
    countInStock: 200,
    unit: 'Carton',
    rating: 4.7,
    numReviews: 19,
    tags: ['pens', 'bic', 'stationery', 'office', 'school', 'wholesale', 'bulk'],
    isFeatured: true,
    isOnSale: true,
    isClearance: false,
  },

  // ── 8. Agriculture & Garden ──────────────────────────────
  {
    name: 'NPK Fertiliser — 50kg Bag',
    image: '/images/sample.jpg',
    category: 'Agriculture & Garden',
    description: 'NPK 17:17:17 compound fertiliser in a 50kg bag. Balanced nutrient formula suitable for maize, vegetables and cash crops. KEBS certified.',
    price: 6500,
    salePrice: null,
    countInStock: 150,
    unit: 'Sack',
    rating: 4.5,
    numReviews: 9,
    tags: ['fertiliser', 'npk', 'agriculture', 'farming', 'crops', 'wholesale'],
    isFeatured: false,
    isOnSale: false,
    isClearance: false,
  },

  // ── 9. Fabric & Textiles ─────────────────────────────────
  {
    name: 'Kitenge Fabric — Bale of 100 Metres',
    image: '/images/sample.jpg',
    category: 'Fabric & Textiles',
    description: 'Bale of 100 metres of assorted Kitenge African print fabric. 100% cotton, vibrant colours. Ideal for tailors, fashion designers and fabric retailers.',
    price: 12000,
    salePrice: 10500,
    countInStock: 35,
    unit: 'Bale',
    rating: 4.6,
    numReviews: 7,
    tags: ['kitenge', 'fabric', 'african', 'textile', 'cotton', 'fashion', 'wholesale'],
    isFeatured: true,
    isOnSale: true,
    isClearance: false,
  },

  // ── 10. General Merchandise ──────────────────────────────
  {
    name: 'Plastic Storage Baskets — Box of 24',
    image: '/images/sample.jpg',
    category: 'General Merchandise',
    description: 'Box of 24 heavy-duty plastic storage baskets in assorted colours. Multi-purpose household use. Fast-moving item for general merchandise retailers.',
    price: 3600,
    salePrice: 2900,
    countInStock: 90,
    unit: 'Box',
    rating: 4.1,
    numReviews: 3,
    tags: ['baskets', 'plastic', 'storage', 'household', 'general', 'wholesale'],
    isFeatured: false,
    isOnSale: false,
    isClearance: true,
  },

  // ── 11. Baby & Kids ──────────────────────────────────────
  {
    name: 'Pampers Baby Diapers Size 4 — Carton of 6 Packs',
    image: '/images/sample.jpg',
    category: 'Baby & Kids',
    description: 'Carton of 6 packs of Pampers Active Baby diapers size 4 (9–14kg). Each pack contains 52 diapers. Fast-moving baby care essential for supermarkets, pharmacies and baby shops across Kenya.',
    price: 8400,
    salePrice: 7800,
    countInStock: 75,
    unit: 'Carton',
    rating: 4.8,
    numReviews: 12,
    tags: ['pampers', 'diapers', 'baby', 'kids', 'baby care', 'wholesale', 'fmcg'],
    isFeatured: true,
    isOnSale: true,
    isClearance: false,
  },

  // ── 12. Sports & Outdoors ────────────────────────────────
  {
    name: 'Adidas Football — Box of 20',
    image: '/images/sample.jpg',
    category: 'Sports & Outdoors',
    description: 'Box of 20 Adidas Tango league footballs size 5. Durable synthetic leather, suitable for training and recreational play. Ideal for sports shops, schools and football academies.',
    price: 18000,
    salePrice: null,
    countInStock: 20,
    unit: 'Box',
    rating: 4.5,
    numReviews: 6,
    tags: ['football', 'adidas', 'sports', 'outdoors', 'soccer', 'wholesale'],
    isFeatured: false,
    isOnSale: false,
    isClearance: false,
  },

  // ── 13. Health & Wellness ────────────────────────────────
  {
    name: 'Dettol Antiseptic Liquid 500ml — Carton of 24',
    image: '/images/sample.jpg',
    category: 'Health & Wellness',
    description: 'Carton of 24 Dettol antiseptic liquid bottles (500ml each). Multi-purpose disinfectant used in homes, clinics and schools. One of the most trusted health brands in Kenya.',
    price: 6200,
    salePrice: 5500,
    countInStock: 100,
    unit: 'Carton',
    rating: 4.9,
    numReviews: 21,
    tags: ['dettol', 'antiseptic', 'health', 'wellness', 'disinfectant', 'wholesale', 'fmcg'],
    isFeatured: false,
    isOnSale: true,
    isClearance: false,
  },
];

module.exports = products;