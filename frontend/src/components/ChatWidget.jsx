import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';

const getBotReply = (input) => {
  const msg = input.toLowerCase().trim();

  // ── GREETINGS ───────────────────────────────────────────
  if (msg.match(/^(hi|hello|hey|jambo|habari|niaje|sasa|howdy|good morning|good afternoon|good evening|sup|what's up|hiya)/)) {
    const greetings = [
      "Habari! 👋 Great to have you here at ShopZone. Whether you're restocking your shelves or sourcing for the first time, I'm here to help. What can I do for you today?",
      "Hello there! 😊 Welcome to ShopZone Wholesale. I can help you with orders, products, delivery, payments and more. What's on your mind?",
      "Hey! Glad you reached out. ShopZone is your go-to for wholesale goods across Kenya. How can I assist you today?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // ── HOW ARE YOU / SMALL TALK ────────────────────────────
  if (msg.match(/(how are you|how are things|you good|uko sawa|uko vipi)/)) {
    return "I'm doing great, thank you for asking! 😄 Always ready to help ShopZone customers get the best wholesale deals. Now, what can I help you with today?";
  }

  // ── THANK YOU ───────────────────────────────────────────
  if (msg.match(/(thank|thanks|asante|sawa|appreciate|helpful)/)) {
    return "You're very welcome! 😊 That's what I'm here for. Is there anything else I can help you with? We want your ShopZone experience to be as smooth as possible.";
  }

  // ── GOODBYE ─────────────────────────────────────────────
  if (msg.match(/(bye|goodbye|later|see you|kwaheri|ciao|take care)/)) {
    return "Goodbye! 👋 Thank you for visiting ShopZone. Feel free to come back anytime you need assistance. Happy shopping and good business! 🛍️";
  }

  // ── SPECIFIC KENYA LOCATIONS ────────────────────────────
 const locations = {
  // ── NAIROBI REGION ──────────────────────────────────────
  nairobi: "Nairobi is our home base! 🏙️ We deliver same-day or next-day within Nairobi depending on your location. CBD, Westlands, Eastlands, Karen — we cover it all. Shipping starts at KSh 300 for up to 5kg.",

  // ── CENTRAL REGION ──────────────────────────────────────
  kiambu: "Kiambu is right on our doorstep! 🌿 Fast delivery, usually within a day. We serve many retailers and small businesses across the county. Shipping from KSh 300.",
  muranga: "Yes, we deliver to Murang'a! 📦 Typically 1 business day from Nairobi. Great farming county with a growing business community — welcome to ShopZone! 🌿",
  nyeri: "Nyeri is well served! ☕ We ship there within 1-2 business days. Mt. Kenya region businesses love our wholesale prices. Shipping from KSh 300.",
  kirinyaga: "Kirinyaga is covered! 🌾 Deliveries typically take 1-2 business days. Rice farming country — we also stock food and agricultural supplies in bulk.",
  nyandarua: "Yes, we deliver to Nyandarua! 🥔 Typically 1-2 business days. Great potato and vegetable farming county — bulk food supplies available on ShopZone.",

  // ── COAST REGION ─────────────────────────────────────────
  mombasa: "Yes, we deliver to Mombasa! 🌊 Delivery typically takes 1-2 business days via our trusted courier partners. Coastal businesses are very welcome at ShopZone.",
  kilifi: "Kilifi is covered! 🌴 Deliveries take 1-2 business days via our coastal routes. From Malindi to Kilifi town we've got you covered.",
  kwale: "Yes, we deliver to Kwale! 🏖️ Typically 1-2 business days via our coastal network. Diani, Ukunda and surrounding areas all covered.",
  taita: "Taita Taveta is covered! 🦁 Deliveries typically take 2 business days. Whether you're in Voi, Wundanyi or Taveta town we can reach you.",
  'taita taveta': "Taita Taveta is covered! 🦁 Deliveries typically take 2 business days. Whether you're in Voi, Wundanyi or Taveta town we can reach you.",
  lamu: "We can arrange delivery to Lamu! 🚢 Please contact support at support@shopzone.com for specific logistics since it requires boat transport to the island. Mainland Lamu is straightforward.",
  tanariver: "Tana River county is covered! 🌊 Deliveries may take 2-3 business days depending on your specific location. Contact support for exact arrangements.",
  'tana river': "Tana River county is covered! 🌊 Deliveries may take 2-3 business days depending on your specific location. Contact support for exact arrangements.",

  // ── EASTERN REGION ───────────────────────────────────────
  machakos: "Yes, we deliver to Machakos! 📦 Typically 1-2 business days. Ukambani region businesses are very welcome. Machakos town, Athi River, Kangundo all covered.",
  makueni: "Makueni is covered! 🥭 Deliveries take 1-2 business days. Wote, Kibwezi, Sultan Hamud — all reachable via our courier network.",
  kitui: "Yes, Kitui is on our delivery map! 🌵 Typically 2 business days. Growing business hub in the eastern region — we serve retailers and shops there.",
  embu: "Embu is well covered! ☕ Deliveries take 1-2 business days. Mt. Kenya eastern slopes businesses are very welcome at ShopZone.",
  tharaka: "Tharaka Nithi is covered! 🌄 Deliveries typically take 2 business days. Chuka and Marimanti areas reachable via our courier partners.",
  'tharaka nithi': "Tharaka Nithi is covered! 🌄 Deliveries typically take 2 business days. Chuka and Marimanti areas reachable via our courier partners.",
  meru: "Yes, Meru is covered! 🌱 Deliveries typically take 2 business days. Great farming and business community up there — miraa, tea and much more.",
  isiolo: "Isiolo is covered! 🐪 Deliveries take 2-3 business days. Gateway to northern Kenya — we serve businesses there regularly.",
  marsabit: "We deliver to Marsabit! 🏔️ Deliveries may take 3-4 business days given the distance. Contact support@shopzone.com for specific arrangements for your area.",
  garissa: "We do ship to Garissa! 🐪 Delivery may take 2-3 business days depending on transport availability. Contact support for specific arrangements.",

  // ── NORTH EASTERN REGION ────────────────────────────────
  wajir: "Yes, we deliver to Wajir! 🌵 Deliveries take 3-4 business days. We work with reliable transporters on the northern routes. Contact support for arrangements.",
  mandera: "We deliver to Mandera! 🌵 Deliveries may take 3-5 business days given the distance. Please contact support@shopzone.com to plan your delivery properly.",

  // ── RIFT VALLEY REGION ───────────────────────────────────
  nakuru: "Nakuru? Absolutely! 🌾 We deliver there within 1-2 business days. It's a growing business hub and we're proud to serve retailers there.",
  eldoret: "Eldoret is fully covered! 🏃 Deliveries typically take 1-2 business days. We work with reliable bus and courier services to reach you safely.",
  uasin: "Uasin Gishu is covered! 🌽 Eldoret and surrounding areas receive deliveries within 1-2 business days. Bread basket of Kenya — we love serving businesses here.",
  'uasin gishu': "Uasin Gishu is covered! 🌽 Eldoret and surrounding areas receive deliveries within 1-2 business days. Bread basket of Kenya — we love serving businesses here.",
  nandi: "Nandi county is covered! 🍵 Deliveries take 1-2 business days. Tea country businesses are very welcome at ShopZone.",
  kericho: "Kericho is well served! 🍃 Deliveries typically take 1-2 business days. Prime tea growing region — we serve many businesses there.",
  bomet: "Yes, Bomet is covered! 🌿 Deliveries take 1-2 business days. South Rift businesses welcome — Bomet town and Sotik area all reachable.",
  narok: "Narok is covered! 🦁 Deliveries typically take 1-2 business days. Maasai Mara region — we serve businesses from Narok town to the surrounding areas.",
  kajiado: "Kajiado is covered! 🌅 Deliveries take 1-2 business days. Ngong, Kitengela, Kajiado town and Namanga all reachable. Growing business county!",
  transnzoia: "Trans Nzoia is covered! 🌽 Kitale and surrounding areas receive deliveries within 1-2 business days. Great agricultural county.",
  'trans nzoia': "Trans Nzoia is covered! 🌽 Kitale and surrounding areas receive deliveries within 1-2 business days. Great agricultural county.",
  westpokot: "West Pokot is covered! 🏔️ Kapenguria and surrounding areas receive deliveries within 2-3 business days via our northern rift routes.",
  'west pokot': "West Pokot is covered! 🏔️ Kapenguria and surrounding areas receive deliveries within 2-3 business days via our northern rift routes.",
  samburu: "We deliver to Samburu! 🦒 Deliveries take 2-3 business days. Maralal and surrounding areas reachable via our courier network. Contact support for arrangements.",
  turkana: "We deliver to Turkana! 🌅 Deliveries may take 3-5 business days to Lodwar and surrounding areas. Please contact support@shopzone.com to plan your delivery.",
  baringo: "Baringo is covered! 🦛 Deliveries take 1-2 business days. Kabarnet, Eldama Ravine and surrounding areas all reachable.",
  laikipia: "Laikipia is covered! 🐘 Deliveries take 1-2 business days. Nanyuki, Nyahururu and surrounding areas well served by our courier network.",

  // ── WESTERN REGION ───────────────────────────────────────
  kakamega: "Kakamega is covered! 🌳 Western Kenya businesses are important to us. Deliveries take 1-2 business days.",
  bungoma: "Bungoma is covered! 🌽 Deliveries take 1-2 business days via our western Kenya courier routes. Mount Elgon region well served.",
  busia: "Yes, Busia is covered! 🌊 Border town businesses very welcome! Deliveries take 1-2 business days. Great cross-border trading hub.",
  vihiga: "Vihiga is covered! 🌿 Deliveries take 1-2 business days. Mbale and surrounding areas all reachable via our western Kenya network.",

  // ── NYANZA REGION ────────────────────────────────────────
  kisumu: "Kisumu is well covered! 🐟 We ship to Kisumu within 1-2 business days. A lot of our wholesale clients around Lake Victoria rely on us for restocking.",
  siaya: "Siaya is covered! 🌊 Deliveries take 1-2 business days. Bondo, Ugunja and surrounding areas all served by our Lake Victoria region network.",
  homabay: "Homa Bay is covered! 🐟 Deliveries take 1-2 business days via our lake region routes. Homa Bay town, Mbita and surrounding areas reachable.",
  'homa bay': "Homa Bay is covered! 🐟 Deliveries take 1-2 business days via our lake region routes. Homa Bay town, Mbita and surrounding areas reachable.",
  migori: "Migori is covered! 🌅 Deliveries take 1-2 business days. Isebania, Migori town and surrounding areas all served. Border businesses welcome!",
  kisii: "Yes, Kisii is on our delivery map! 🍊 Typically 1-2 business days. Vibrant business community there.",
  nyamira: "Nyamira is covered! 🍊 Deliveries take 1-2 business days. Keroka, Nyamira town and surrounding areas all reachable.",

  // ── COMMON SHORTHANDS ────────────────────────────────────
  thika: "Thika is very close to us — deliveries can be as fast as same-day or next morning! 🏭 Great industrial hub with lots of our wholesale clients.",
  malindi: "Malindi is served! 🏖️ Deliveries typically take 2 business days via our coastal routes.",
  kitale: "Kitale is covered! 🌽 Trans Nzoia county deliveries take 1-2 business days. Agricultural heartland businesses very welcome!",
  nanyuki: "Nanyuki is covered! 🏔️ Laikipia county deliveries take 1-2 business days. Mt. Kenya region businesses well served.",
  nyahururu: "Nyahururu is covered! 💧 Thomson's Falls area deliveries take 1-2 business days via our central rift routes.",
  voi: "Voi is covered! 🦁 Taita Taveta county deliveries take 2 business days. Gateway to Tsavo — we serve businesses along the Mombasa highway.",
  athi: "Athi River is covered! 🏭 Industrial area just outside Nairobi — deliveries typically same-day or next morning. Major business hub!",
  'athi river': "Athi River is covered! 🏭 Industrial area just outside Nairobi — deliveries typically same-day or next morning. Major business hub!",
  limuru: "Limuru is covered! 🌿 Just outside Nairobi — deliveries typically same-day or next morning. Tea region businesses welcome!",
  ruiru: "Ruiru is covered! 🏘️ Just outside Nairobi — deliveries typically same-day or next morning.",
  juja: "Juja is covered! 🎓 Close to Nairobi — deliveries typically same-day or next morning.",
  ngong: "Ngong is covered! 🌅 Same-day or next morning delivery from Nairobi. Kajiado county businesses welcome!",
  kitengela: "Kitengela is covered! 🌅 Fast growing town — deliveries typically same-day or next morning from Nairobi.",
  kangundo: "Kangundo is covered! 🌾 Machakos county — deliveries take 1-2 business days.",
  wote: "Wote is covered! 🌾 Makueni county capital — deliveries take 1-2 business days.",
  chuka: "Chuka is covered! ☕ Tharaka Nithi county — deliveries take 1-2 business days via our Mt. Kenya eastern routes.",
  kapenguria: "Kapenguria is covered! 🏔️ West Pokot county — deliveries take 2-3 business days.",
  lodwar: "We deliver to Lodwar! 🌅 Turkana county capital — deliveries take 3-5 business days. Contact support for specific arrangements.",
  maralal: "We deliver to Maralal! 🦒 Samburu county — deliveries take 2-3 business days. Contact support for arrangements.",
  kabarnet: "Kabarnet is covered! 🦛 Baringo county capital — deliveries take 1-2 business days.",
  hola: "We deliver to Hola! 🌊 Tana River county capital — deliveries take 2-3 business days. Contact support for specific arrangements.",
  garsen: "We deliver to Garsen! 🌊 Tana River county — deliveries take 2-3 business days. Contact support for arrangements.",
  wajir2: "Yes, we deliver to Wajir! 🌵 Deliveries take 3-4 business days via our northern routes.",
  mandera2: "We deliver to Mandera! 🌵 Our northernmost delivery point — takes 3-5 business days. Contact support to plan properly.",
  marsabit2: "We deliver to Marsabit! 🏔️ Northern Kenya — deliveries take 3-4 business days. Contact support@shopzone.com for arrangements.",
};

  const foundLocation = Object.keys(locations).find(loc => msg.includes(loc));
  if (foundLocation) return locations[foundLocation];

  // ── GENERAL DELIVERY / SHIPPING ─────────────────────────
 if (msg.match(/(shipping rate|delivery cost|delivery fee|delivery charge|how much.*deliver|how much.*ship|cost.*deliver|cost.*ship|delivery price|shipping price|rate.*deliver|rate.*ship)/)) {
  return "Here are our standard shipping rates across Kenya! 🚚\n\n📦 Standard Rates:\n• Up to 5kg — KSh 300\n• Every additional 1kg — KSh 100\n\nSo for example:\n• 5kg order → KSh 300\n• 8kg order → KSh 300 + KSh 300 = KSh 600\n• 15kg order → KSh 300 + KSh 1,000 = KSh 1,300\n\n🏙️ Nairobi & environs may qualify for reduced rates on large orders. For very heavy bulk orders, email support@shopzone.com for a custom shipping quote!\n\nShipping is calculated at checkout based on your order weight and location. 😊";
}

if (msg.match(/(deliver|shipping|ship|courier|transport|how long|how do i get|arrival|when will|dispatch|logistics|where do you deliver)/)) {
  return "We deliver across all 47 counties in Kenya! 🇰🇪\n\nDelivery timelines:\n• Nairobi & environs: Same-day or next-day\n• Major towns (Mombasa, Kisumu, Nakuru, Eldoret): 1-2 business days\n• Remote areas: 2-4 business days\n\nShipping rates start at KSh 300 for up to 5kg, plus KSh 100 per additional kg.\n\nWe use G4S, Fargo, and trusted bus services. What town are you in? I can give you a more specific estimate! 😊";
}

  // ── PAYMENT ─────────────────────────────────────────────
  if (msg.match(/(pay|payment|mpesa|m-pesa|paypal|bank|transfer|till|paybill|lipa|invoice|deposit|how much do i pay|accept)/)) {
    return "Great question! We offer flexible payment options to suit all business sizes 💳\n\n• M-Pesa Xpress — instant and secure\n• PayPal — for international transactions\n• Bank Transfer — for large wholesale orders\n\nFor big orders we always issue a formal pro-forma invoice first so you know exactly what you're paying for before sending a single shilling. No surprises! Is there a specific payment method you'd like to know more about?";
  }

  // ── PRICING / HOW MUCH ──────────────────────────────────
  if (msg.match(/(price|cost|how much|bei|cheap|expensive|afford|budget|rate|quote|pricing|minimum order|moq)/)) {
    return "Our prices are set to give you the best wholesale value in Kenya! 💰\n\nHere's how our pricing works:\n• Each product shows its price per unit (bale, carton, kg, box etc.)\n• The more you order, the better the value\n• We don't have a fixed minimum order — order what makes sense for your business\n\nFor a specific price quote on large quantities, reach out to us at support@shopzone.com and our team will get back to you within a few hours. What product were you looking to price? 😊";
  }

  // ── BECOMING A SELLER ────────────────────────────────────
  if (msg.match(/(sell|seller|vendor|supplier|list|my product|become|partner|wholesale supplier|supply|distributor|stockist)/)) {
    return "We love hearing from potential sellers! 🏪\n\nBecoming a ShopZone seller is straightforward:\n1. Email us at support@shopzone.com with your business name, what you supply, and your location\n2. Our team reviews your application — usually within 48 hours\n3. Once approved, you get access to your seller dashboard to list products\n\nWe're looking for genuine suppliers with quality goods. Whether you're a manufacturer, importer, or distributor — we want to hear from you! 🤝";
  }

  // ── RETURNS / REFUNDS ───────────────────────────────────
  if (msg.match(/(return|refund|exchange|wrong item|damaged|broken|defective|complaint|not happy|disappointed|spoilt|faulty|bad quality)/)) {
    return "I'm really sorry to hear that! 😔 At ShopZone we take quality seriously.\n\nHere's our returns process:\n• Contact us within 7 days of delivery\n• WhatsApp or call +254 700 000 000 with photos of the issue\n• Our team reviews within 24 hours\n• If valid, we arrange an exchange or refund\n\nWe stand behind every product on our platform. Damaged or wrong items are always our responsibility to fix. Would you like to report an issue right now?";
  }

  // ── ORDER TRACKING ───────────────────────────────────────
  if (msg.match(/(track|tracking|where is my order|order status|status|has it shipped|dispatched|on the way|update)/)) {
    return "To track your order:\n\n1. Log into your ShopZone account\n2. Go to 'My Profile' → 'My Orders'\n3. Click on the specific order to see its status\n\nIf your order shows 'Not Yet Delivered' and it's been longer than expected, please call us directly at +254 700 000 000 or WhatsApp us and we'll investigate immediately! ⚡";
  }

  // ── CANCELLATION ────────────────────────────────────────
  if (msg.match(/(cancel|cancell|stop order|don't want|changed my mind|undo order)/)) {
    return "No problem at all! Orders can be cancelled as long as they haven't been paid for or dispatched yet.\n\nTo cancel:\n1. Go to 'My Profile' → 'My Orders'\n2. Open the order and click 'Cancel Order'\n3. Confirm the cancellation\n\nIf your order has already been dispatched and you need to cancel, please call us urgently at +254 700 000 000 and we'll do our best to help! 🙏";
  }

  // ── ACCOUNT / LOGIN / REGISTER ──────────────────────────
  if (msg.match(/(account|login|sign in|register|password|forgot|reset|create account|sign up|log in|profile)/)) {
    return "Account help is easy! 😊\n\n• To create an account: Click 'Sign In' → 'Register here'\n• To log in: Click 'Sign In' and enter your email and password\n• Forgot password: Currently contact support@shopzone.com and we'll reset it for you\n• To update your profile: Go to the profile icon → My Profile\n\nIs there a specific account issue you're having? I'm here to help! 🔐";
  }

  // ── CART / CHECKOUT ─────────────────────────────────────
  if (msg.match(/(cart|checkout|add to cart|basket|purchase|buy|place order|how to order|ordering)/)) {
    return "Ordering on ShopZone is really simple! 🛒\n\nHere's the step-by-step:\n1. Browse products on the home page or search for what you need\n2. Click a product to see full details\n3. Select your quantity and click 'Add to Cart'\n4. Go to your cart and click 'Proceed to Checkout'\n5. Enter your shipping address\n6. Choose your payment method\n7. Review your order and click 'Place Order'\n\nThat's it! Your order goes straight into our system. Is there a specific step you need help with? 😊";
  }
  else if (msg.match(/(cart|checkout|add to cart|basket|purchase|buy|place order|place an order|how to order|ordering|how do i order|how do i place)/)) {
    return "Ordering on ShopZone is really simple! 🛒\n\nHere's the step-by-step:\n1. Browse products on the home page or search for what you need\n2. Click a product to see full details\n3. Select your quantity and click 'Add to Cart'\n4. Go to your cart and click 'Proceed to Checkout'\n5. Enter your shipping address\n6. Choose your payment method\n7. Review your order and click 'Place Order'\n\nThat's it! Your order goes straight into our system. Is there a specific step you need help with? 😊";
  }
  

  // ── PRODUCT CATEGORIES ──────────────────────────────────
  if (msg.match(/(electronics|phone|laptop|gadget|appliance|computer|tv|television)/)) {
    return "We have a great Electronics category! 📱\n\nYou'll find smartphones, accessories, home appliances, and more — all at wholesale prices. Perfect for electronics retailers, phone repair shops, and tech resellers.\n\nBrowse the Electronics category on the homepage or search for a specific product. Need a bulk quote? Email support@shopzone.com! 💡";
  }

  if (msg.match(/(fashion|clothes|clothing|fabric|bale|garment|textile|wear|shoes|footwear|dress|shirt|trouser)/)) {
    return "Fashion is one of our biggest categories! 👗\n\nWe stock clothing bales, fabrics, footwear, and accessories — perfect for mitumba sellers, boutique owners, and market traders.\n\nOne bale typically contains a mix of assorted items. Browse the Fashion category on our homepage to see what's currently available! 🧵";
  }

  if (msg.match(/(food|beverage|drink|grocery|sugar|flour|rice|maize|unga|oil|juice|water|snack|cereal)/)) {
    return "Our Food & Beverage category has great wholesale deals! 🥤\n\nWe stock dry goods, cooking essentials, drinks, and packaged foods in bulk quantities — ideal for shops, hotels, schools, and events businesses.\n\nNote: food products move fast so check the homepage for current stock. For large food orders email support@shopzone.com for a custom quote! 🍚";
  }

  if (msg.match(/(beauty|cosmetic|skincare|hair|makeup|lotion|soap|cream|perfume|deodorant|hygiene)/)) {
    return "Our Beauty & Personal Care section has fantastic wholesale options! 💄\n\nFrom skincare to hair products to soap — perfect for beauty shops, salons, and supermarkets. All products are sourced from verified suppliers.\n\nBrowse the Beauty category on our homepage! Want to know about a specific brand or product? 💅";
  }

  if (msg.match(/(hardware|tools|building|construction|paint|nail|screw|electrical|plumbing|wire)/)) {
    return "Hardware & Tools — a growing category on ShopZone! 🔧\n\nWe stock construction materials, tools, electrical supplies, and plumbing items in wholesale quantities — ideal for hardware shops, contractors, and building suppliers.\n\nBrowse Hardware on the homepage or reach out to us for bulk pricing on specific items! 🏗️";
  }

  if (msg.match(/(office|stationery|pen|paper|printer|desk|furniture|school|exercise book|notebook)/)) {
    return "Office & Stationery supplies available in bulk! 🗂️\n\nPerfect for schools, offices, printing businesses, and stationery shops. We stock everything from exercise books to printer cartridges.\n\nCheck the Office Supplies category on our homepage. For school or corporate bulk orders, email support@shopzone.com for a special quote! ✏️";
  }

  // ── TRUST / LEGITIMACY ──────────────────────────────────
  if (msg.match(/(report|scammer|fraud|fraudster|fake seller|report a|suspicious|con|conned|cheated|stolen|stole)/)) {
  return "I'm really sorry to hear you've had a bad experience! 😔 Here's how to report a suspicious seller or fraudulent activity on ShopZone:\n\n1. Take screenshots of all conversations and transactions\n2. Note the seller name and product involved\n3. Contact us immediately:\n\n📞 +254 700 000 000 (call or WhatsApp)\n📧 report@shopzone.com\n\nWe take fraud extremely seriously. Every report is investigated within 24 hours and action is taken against verified bad actors. Your safety on our platform is our top priority! 🛡️";
  }
  
  if (msg.match(/(legit|legitimate|scam|trust|safe|real|fake|genuine|verified|registered|sure about|reliable|honest)/)) {
    return "100% legitimate and registered! ✅\n\nShopZone is a registered wholesale business based in Nairobi, Kenya. Here's why you can trust us:\n\n• Every seller on our platform is verified before listing\n• Secure payment methods — M-Pesa, PayPal, Bank Transfer\n• Pro-forma invoices for large orders\n• 7-day return policy on faulty or wrong items\n• Real customer support: +254 700 000 000\n\nWe've helped hundreds of small businesses across Kenya get reliable supply. Your trust means everything to us! 🤝";
  }

  // ── BULK / WHOLESALE QUESTIONS ──────────────────────────
  if (msg.match(/(bulk|wholesale|large order|big order|quantity|stock up|restock|large quantity|many items)/)) {
    return "Bulk orders are our specialty! 📦\n\nAt ShopZone everything is priced for wholesale — whether you're buying 1 carton or 100 cartons. Here's what makes bulk buying with us great:\n\n• Competitive per-unit pricing\n• Flexible payment — including bank transfer for large amounts\n• Reliable delivery across Kenya\n• Pro-forma invoices available\n\nFor very large orders (high value), email support@shopzone.com and our team will personally handle your order with a custom quote! 💪";
  }

  // ── BUSINESS / ENTREPRENEURSHIP ─────────────────────────
  if (msg.match(/(business|entrepreneur|hustle|side hustle|resell|reseller|profit|startup|shop|store|market|kiosk|duka)/)) {
    return "Love the entrepreneurial spirit! 🚀\n\nShopZone was built exactly for people like you — whether you run a duka, a market stall, an online business, or you're just starting out.\n\nHere's how many of our customers use ShopZone:\n• Buy wholesale → sell retail for profit\n• Restock their shops at competitive prices\n• Source products they can't find locally\n\nWhat kind of business are you running or planning? I might be able to point you to the right product category! 😊";
  }

  // ── WORKING HOURS ───────────────────────────────────────
  if (msg.match(/(hours|open|close|working|available|when can|time|schedule|office hours)/)) {
    return "ShopZone is online 24/7 so you can browse and place orders any time! 🕐\n\nFor live customer support:\n• Phone & WhatsApp: +254 700 000 000\n• Email: support@shopzone.com\n• Office hours: Monday to Friday, 8am – 6pm EAT\n\nFor urgent delivery or order issues outside office hours, WhatsApp us and we'll respond as soon as possible! 📲";
  }

  // ── CONTACT ─────────────────────────────────────────────
  if (msg.match(/(contact|reach|call|phone|whatsapp|email|talk to|speak|human|agent|person|staff|team|support)/)) {
    return "Our support team is always ready to help! 📞\n\n• 📞 Call or WhatsApp: +254 700 000 000\n• 📧 Email: support@shopzone.com\n• 📍 Location: Nairobi, Kenya\n• 🕐 Hours: Mon–Fri, 8am–6pm EAT\n\nFor fastest response, WhatsApp us — we typically reply within minutes during business hours! 💬";
  }

  // ── LOCATION OF SHOPZONE ─────────────────────────────────
  if (msg.match(/(where are you|where is shopzone|your location|based|physical|office|address|find you)/)) {
    return "ShopZone is based in Nairobi, Kenya! 📍\n\nWe operate primarily as an online wholesale platform so you can order from anywhere in Kenya and we deliver to you. No need to come to us!\n\nFor specific office visits or pickup arrangements, contact us at support@shopzone.com or +254 700 000 000 to make arrangements. 🏢";
  }

  // ── VAT / TAX ───────────────────────────────────────────
  if (msg.match(/(vat|tax|kra|pin|receipt|invoice|etims|tax invoice)/)) {
    return "Great question for business owners! 🧾\n\nAll ShopZone orders include a 16% VAT charge which is shown clearly at checkout. For formal tax invoices and KRA-compliant receipts, please contact support@shopzone.com after placing your order and our team will issue the documentation you need. 📋";
  }

  // ── UNIT / BALE EXPLANATION ──────────────────────────────
  if (msg.match(/(bale|carton|dozen|unit|kg|sack|box|what is one|what does one|quantity mean|mean by)/)) {
    return "Great question — let me explain our unit system! 📦\n\nAt ShopZone:\n• 1 Bale = typically a compressed pack (common for clothing & fabric)\n• 1 Carton = a sealed box of items (common for electronics & food)\n• 1 Dozen = 12 individual items\n• 1 Kg = weight-based unit (common for food & raw materials)\n• 1 Sack = large bag unit (common for grain, sugar, flour)\n• 1 Box = general boxed quantity\n\nEach product page shows exactly what the unit contains so you always know what you're buying. No hidden surprises! 😊";
  }

  // ── INTERNET / APP ───────────────────────────────────────
  if (msg.match(/(app|mobile app|download|android|ios|play store|apple store|apk)/)) {
    return "We currently operate as a web platform — just visit us on your phone browser and the site works great on mobile! 📱\n\nA dedicated ShopZone app is something we're working towards as we grow. For now, you can even save the website to your home screen for quick access!\n\nIs there anything specific you'd like to do that feels tricky on the browser? 😊";
  }

  // ── COMPLIMENT ───────────────────────────────────────────
  if (msg.match(/(great|awesome|amazing|love|excellent|perfect|best|wonderful|fantastic|nice|good job|well done|impressed)/)) {
    return "That really means a lot to us! 🙏😊 We work hard to make ShopZone the best wholesale experience in Kenya. Your kind words motivate us to keep improving.\n\nIs there anything else I can help you with today?";
  }

  // ── COMPLAINT ───────────────────────────────────────────
  if (msg.match(/(bad|terrible|awful|worst|hate|useless|rubbish|poor|slow|disappointing|not good|unhappy|frustrated|angry)/)) {
    return "I'm really sorry to hear you're not happy — that's the last thing we want! 😔\n\nYour experience matters deeply to us. Please reach out directly to our team so we can make this right:\n\n📞 +254 700 000 000 (call or WhatsApp)\n📧 support@shopzone.com\n\nWe take every complaint seriously and will do everything we can to resolve your situation as quickly as possible. 🙏";
  }

  // ── JOKE / FUN ───────────────────────────────────────────
  if (msg.match(/(joke|funny|laugh|fun|entertain|boring|tell me something)/)) {
    const jokes = [
      "Why did the wholesale merchant go broke? Because he kept buying in bulk but selling retail emotions! 😄 But seriously, that's why ShopZone exists — to keep your margins healthy! 💰",
      "What do you call a shopkeeper who loves ShopZone? A smart entrepreneur! 🏪😄 Okay I'll stick to customer support... anything I can help you with?",
      "Why did the bale of clothes go to school? To get a little more class! 👗😂 Anyway — is there something I can help you with today?",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // ── YES / NO / SHORT REPLIES ─────────────────────────────
  if (msg.match(/^(yes|yeah|yep|yup|sure|okay|ok|ndiyo|sawa|fine|alright|no|nope|nah|hapana)$/)) {
    return "Got it! 😊 Is there anything specific I can help you with? Feel free to ask about our products, delivery, payments, or anything else ShopZone related!";
  }

  // ── FALLBACK ─────────────────────────────────────────────
  const fallbacks = [
    "That's a really interesting one! 🤔 While I might not have the exact answer right now, our support team definitely will.\n\n📞 +254 700 000 000 (call or WhatsApp)\n📧 support@shopzone.com\n🕐 Mon–Fri, 8am–6pm EAT\n\nIs there anything else I can try to help with?",
    "Hmm, I want to make sure I give you the right answer on that one! 🙏 For the best response, please reach out to our team directly:\n\n📞 WhatsApp: +254 700 000 000\n📧 support@shopzone.com\n\nThey're super responsive during business hours! Anything else on your mind?",
    "Great question — and I don't want to guess on this one! 😊 Our human support team will give you a much better answer:\n\n📞 +254 700 000 000\n📧 support@shopzone.com\n\nIs there something else I can help clarify in the meantime?",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

const ChatWidget = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage]   = useState('');
  const [chatLog, setChatLog]   = useState([
    { role: 'bot', text: "👋 Jambo! I'm the ShopZone Assistant. How can I help you today?" }
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog, isTyping]);

  const quickReplies = [
    'How do I place an order?',
    'What payment methods do you accept?',
    'How do I become a seller?',
    'What is your return policy?',
  ];

  const handleSend = (overrideInput = null) => {
    const textToSend = overrideInput || message;
    if (!textToSend.trim() || isTyping) return;

    setChatLog(prev => [...prev, { role: 'user', text: textToSend }]);
    setMessage('');
    setIsTyping(true);

    const reply = getBotReply(textToSend);

    // Simulate natural typing delay based on reply length
    const delay = Math.min(Math.max(reply.length * 12, 1000), 3000);

    setTimeout(() => {
      setIsTyping(false);
      setChatLog(prev => [...prev, { role: 'bot', text: reply }]);
    }, delay);
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .typing-dot {
          width: 4px; height: 4px; margin: 0 1px;
          background-color: #D2B48C; border-radius: 50%;
          display: inline-block;
          animation: dotPulse 1s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .bot-dot { background-color: white; width: 6px; height: 6px; }
        .floating-container { animation: float 3s ease-in-out infinite; }
        .chat-window { animation: slideUp 0.3s ease-out; }
        .chat-message { animation: fadeIn 0.3s ease-out; }
        .quick-reply-btn:hover { background-color: #fdfaf5 !important; border-color: #B8956A !important; }
        .chat-input:focus { border-color: #D2B48C !important; outline: none; box-shadow: 0 0 0 2px rgba(210,180,140,0.2); }
      `}</style>

      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>

        {/* ── Closed State — Floating Button ── */}
        {!isOpen ? (
          <div
            className='floating-container'
            style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
          >
            <div style={{
              backgroundColor: 'white',
              color:           '#002147',
              padding:         '10px 18px',
              borderRadius:    '20px 20px 5px 20px',
              fontSize:        '14px',
              fontWeight:      '600',
              boxShadow:       '0 4px 15px rgba(0,0,0,0.1)',
              border:          '1px solid #D2B48C',
              animation:       'fadeIn 0.8s ease-out',
              whiteSpace:      'nowrap',
            }}>
              Questions? Ask me! 👋
            </div>
            <button
              onClick={() => setIsOpen(true)}
              style={{
                backgroundColor: '#002147',
                color:           '#D2B48C',
                borderRadius:    '50%',
                width:           '65px',
                height:          '65px',
                border:          '2px solid #D2B48C',
                cursor:          'pointer',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                boxShadow:       '0 6px 20px rgba(0,0,0,0.3)',
                flexShrink:      0,
              }}
            >
              <FaComments size={28} />
            </button>
          </div>
        ) : (

          /* ── Open State — Chat Window ── */
          <div
            className='chat-window'
            style={{
              width:           '350px',
              height:          '520px',
              backgroundColor: 'white',
              borderRadius:    '16px',
              display:         'flex',
              flexDirection:   'column',
              boxShadow:       '0 10px 40px rgba(0,33,71,0.2)',
              border:          '1px solid rgba(0,33,71,0.1)',
              overflow:        'hidden',
            }}
          >

            {/* Header */}
            <div style={{
              backgroundColor: '#002147',
              color:           '#D2B48C',
              padding:         '15px',
              display:         'flex',
              justifyContent:  'space-between',
              alignItems:      'center',
              flexShrink:      0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width:           '38px',
                  height:          '38px',
                  backgroundColor: '#D2B48C',
                  borderRadius:    '50%',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '18px',
                  flexShrink:      0,
                }}>
                  🛍️
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    ShopZone Assistant
                  </div>
                  <div style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '5px',
                    fontSize:   '11px',
                    color:      'rgba(210,180,140,0.8)',
                  }}>
                    <div style={{
                      width:           '6px',
                      height:          '6px',
                      backgroundColor: '#4CAF50',
                      borderRadius:    '50%',
                    }} />
                    {isTyping ? (
                      <span>
                        Typing{' '}
                        <span className='typing-dot' />
                        <span className='typing-dot' />
                        <span className='typing-dot' />
                      </span>
                    ) : 'Online'}
                  </div>
                </div>
              </div>
              <FaTimes
                onClick={() => setIsOpen(false)}
                style={{ cursor: 'pointer', opacity: 0.7, flexShrink: 0 }}
              />
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex:            1,
                padding:         '15px',
                overflowY:       'auto',
                backgroundColor: '#FAFAF9',
                display:         'flex',
                flexDirection:   'column',
                gap:             '10px',
              }}
            >
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className='chat-message'
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth:  '85%',
                  }}
                >
                  <div style={{
                    backgroundColor: msg.role === 'user' ? '#002147' : 'white',
                    color:           msg.role === 'user' ? '#D2B48C' : '#333',
                    padding:         '10px 14px',
                    borderRadius:    msg.role === 'user'
                      ? '15px 15px 2px 15px'
                      : '15px 15px 15px 2px',
                    fontSize:   '13.5px',
                    boxShadow:  '0 2px 5px rgba(0,0,0,0.05)',
                    border:     msg.role === 'bot' ? '1px solid #EAE0D5' : 'none',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.5',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{
                    backgroundColor: '#002147',
                    padding:         '10px 14px',
                    borderRadius:    '15px 15px 15px 2px',
                    display:         'inline-flex',
                    alignItems:      'center',
                  }}>
                    <span className='typing-dot bot-dot' />
                    <span className='typing-dot bot-dot' />
                    <span className='typing-dot bot-dot' />
                  </div>
                </div>
              )}

              {/* Quick replies */}
              {chatLog.length === 1 && !isTyping && (
                <div style={{
                  display:   'flex',
                  flexWrap:  'wrap',
                  gap:       '8px',
                  marginTop: '5px',
                }}>
                  {quickReplies.map((q, i) => (
                    <button
                      key={i}
                      className='quick-reply-btn'
                      onClick={() => handleSend(q)}
                      style={{
                        backgroundColor: 'white',
                        border:          '1px solid #D2B48C',
                        borderRadius:    '18px',
                        padding:         '6px 12px',
                        fontSize:        '12px',
                        color:           '#002147',
                        cursor:          'pointer',
                        transition:      'all 0.2s ease',
                        fontWeight:      '500',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              padding:         '12px',
              borderTop:       '1px solid #EAE0D5',
              display:         'flex',
              gap:             '10px',
              alignItems:      'center',
              backgroundColor: 'white',
              flexShrink:      0,
            }}>
              <input
                type='text'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder='Ask something...'
                className='chat-input'
                style={{
                  flex:         1,
                  border:       '1px solid #EAE0D5',
                  borderRadius: '20px',
                  padding:      '10px 15px',
                  fontSize:     '14px',
                  outline:      'none',
                  transition:   'border-color 0.2s ease',
                  fontFamily:   'inherit',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!message.trim() || isTyping}
                style={{
                  backgroundColor: message.trim() && !isTyping ? '#002147' : '#CCCCCC',
                  color:           message.trim() && !isTyping ? '#D2B48C' : '#888',
                  border:          'none',
                  borderRadius:    '50%',
                  width:           '40px',
                  height:          '40px',
                  cursor:          message.trim() && !isTyping ? 'pointer' : 'default',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  flexShrink:      0,
                  transition:      'all 0.2s ease',
                }}
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;