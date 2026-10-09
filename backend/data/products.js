// backend/data/products.js
// 100 products across all 13 live categories (Electronics, Fashion &
// Apparel, Fabric & Textiles, Food & Grocery, Home & Kitchen, General
// Merchandise, Beauty & Personal Care, Health & Wellness, Hardware &
// Tools, Agriculture & Garden, Baby & Kids, Office & Stationery,
// Sports & Outdoors) — category strings copied verbatim from the
// live products.js, not retyped from memory.
//
// `seller` here is a plain email string or null. seeder.js resolves
// it to a real ObjectId (or null for admin-managed stock) at import
// time — this file never touches the database directly.

const base = (category, seller, overrides) => {
  const unitLabel = (overrides.unitType || 'Per Unit').toLowerCase();
  const brandPrefix = overrides.brand ? `${overrides.brand} — ` : '';
  const description =
    overrides.description ||
    `${brandPrefix}${overrides.name} available wholesale for Kenyan retailers and distributors, sold per ${unitLabel}. Quality-checked stock with reliable restocking through ShopZone's verified ${category.toLowerCase()} suppliers.`;

  return {
    category,
    seller,
    image: '/images/sample.jpg',
    price: 0,
    salePrice: null,
    countInStock: 50,
    unit: 'Per Unit',
    brand: '',
    unitType: 'Per Unit',
    minimumOrderQuantity: 1,
    itemsPerUnit: null,
    weightPerUnit: null,
    dimensions: '',
    isBulkOnly: false,
    leadTimeDays: 5,
    rating: 4.3,
    numReviews: 10,
    tags: [],
    isFeatured: false,
    isOnSale: false,
    isClearance: false,
    status: 'approved',
    adminFeedback: '',
    ...overrides,
    description,
  };
};

const products = [

  // ── Electronics (12) ──────────────────────────────────────────
  base('Electronics', null, { name: 'Samsung A15 Smartphones — Carton of 10', brand: 'Samsung', price: 45000, salePrice: 40000, isOnSale: true, isFeatured: true, countInStock: 24, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 10, weightPerUnit: 4, minimumOrderQuantity: 1, leadTimeDays: 3, rating: 4.5, numReviews: 8, tags: ['smartphones', 'samsung', 'electronics', 'wholesale', 'android'] }),
  base('Electronics', 'seller1@shopzone.test', { name: 'Infinix Hot 40 Smartphones — Carton of 10', brand: 'Infinix', price: 38000, countInStock: 30, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 10, weightPerUnit: 4, leadTimeDays: 4, rating: 4.2, numReviews: 15, tags: ['smartphones', 'infinix', 'electronics', 'android'] }),
  base('Electronics', 'seller1@shopzone.test', { name: 'Oraimo 20000mAh Power Banks — Box of 24', brand: 'Oraimo', price: 18000, countInStock: 40, unit: 'Box', unitType: 'Box', itemsPerUnit: 24, leadTimeDays: 3, rating: 4.4, numReviews: 22, tags: ['power bank', 'oraimo', 'accessories'] }),
  base('Electronics', null, { name: 'Vitron 32" LED TVs — Pallet of 6', brand: 'Vitron', price: 54000, countInStock: 6, unit: 'Per Unit', unitType: 'Pallet', itemsPerUnit: 6, weightPerUnit: 45, isBulkOnly: true, leadTimeDays: 10, rating: 4.1, numReviews: 6, tags: ['tv', 'vitron', 'electronics', 'bulk'] }),
  base('Electronics', 'seller1@shopzone.test', { name: 'Syinix Bluetooth Speakers — Carton of 20', brand: 'Syinix', price: 22000, countInStock: 35, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 20, leadTimeDays: 4, rating: 4.0, numReviews: 11, tags: ['speakers', 'bluetooth', 'audio'] }),
  base('Electronics', 'seller1@shopzone.test', { name: 'USB-C Fast Chargers 20W — Carton of 50', price: 15000, countInStock: 60, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 50, leadTimeDays: 3, rating: 3.9, numReviews: 18, tags: ['charger', 'usb-c', 'accessories', 'generic'] }),
  base('Electronics', null, { name: 'Oraimo Wireless Earbuds — Box of 30', brand: 'Oraimo', price: 27000, countInStock: 25, unit: 'Box', unitType: 'Box', itemsPerUnit: 30, leadTimeDays: 5, rating: 4.3, numReviews: 20, tags: ['earbuds', 'oraimo', 'wireless'] }),
  base('Electronics', null, { name: 'LG 1.5HP Split Air Conditioners — Pallet of 4', brand: 'LG', price: 180000, countInStock: 4, unit: 'Per Unit', unitType: 'Pallet', itemsPerUnit: 4, weightPerUnit: 38, isBulkOnly: true, leadTimeDays: 14, rating: 4.6, numReviews: 5, tags: ['air conditioner', 'lg', 'appliances', 'bulk'] }),
  base('Electronics', 'seller1@shopzone.test', { name: 'Philips LED Bulbs 9W — Carton of 100', brand: 'Philips', price: 12000, countInStock: 80, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 100, leadTimeDays: 3, rating: 4.4, numReviews: 27, tags: ['led bulb', 'philips', 'lighting'] }),
  base('Electronics', 'seller1@shopzone.test', { name: 'Sony Car Stereo Systems — Box of 15', brand: 'Sony', price: 48000, countInStock: 18, unit: 'Box', unitType: 'Box', itemsPerUnit: 15, leadTimeDays: 6, rating: 4.2, numReviews: 9, tags: ['car stereo', 'sony', 'audio'] }),
  base('Electronics', null, { name: 'Infinix Smart Watches — Carton of 25', brand: 'Infinix', price: 21000, countInStock: 30, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 25, leadTimeDays: 5, rating: 4.0, numReviews: 13, tags: ['smartwatch', 'infinix', 'wearables'] }),
  base('Electronics', 'seller1@shopzone.test', { name: 'Tempered Glass Screen Protectors — Pack of 500', price: 9000, salePrice: 6500, isClearance: true, countInStock: 45, unit: 'Per Unit', unitType: 'Pack', itemsPerUnit: 500, leadTimeDays: 2, rating: 3.8, numReviews: 31, tags: ['screen protector', 'accessories', 'clearance'] }),

  // ── Fashion & Apparel (8) ──────────────────────────────────────
  base('Fashion & Apparel', 'seller2@shopzone.test', { name: "Men's Cotton T-Shirts — Bale of 50", brand: 'Rivatex', price: 18000, countInStock: 20, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 50, weightPerUnit: 25, leadTimeDays: 5, rating: 4.1, numReviews: 14, tags: ['t-shirts', 'menswear', 'bale'] }),
  base('Fashion & Apparel', 'seller2@shopzone.test', { name: "Women's Ankara Print Dresses — Bale of 30", price: 24000, countInStock: 15, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 30, weightPerUnit: 20, leadTimeDays: 6, rating: 4.3, numReviews: 19, tags: ['ankara', 'dresses', 'womenswear'] }),
  base('Fashion & Apparel', 'seller2@shopzone.test', { name: "Children's School Uniform Shirts — Dozen", price: 4200, countInStock: 50, unit: 'Dozen', unitType: 'Dozen', itemsPerUnit: 12, leadTimeDays: 4, rating: 4.4, numReviews: 22, tags: ['school uniform', 'kids', 'shirts'] }),
  base('Fashion & Apparel', 'seller2@shopzone.test', { name: "Men's Denim Jeans — Bale of 40", price: 32000, countInStock: 18, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 40, weightPerUnit: 30, leadTimeDays: 6, rating: 4.0, numReviews: 10, tags: ['jeans', 'denim', 'menswear'] }),
  base('Fashion & Apparel', null, { name: "Women's Office Blouses — Dozen", price: 7200, countInStock: 35, unit: 'Dozen', unitType: 'Dozen', itemsPerUnit: 12, leadTimeDays: 4, rating: 4.2, numReviews: 8, tags: ['blouses', 'office wear', 'womenswear'] }),
  base('Fashion & Apparel', 'seller2@shopzone.test', { name: 'Unisex Hooded Sweatshirts — Bale of 25', price: 21000, countInStock: 22, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 25, weightPerUnit: 18, leadTimeDays: 5, rating: 4.1, numReviews: 12, tags: ['hoodies', 'sweatshirts', 'unisex'] }),
  base('Fashion & Apparel', null, { name: "Men's Formal Shirts — Dozen", price: 9600, countInStock: 28, unit: 'Dozen', unitType: 'Dozen', itemsPerUnit: 12, leadTimeDays: 4, rating: 4.3, numReviews: 9, tags: ['formal shirts', 'menswear'] }),
  base('Fashion & Apparel', 'seller2@shopzone.test', { name: "Ladies' Leggings — Bale of 60", price: 16000, salePrice: 13500, isOnSale: true, countInStock: 30, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 60, weightPerUnit: 15, leadTimeDays: 5, rating: 4.0, numReviews: 17, tags: ['leggings', 'womenswear'] }),

  // ── Fabric & Textiles (6) ──────────────────────────────────────
  base('Fabric & Textiles', 'seller2@shopzone.test', { name: 'Kitenge Cotton Fabric Rolls', brand: 'Rivatex', price: 8500, countInStock: 40, unit: 'Per Unit', unitType: 'Roll', dimensions: '50m x 1.2m roll', weightPerUnit: 12, leadTimeDays: 5, rating: 4.4, numReviews: 16, tags: ['kitenge', 'fabric', 'textiles'] }),
  base('Fabric & Textiles', 'seller2@shopzone.test', { name: 'Ankara Wax Print Fabric — Bale of 12', price: 36000, countInStock: 14, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 12, weightPerUnit: 28, leadTimeDays: 6, rating: 4.2, numReviews: 11, tags: ['ankara', 'wax print', 'fabric'] }),
  base('Fabric & Textiles', 'seller2@shopzone.test', { name: 'Denim Fabric Rolls', price: 11000, countInStock: 25, unit: 'Per Unit', unitType: 'Roll', dimensions: '45m x 1.5m roll', weightPerUnit: 15, leadTimeDays: 5, rating: 4.0, numReviews: 7, tags: ['denim', 'fabric'] }),
  base('Fabric & Textiles', null, { name: 'School Uniform Fabric (Khaki) Rolls', price: 7200, countInStock: 30, unit: 'Per Unit', unitType: 'Roll', dimensions: '50m x 1.1m roll', weightPerUnit: 10, leadTimeDays: 4, rating: 4.1, numReviews: 9, tags: ['khaki', 'school uniform', 'fabric'] }),
  base('Fabric & Textiles', 'seller2@shopzone.test', { name: 'Curtain Fabric Rolls — Assorted', price: 9800, countInStock: 20, unit: 'Per Unit', unitType: 'Roll', dimensions: '40m x 2.8m roll', weightPerUnit: 14, leadTimeDays: 6, rating: 4.3, numReviews: 13, tags: ['curtains', 'fabric', 'home'] }),
  base('Fabric & Textiles', null, { name: 'Leso / Kanga Fabric Bundles — Bale of 20', price: 15000, countInStock: 18, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 20, weightPerUnit: 16, leadTimeDays: 5, rating: 4.5, numReviews: 20, tags: ['kanga', 'leso', 'fabric'] }),

  // ── Food & Grocery (12) ─────────────────────────────────────────
  base('Food & Grocery', 'seller3@shopzone.test', { name: 'Brookside UHT Milk 500ml — Carton of 24', brand: 'Brookside', price: 2400, countInStock: 100, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 2, rating: 4.5, numReviews: 34, tags: ['milk', 'brookside', 'dairy'] }),
  base('Food & Grocery', 'seller3@shopzone.test', { name: 'Bidco Fresh Fry Cooking Oil 5L — Carton of 4', brand: 'Bidco', price: 6800, countInStock: 60, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 4, weightPerUnit: 20, leadTimeDays: 3, rating: 4.3, numReviews: 28, tags: ['cooking oil', 'bidco', 'grocery'] }),
  base('Food & Grocery', null, { name: 'Unga Exe Maize Flour 2kg — Sack of 25', brand: 'Unga', price: 3200, countInStock: 45, unit: 'Sack', unitType: 'Sack', itemsPerUnit: 25, weightPerUnit: 50, leadTimeDays: 2, rating: 4.4, numReviews: 25, tags: ['maize flour', 'unga', 'staple'] }),
  base('Food & Grocery', 'seller3@shopzone.test', { name: 'Ketepa Tea Leaves 500g — Carton of 24', brand: 'Ketepa', price: 5400, countInStock: 55, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 2, rating: 4.6, numReviews: 30, tags: ['tea', 'ketepa', 'grocery'] }),
  base('Food & Grocery', null, { name: 'Dormans Instant Coffee 200g — Carton of 12', brand: 'Dormans', price: 7200, countInStock: 40, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 12, leadTimeDays: 3, rating: 4.3, numReviews: 16, tags: ['coffee', 'dormans', 'grocery'] }),
  base('Food & Grocery', 'seller3@shopzone.test', { name: 'Mumias Sugar 50kg Sacks', brand: 'Mumias', price: 6500, countInStock: 35, unit: 'Sack', unitType: 'Sack', weightPerUnit: 50, isBulkOnly: true, leadTimeDays: 3, rating: 4.2, numReviews: 21, tags: ['sugar', 'mumias', 'bulk'] }),
  base('Food & Grocery', null, { name: 'Capwell Pishori Rice 25kg Sacks', brand: 'Capwell', price: 5800, countInStock: 30, unit: 'Sack', unitType: 'Sack', weightPerUnit: 25, leadTimeDays: 4, rating: 4.5, numReviews: 19, tags: ['rice', 'pishori', 'capwell'] }),
  base('Food & Grocery', 'seller3@shopzone.test', { name: 'Trufoods Tomato Sauce 400g — Carton of 24', brand: 'Trufoods', price: 3100, countInStock: 50, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 2, rating: 4.1, numReviews: 14, tags: ['tomato sauce', 'trufoods', 'grocery'] }),
  base('Food & Grocery', 'seller3@shopzone.test', { name: 'Kenblest Wheat Flour 2kg — Sack of 25', brand: 'Kenblest', price: 2900, countInStock: 42, unit: 'Sack', unitType: 'Sack', itemsPerUnit: 25, weightPerUnit: 50, leadTimeDays: 2, rating: 4.2, numReviews: 17, tags: ['wheat flour', 'kenblest', 'baking'] }),
  base('Food & Grocery', null, { name: 'Royco Mchuzi Mix 100g — Carton of 48', brand: 'Royco', price: 2200, countInStock: 65, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 48, leadTimeDays: 2, rating: 4.4, numReviews: 23, tags: ['mchuzi mix', 'royco', 'seasoning'] }),
  base('Food & Grocery', 'seller3@shopzone.test', { name: 'Bidco Golden Fry Margarine 250g — Carton of 24', brand: 'Bidco', price: 2600, countInStock: 48, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 2, rating: 4.0, numReviews: 12, tags: ['margarine', 'bidco', 'grocery'] }),
  base('Food & Grocery', null, { name: 'Assorted Dried Beans (Githeri Mix) 50kg Sack', price: 5200, salePrice: 4600, isOnSale: true, countInStock: 20, unit: 'Sack', unitType: 'Sack', weightPerUnit: 50, isBulkOnly: true, leadTimeDays: 4, rating: 4.3, numReviews: 15, tags: ['beans', 'githeri', 'bulk'] }),

  // ── Home & Kitchen (8) ───────────────────────────────────────────
  base('Home & Kitchen', 'seller4@shopzone.test', { name: 'Non-Stick Cooking Pot Sets — Box of 10', price: 32000, countInStock: 20, unit: 'Box', unitType: 'Box', itemsPerUnit: 10, leadTimeDays: 5, rating: 4.3, numReviews: 11, tags: ['cookware', 'kitchen'] }),
  base('Home & Kitchen', null, { name: 'Plastic Household Buckets 20L — Carton of 20', price: 9000, countInStock: 40, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 20, leadTimeDays: 3, rating: 4.0, numReviews: 9, tags: ['buckets', 'household'] }),
  base('Home & Kitchen', 'seller4@shopzone.test', { name: 'Stainless Steel Cutlery Sets — Box of 50', price: 27000, countInStock: 25, unit: 'Box', unitType: 'Box', itemsPerUnit: 50, leadTimeDays: 5, rating: 4.4, numReviews: 18, tags: ['cutlery', 'kitchen'] }),
  base('Home & Kitchen', 'seller4@shopzone.test', { name: 'Hotpoint Electric Kettles — Carton of 12', brand: 'Hotpoint', price: 21000, countInStock: 22, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 12, leadTimeDays: 4, rating: 4.2, numReviews: 14, tags: ['kettle', 'hotpoint', 'appliances'] }),
  base('Home & Kitchen', null, { name: 'Bedsheet Sets — Assorted — Dozen', price: 8400, countInStock: 30, unit: 'Dozen', unitType: 'Dozen', itemsPerUnit: 12, leadTimeDays: 4, rating: 4.1, numReviews: 10, tags: ['bedsheets', 'home'] }),
  base('Home & Kitchen', 'seller4@shopzone.test', { name: 'Plastic Storage Containers — Carton of 30', price: 10500, countInStock: 35, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 30, leadTimeDays: 3, rating: 3.9, numReviews: 8, tags: ['storage', 'containers'] }),
  base('Home & Kitchen', null, { name: 'Aluminium Sufurias — Assorted Sizes — Box of 15', price: 18000, countInStock: 18, unit: 'Box', unitType: 'Box', itemsPerUnit: 15, leadTimeDays: 5, rating: 4.5, numReviews: 20, tags: ['sufuria', 'cookware'] }),
  base('Home & Kitchen', 'seller4@shopzone.test', { name: 'Thermos Flasks 1L — Carton of 24', price: 13200, countInStock: 28, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 3, rating: 4.0, numReviews: 13, tags: ['thermos', 'flask'] }),

  // ── General Merchandise (6) ─────────────────────────────────────
  base('General Merchandise', 'seller4@shopzone.test', { name: 'Assorted Plastic Hangers — Carton of 200', price: 6000, countInStock: 50, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 200, leadTimeDays: 3, rating: 3.9, numReviews: 7, tags: ['hangers', 'household'] }),
  base('General Merchandise', null, { name: 'Umbrellas — Assorted Colors — Carton of 50', price: 11000, countInStock: 30, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 50, leadTimeDays: 4, rating: 4.1, numReviews: 12, tags: ['umbrellas', 'general'] }),
  base('General Merchandise', 'seller4@shopzone.test', { name: 'Travel Bags & Suitcases — Box of 20', price: 28000, countInStock: 15, unit: 'Box', unitType: 'Box', itemsPerUnit: 20, leadTimeDays: 6, rating: 4.3, numReviews: 9, tags: ['travel bags', 'suitcases'] }),
  base('General Merchandise', null, { name: 'Reusable Shopping Bags — Bale of 100', price: 7500, countInStock: 40, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 100, leadTimeDays: 3, rating: 4.0, numReviews: 11, tags: ['shopping bags', 'reusable'] }),
  base('General Merchandise', 'seller4@shopzone.test', { name: 'Rechargeable Torches / Flashlights — Carton of 40', price: 14000, countInStock: 25, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 40, leadTimeDays: 4, rating: 4.2, numReviews: 15, tags: ['torches', 'flashlights'] }),
  base('General Merchandise', null, { name: 'Assorted Padlocks & Keys — Box of 100', price: 9500, countInStock: 35, unit: 'Box', unitType: 'Box', itemsPerUnit: 100, leadTimeDays: 3, rating: 4.1, numReviews: 10, tags: ['padlocks', 'security'] }),

  // ── Beauty & Personal Care (8) ──────────────────────────────────
  base('Beauty & Personal Care', 'seller5@shopzone.test', { name: 'Nivea Body Lotion 400ml — Carton of 24', brand: 'Nivea', price: 9600, countInStock: 40, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 3, rating: 4.5, numReviews: 26, tags: ['lotion', 'nivea', 'beauty'] }),
  base('Beauty & Personal Care', 'seller5@shopzone.test', { name: 'Petroleum Jelly 250g — Carton of 48', brand: 'Nice & Lovely', price: 6000, countInStock: 55, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 48, leadTimeDays: 2, rating: 4.3, numReviews: 19, tags: ['petroleum jelly', 'skincare'] }),
  base('Beauty & Personal Care', null, { name: 'Colgate Toothpaste 150g — Carton of 72', brand: 'Colgate', price: 10800, countInStock: 60, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 72, leadTimeDays: 2, rating: 4.6, numReviews: 33, tags: ['toothpaste', 'colgate', 'oral care'] }),
  base('Beauty & Personal Care', 'seller5@shopzone.test', { name: 'Assorted Hair Extensions — Box of 50', price: 22000, countInStock: 20, unit: 'Box', unitType: 'Box', itemsPerUnit: 50, leadTimeDays: 5, rating: 4.0, numReviews: 14, tags: ['hair extensions', 'beauty'] }),
  base('Beauty & Personal Care', null, { name: 'Dettol Antiseptic Soap — Carton of 72', brand: 'Dettol', price: 8400, countInStock: 50, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 72, leadTimeDays: 2, rating: 4.4, numReviews: 21, tags: ['soap', 'dettol', 'hygiene'] }),
  base('Beauty & Personal Care', 'seller5@shopzone.test', { name: 'Always Sanitary Pads — Carton of 48', brand: 'Always', price: 7200, countInStock: 45, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 48, leadTimeDays: 2, rating: 4.5, numReviews: 24, tags: ['sanitary pads', 'always', 'hygiene'] }),
  base('Beauty & Personal Care', 'seller5@shopzone.test', { name: 'Shower Gel 500ml — Carton of 24', price: 6600, salePrice: 5400, isClearance: true, countInStock: 30, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 3, rating: 3.9, numReviews: 10, tags: ['shower gel', 'generic'] }),
  base('Beauty & Personal Care', null, { name: 'Assorted Makeup Kits — Box of 30', price: 24000, countInStock: 18, unit: 'Box', unitType: 'Box', itemsPerUnit: 30, leadTimeDays: 5, rating: 4.1, numReviews: 12, tags: ['makeup', 'beauty'] }),

  // ── Health & Wellness (6) ────────────────────────────────────────
  base('Health & Wellness', 'seller5@shopzone.test', { name: 'Digital Thermometers — Box of 50', price: 15000, countInStock: 30, unit: 'Box', unitType: 'Box', itemsPerUnit: 50, leadTimeDays: 4, rating: 4.3, numReviews: 16, tags: ['thermometer', 'health'] }),
  base('Health & Wellness', null, { name: 'Blood Pressure Monitors — Box of 20', price: 32000, countInStock: 15, unit: 'Box', unitType: 'Box', itemsPerUnit: 20, leadTimeDays: 6, rating: 4.4, numReviews: 11, tags: ['blood pressure', 'health'] }),
  base('Health & Wellness', 'seller5@shopzone.test', { name: 'Assorted Multivitamins — Carton of 100 bottles', price: 28000, countInStock: 25, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 100, leadTimeDays: 5, rating: 4.2, numReviews: 20, tags: ['multivitamins', 'wellness'] }),
  base('Health & Wellness', null, { name: 'First Aid Kits — Box of 25', price: 18000, countInStock: 20, unit: 'Box', unitType: 'Box', itemsPerUnit: 25, leadTimeDays: 4, rating: 4.5, numReviews: 14, tags: ['first aid', 'health'] }),
  base('Health & Wellness', 'seller5@shopzone.test', { name: 'Disposable Face Masks — Carton of 500', price: 9000, countInStock: 60, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 500, leadTimeDays: 3, rating: 4.0, numReviews: 22, tags: ['face masks', 'health'] }),
  base('Health & Wellness', null, { name: 'Hand Sanitizer 500ml — Carton of 24', price: 6000, countInStock: 45, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 2, rating: 4.1, numReviews: 17, tags: ['sanitizer', 'hygiene'] }),

  // ── Hardware & Tools (8) ────────────────────────────────────────
  base('Hardware & Tools', 'seller6@shopzone.test', { name: 'Crown Paints Emulsion 20L Drums', brand: 'Crown Paints', price: 7200, countInStock: 30, unit: 'Per Unit', unitType: 'Litre', weightPerUnit: 20, leadTimeDays: 4, rating: 4.4, numReviews: 18, tags: ['paint', 'crown paints', 'hardware'] }),
  base('Hardware & Tools', 'seller6@shopzone.test', { name: 'Assorted Hand Tool Sets — Box of 20', price: 42000, countInStock: 15, unit: 'Box', unitType: 'Box', itemsPerUnit: 20, leadTimeDays: 5, rating: 4.2, numReviews: 9, tags: ['hand tools', 'hardware'] }),
  base('Hardware & Tools', null, { name: 'Steel Nails — Assorted Sizes — 25kg Sack', price: 4800, countInStock: 35, unit: 'Sack', unitType: 'Sack', weightPerUnit: 25, leadTimeDays: 3, rating: 4.0, numReviews: 7, tags: ['nails', 'steel', 'hardware'] }),
  base('Hardware & Tools', 'seller6@shopzone.test', { name: 'PVC Pipes 4-inch', price: 850, countInStock: 200, unit: 'Per Unit', unitType: 'Piece', minimumOrderQuantity: 50, leadTimeDays: 4, rating: 4.1, numReviews: 13, tags: ['pvc pipes', 'plumbing', 'hardware'] }),
  base('Hardware & Tools', 'seller6@shopzone.test', { name: 'Heavy Duty Padlocks — Box of 100', price: 16000, countInStock: 25, unit: 'Box', unitType: 'Box', itemsPerUnit: 100, leadTimeDays: 3, rating: 4.3, numReviews: 15, tags: ['padlocks', 'security', 'hardware'] }),
  base('Hardware & Tools', null, { name: 'Wheelbarrows — Pallet of 10', price: 38000, countInStock: 10, unit: 'Per Unit', unitType: 'Pallet', itemsPerUnit: 10, weightPerUnit: 18, isBulkOnly: true, leadTimeDays: 8, rating: 4.2, numReviews: 6, tags: ['wheelbarrow', 'construction'] }),
  base('Hardware & Tools', 'seller6@shopzone.test', { name: 'Electrical Cables 100m Rolls', price: 9500, countInStock: 28, unit: 'Per Unit', unitType: 'Roll', dimensions: '100m roll', weightPerUnit: 12, leadTimeDays: 4, rating: 4.0, numReviews: 10, tags: ['electrical cable', 'hardware'] }),
  base('Hardware & Tools', null, { name: 'Ceramic Floor Tiles — Pallet (40m²)', price: 65000, countInStock: 8, unit: 'Per Unit', unitType: 'Pallet', dimensions: '40m² per pallet', isBulkOnly: true, leadTimeDays: 10, rating: 4.4, numReviews: 8, tags: ['tiles', 'flooring', 'construction'] }),

  // ── Agriculture & Garden (6) ────────────────────────────────────
  base('Agriculture & Garden', 'seller6@shopzone.test', { name: 'Assorted Vegetable Seed Packets — Box of 200', price: 14000, countInStock: 30, unit: 'Box', unitType: 'Box', itemsPerUnit: 200, leadTimeDays: 5, rating: 4.3, numReviews: 12, tags: ['seeds', 'agriculture'] }),
  base('Agriculture & Garden', null, { name: 'Garden Hose Pipes 50m Rolls', price: 6200, countInStock: 25, unit: 'Per Unit', unitType: 'Roll', dimensions: '50m roll', leadTimeDays: 3, rating: 4.0, numReviews: 9, tags: ['hose', 'garden'] }),
  base('Agriculture & Garden', 'seller6@shopzone.test', { name: 'Garden Tools Set — Box of 15', price: 19500, countInStock: 20, unit: 'Box', unitType: 'Box', itemsPerUnit: 15, leadTimeDays: 4, rating: 4.1, numReviews: 11, tags: ['garden tools'] }),
  base('Agriculture & Garden', null, { name: 'NPK Fertilizer 50kg Sacks', price: 5600, countInStock: 40, unit: 'Sack', unitType: 'Sack', weightPerUnit: 50, isBulkOnly: true, leadTimeDays: 4, rating: 4.4, numReviews: 17, tags: ['fertilizer', 'npk', 'agriculture'] }),
  base('Agriculture & Garden', 'seller6@shopzone.test', { name: 'Greenhouse Polythene Rolls', price: 18000, countInStock: 12, unit: 'Per Unit', unitType: 'Roll', dimensions: '100m x 6m roll', weightPerUnit: 22, leadTimeDays: 6, rating: 4.2, numReviews: 7, tags: ['greenhouse', 'polythene'] }),
  base('Agriculture & Garden', null, { name: 'Poultry Feed (Layers Mash) 50kg Sacks', price: 3400, countInStock: 50, unit: 'Sack', unitType: 'Sack', weightPerUnit: 50, leadTimeDays: 3, rating: 4.3, numReviews: 14, tags: ['poultry feed', 'layers mash'] }),

  // ── Baby & Kids (7) ───────────────────────────────────────────
  base('Baby & Kids', 'seller7@shopzone.test', { name: 'Huggies Diapers Size 3 — Carton of 48 packs', brand: 'Huggies', price: 28000, countInStock: 35, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 48, leadTimeDays: 3, rating: 4.6, numReviews: 29, tags: ['diapers', 'huggies', 'baby'] }),
  base('Baby & Kids', null, { name: 'Baby Feeding Bottles — Box of 50', price: 16000, countInStock: 25, unit: 'Box', unitType: 'Box', itemsPerUnit: 50, leadTimeDays: 4, rating: 4.2, numReviews: 13, tags: ['feeding bottles', 'baby'] }),
  base('Baby & Kids', 'seller7@shopzone.test', { name: 'Assorted Baby Clothes 0-12 Months — Bale of 40', price: 19000, countInStock: 18, unit: 'Bale', unitType: 'Bale', itemsPerUnit: 40, weightPerUnit: 15, leadTimeDays: 5, rating: 4.3, numReviews: 16, tags: ['baby clothes', 'infants'] }),
  base('Baby & Kids', null, { name: 'Baby Wipes — Carton of 48', price: 9600, countInStock: 50, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 48, leadTimeDays: 2, rating: 4.4, numReviews: 20, tags: ['baby wipes', 'hygiene'] }),
  base('Baby & Kids', 'seller7@shopzone.test', { name: "Kids' School Bags — Box of 30", price: 21000, countInStock: 22, unit: 'Box', unitType: 'Box', itemsPerUnit: 30, leadTimeDays: 5, rating: 4.1, numReviews: 10, tags: ['school bags', 'kids'] }),
  base('Baby & Kids', null, { name: 'Baby Formula Milk 400g — Carton of 24', price: 24000, countInStock: 30, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 24, leadTimeDays: 3, rating: 4.5, numReviews: 18, tags: ['baby formula', 'infant nutrition'] }),
  base('Baby & Kids', 'seller7@shopzone.test', { name: 'Assorted Kids Toys — Box of 50', price: 17500, salePrice: 15000, isOnSale: true, countInStock: 28, unit: 'Box', unitType: 'Box', itemsPerUnit: 50, leadTimeDays: 5, rating: 4.0, numReviews: 15, tags: ['toys', 'kids'] }),

  // ── Office & Stationery (7) ────────────────────────────────────
  base('Office & Stationery', 'seller7@shopzone.test', { name: 'A4 Printing Paper — Box of 10 Reams', price: 8500, countInStock: 40, unit: 'Box', unitType: 'Box', itemsPerUnit: 10, leadTimeDays: 3, rating: 4.3, numReviews: 21, tags: ['a4 paper', 'office'] }),
  base('Office & Stationery', null, { name: 'Assorted Ballpoint Pens — Box of 500', price: 6000, countInStock: 55, unit: 'Box', unitType: 'Box', itemsPerUnit: 500, leadTimeDays: 2, rating: 4.1, numReviews: 17, tags: ['pens', 'stationery'] }),
  base('Office & Stationery', 'seller7@shopzone.test', { name: 'Exercise Books 200pg — Carton of 100', price: 9000, countInStock: 45, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 100, leadTimeDays: 3, rating: 4.4, numReviews: 24, tags: ['exercise books', 'school', 'stationery'] }),
  base('Office & Stationery', null, { name: 'Office Desk Organizers — Box of 30', price: 13500, countInStock: 20, unit: 'Box', unitType: 'Box', itemsPerUnit: 30, leadTimeDays: 4, rating: 4.0, numReviews: 9, tags: ['desk organizers', 'office'] }),
  base('Office & Stationery', 'seller7@shopzone.test', { name: 'Printer Toner Cartridges — Box of 12', price: 36000, countInStock: 15, unit: 'Box', unitType: 'Box', itemsPerUnit: 12, leadTimeDays: 5, rating: 4.2, numReviews: 11, tags: ['toner', 'printing', 'office'] }),
  base('Office & Stationery', null, { name: 'Stapler & Staples Sets — Box of 50', price: 11000, countInStock: 25, unit: 'Box', unitType: 'Box', itemsPerUnit: 50, leadTimeDays: 3, rating: 4.1, numReviews: 8, tags: ['staplers', 'office'] }),
  base('Office & Stationery', 'seller7@shopzone.test', { name: 'Whiteboard Markers — Assorted — Box of 100', price: 7800, countInStock: 35, unit: 'Box', unitType: 'Box', itemsPerUnit: 100, leadTimeDays: 2, rating: 4.3, numReviews: 13, tags: ['whiteboard markers', 'office'] }),

  // ── Sports & Outdoors (6) ────────────────────────────────────────
  base('Sports & Outdoors', 'seller8@shopzone.test', { name: 'Footballs Size 5 — Box of 20', price: 18000, countInStock: 25, unit: 'Box', unitType: 'Box', itemsPerUnit: 20, leadTimeDays: 4, rating: 4.4, numReviews: 19, tags: ['football', 'sports'] }),
  base('Sports & Outdoors', null, { name: 'Camping Tents (4-Person) — Box of 10', price: 42000, countInStock: 12, unit: 'Box', unitType: 'Box', itemsPerUnit: 10, leadTimeDays: 6, rating: 4.2, numReviews: 7, tags: ['camping', 'tents', 'outdoors'] }),
  base('Sports & Outdoors', 'seller8@shopzone.test', { name: 'Yoga Mats — Carton of 30', price: 16500, countInStock: 28, unit: 'Carton', unitType: 'Carton', itemsPerUnit: 30, leadTimeDays: 3, rating: 4.0, numReviews: 14, tags: ['yoga mats', 'fitness'] }),
  base('Sports & Outdoors', null, { name: 'Gym Dumbbell Sets — Box of 15', price: 38000, countInStock: 10, unit: 'Box', unitType: 'Box', itemsPerUnit: 15, weightPerUnit: 25, isBulkOnly: true, leadTimeDays: 7, rating: 4.3, numReviews: 9, tags: ['dumbbells', 'gym', 'fitness'] }),
  base('Sports & Outdoors', 'seller8@shopzone.test', { name: 'Bicycles — Assorted — Pallet of 10', price: 95000, countInStock: 10, unit: 'Per Unit', unitType: 'Pallet', itemsPerUnit: 10, weightPerUnit: 15, isBulkOnly: true, leadTimeDays: 12, rating: 4.1, numReviews: 6, tags: ['bicycles', 'outdoors'] }),
  base('Sports & Outdoors', null, { name: 'Sports Jerseys — Assorted Teams — Dozen', price: 14400, countInStock: 22, unit: 'Dozen', unitType: 'Dozen', itemsPerUnit: 12, leadTimeDays: 4, rating: 4.0, numReviews: 11, tags: ['jerseys', 'sportswear'] }),

];

module.exports = products;