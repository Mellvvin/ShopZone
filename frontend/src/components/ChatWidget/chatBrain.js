const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const withContext = (reply, currentContext, updates = {}) => ({
  reply,
  context: {
    ...currentContext,
    ...updates,
  },
});

const hasMatch = (message, pattern) => pattern.test(message);

const locations = [
  ['taita taveta', "Taita Taveta is covered!  2 business days. Voi, Wundanyi and Taveta town all covered."],
  ['tana river', "Tana River county is covered!  2-3 business days. Contact support for exact arrangements."],
  ['tharaka nithi', "Tharaka Nithi is covered!  2 business days. Chuka area reachable."],
  ['uasin gishu', "Uasin Gishu is covered!  1-2 business days. Eldoret and surrounding areas."],
  ['trans nzoia', "Trans Nzoia is covered!  1-2 business days. Kitale and surrounding areas."],
  ['west pokot', "West Pokot is covered!  2-3 business days. Kapenguria and surrounding areas."],
  ['homa bay', "Homa Bay is covered!  1-2 business days. Homa Bay town and Mbita reachable."],
  ['athi river', "Athi River is covered!  Industrial area just outside Nairobi - same-day or next morning delivery."],
  ['nairobi', "Nairobi is our home base! We deliver same-day or next-day within Nairobi depending on your area - CBD, Westlands, Eastlands, Karen, all covered. Shipping starts at KSh 300 for up to 5kg."],
  ['thika', "Thika is very close to us - deliveries can be as fast as same-day or next morning! Great industrial hub. Shipping from KSh 300."],
  ['ruiru', "Ruiru is covered! Just outside Nairobi - deliveries typically same-day or next morning. Shipping from KSh 300."],
  ['juja', "Juja is covered! Close to Nairobi - deliveries typically same-day or next morning."],
  ['limuru', "Limuru is covered! Just outside Nairobi - deliveries typically same-day or next morning."],
  ['ngong', "Ngong is covered! Same-day or next morning delivery. Kajiado county businesses welcome!"],
  ['kitengela', "Kitengela is covered! Fast growing town - deliveries typically same-day or next morning."],
  ['kiambu', "Kiambu is right on our doorstep! Fast delivery, usually within a day. Shipping from KSh 300."],
  ["murang'a", "Yes, we deliver to Murang'a! Typically 1 business day. Great farming county - welcome to ShopZone!"],
  ['muranga', "Yes, we deliver to Murang'a! Typically 1 business day. Great farming county - welcome to ShopZone!"],
  ['nyeri', "Nyeri is well served! We ship within 1-2 business days. Mt. Kenya region businesses love our wholesale prices."],
  ['kirinyaga', "Kirinyaga is covered! Deliveries take 1-2 business days."],
  ['nyandarua', "Yes, we deliver to Nyandarua! Typically 1-2 business days."],
  ['nyahururu', "Nyahururu is covered! Thomson's Falls area - 1-2 business days."],
  ['mombasa', "Yes, we deliver to Mombasa! 1-2 business days via our trusted courier partners. Coastal businesses very welcome."],
  ['kilifi', "Kilifi is covered! 1-2 business days via our coastal routes."],
  ['kwale', "Yes, we deliver to Kwale! 1-2 business days. Diani and Ukunda covered."],
  ['lamu', "We can arrange delivery to Lamu! Contact support@shopzone.com for island logistics. Mainland Lamu is straightforward."],
  ['malindi', "Malindi is served! 2 business days via our coastal routes."],
  ['voi', "Voi is covered! 2 business days via our Mombasa highway routes."],
  ['machakos', "Yes, we deliver to Machakos! 1-2 business days. Machakos town, Athi River, Kangundo all covered."],
  ['makueni', "Makueni is covered! 1-2 business days. Wote and Kibwezi covered."],
  ['kitui', "Yes, Kitui is on our delivery map! 2 business days."],
  ['embu', "Embu is well covered! 1-2 business days."],
  ['meru', "Yes, Meru is covered! 2 business days. Great farming and business community."],
  ['isiolo', "Isiolo is covered! 2-3 business days. Gateway to northern Kenya."],
  ['marsabit', "We deliver to Marsabit! 3-4 business days. Contact support@shopzone.com for arrangements."],
  ['garissa', "We ship to Garissa! 2-3 business days. Contact support for specific arrangements."],
  ['wajir', "Yes, we deliver to Wajir! 3-4 business days via our northern routes."],
  ['mandera', "We deliver to Mandera! 3-5 business days. Please contact support@shopzone.com to plan your delivery."],
  ['nakuru', "Nakuru? Absolutely! 1-2 business days. Growing business hub."],
  ['eldoret', "Eldoret is fully covered! 1-2 business days via reliable courier services."],
  ['nandi', "Nandi county is covered! 1-2 business days."],
  ['kericho', "Kericho is well served! 1-2 business days. Prime tea growing region."],
  ['bomet', "Yes, Bomet is covered! 1-2 business days."],
  ['narok', "Narok is covered! 1-2 business days. Narok town and surrounding areas."],
  ['kajiado', "Kajiado is covered! 1-2 business days. Ngong, Kitengela and Kajiado town all reachable."],
  ['samburu', "We deliver to Samburu! 2-3 business days. Maralal and surrounding areas."],
  ['turkana', "We deliver to Turkana! 3-5 business days to Lodwar. Contact support to plan your delivery."],
  ['baringo', "Baringo is covered! 1-2 business days. Kabarnet and Eldama Ravine covered."],
  ['laikipia', "Laikipia is covered! 1-2 business days. Nanyuki and Nyahururu well served."],
  ['kitale', "Kitale is covered! 1-2 business days. Agricultural heartland businesses welcome."],
  ['nanyuki', "Nanyuki is covered! 1-2 business days. Mt. Kenya region well served."],
  ['kakamega', "Kakamega is covered! 1-2 business days. Western Kenya businesses welcome."],
  ['bungoma', "Bungoma is covered! 1-2 business days. Mt. Elgon region served."],
  ['busia', "Yes, Busia is covered! 1-2 business days. Cross-border trading hub welcome."],
  ['vihiga', "Vihiga is covered! 1-2 business days. Mbale and surrounding areas."],
  ['kisumu', "Kisumu is well covered! 1-2 business days. Many of our Lake Victoria wholesale clients rely on us."],
  ['siaya', "Siaya is covered! 1-2 business days. Bondo and Ugunja areas served."],
  ['migori', "Migori is covered! 1-2 business days. Isebania and Migori town covered. Border businesses welcome!"],
  ['kisii', "Yes, Kisii is on our delivery map! 1-2 business days. Vibrant business community."],
  ['nyamira', "Nyamira is covered! 1-2 business days. Keroka and Nyamira town reachable."],
];

export const getBotReply = (input, context = {}) => {
  const msg = input.toLowerCase().trim();
  const currentContext = {
    lastLocation: null,
    lastTopic: null,
    lastProduct: null,
    ...context,
  };

  if (hasMatch(msg, /^(hi|hello|hey|jambo|habari|niaje|sasa|howdy|good morning|good afternoon|good evening|sup|hiya)\b/)) {
    return withContext(
      pickRandom([
        "Habari! Great to have you here at ShopZone. Whether you're restocking your shelves or sourcing for the first time, I'm here to help. What can I do for you today?",
        "Hello there! Welcome to ShopZone Wholesale. I can help you with orders, products, delivery, payments and more. What's on your mind?",
        "Hey! Glad you reached out. ShopZone is your go-to for wholesale goods across Kenya. How can I assist you today?",
      ]),
      currentContext,
      { lastTopic: 'greeting' }
    );
  }

  if (hasMatch(msg, /(how are you|how are things|you good|uko sawa|uko vipi)/)) {
    return withContext("I'm doing great, thank you for asking! Always ready to help ShopZone customers get the best wholesale deals. Now, what can I help you with today?", currentContext);
  }

  if (hasMatch(msg, /(thank|thanks|asante|appreciate|helpful)/)) {
    return withContext("You're very welcome! That's what I'm here for. Is there anything else I can help you with? We want your ShopZone experience to be as smooth as possible.", currentContext);
  }

  if (hasMatch(msg, /(bye|goodbye|later|see you|kwaheri|ciao|take care)/)) {
    return withContext("Goodbye! Thank you for visiting ShopZone. Feel free to come back anytime you need assistance. Happy shopping and good business!", currentContext);
  }

  if (hasMatch(msg, /(supplier|who makes|who supplies|where do you get|contact the seller|seller number|seller contact|seller phone|seller email|seller whatsapp|vendor contact|manufacturer|who is the seller|give me the seller|talk to the seller|speak to the seller|bypass|off platform|directly from|direct from seller|direct contact)/)) {
    return withContext("At ShopZone all communication goes through us directly.\n\nWe work with verified suppliers privately, but as a customer you deal exclusively with ShopZone - not individual sellers. This protects you in several important ways:\n\n• One point of contact for all support\n• Guaranteed accountability for every order\n• No risk of being taken off-platform or scammed\n• ShopZone investigates and resolves all disputes\n\nIf you have a question about a specific product, just ask us and we'll get you the answer.", currentContext, { lastTopic: 'supplier_privacy' });
  }

  if (hasMatch(msg, /(report|scammer|fraud|fraudster|fake seller|suspicious|con|conned|cheated|stolen|stole|fake|report a problem)/)) {
    return withContext("I'm really sorry to hear you've had a bad experience! Here's how to report suspicious activity on ShopZone:\n\n1. Take screenshots of all conversations and transactions\n2. Note the product and order involved\n3. Contact us immediately:\n\n+254 700 000 000 (call or WhatsApp)\nreport@shopzone.com\n\nWe take fraud extremely seriously. Every report is investigated within 24 hours and action is taken against verified bad actors. Your safety on our platform is our top priority!", currentContext);
  }

  const foundLocation = locations.find(([location]) => msg.includes(location));
  if (foundLocation) {
    const [location, response] = foundLocation;
    if (hasMatch(msg, /(courier|transport|who delivers|delivery company|which company|carrier|parcel service|bus service|g4s|fargo)/)) {
      return withContext(
        `${response}\n\nFor ${location}, ShopZone may use G4S, Fargo, and trusted bus parcel services depending on package size, urgency, and pickup/drop-off location.\n\nShipping rates: KSh 300 for up to 5kg, plus KSh 100 per additional kg.`,
        currentContext,
        { lastLocation: location, lastTopic: 'delivery' }
      );
    }

    return withContext(
      `${response}\n\nShipping rates: KSh 300 for up to 5kg, plus KSh 100 per additional kg.`,
      currentContext,
      { lastLocation: location, lastTopic: 'delivery' }
    );
  }

  if (hasMatch(msg, /(shipping rate|delivery cost|delivery fee|delivery charge|how much to deliver|how much to ship|cost to deliver|cost to ship|delivery price|shipping price)/)) {
    return withContext("Here are our standard shipping rates across Kenya!\n\nStandard Rates:\n• Up to 5kg - KSh 300\n• Every additional 1kg - KSh 100\n\nExamples:\n• 5kg order -> KSh 300\n• 8kg order -> KSh 600\n• 15kg order -> KSh 1,300\n\nNairobi & environs may qualify for reduced rates on large orders. For very heavy bulk orders email support@shopzone.com for a custom shipping quote!\n\nShipping is calculated at checkout based on your order weight and location.", currentContext, { lastTopic: 'delivery' });
  }

  if (hasMatch(msg, /(deliver|shipping|ship|courier|transport|how long|arrival|when will|dispatch|logistics|where do you deliver|do you deliver|coverage)/)) {
    if (currentContext.lastLocation) {
      return withContext(`Based on your location in ${currentContext.lastLocation}, deliveries typically take the timeline shown for that area. Shipping starts at KSh 300 for up to 5kg, plus KSh 100 per additional kg.`, currentContext, { lastTopic: 'delivery' });
    }

    return withContext("We deliver across all 47 counties in Kenya!\n\nDelivery timelines:\n• Nairobi & environs: Same-day or next-day\n• Major towns (Mombasa, Kisumu, Nakuru, Eldoret): 1-2 business days\n• Remote areas: 2-4 business days\n\nShipping rates start at KSh 300 for up to 5kg, plus KSh 100 per additional kg.\n\nWe use G4S, Fargo, and trusted bus services. What town are you in? I can give you a more specific estimate!", currentContext, { lastTopic: 'delivery' });
  }

  if (hasMatch(msg, /(pay|payment|mpesa|m-pesa|paypal|bank|transfer|till|paybill|lipa|invoice|deposit|accept)/)) {
    return withContext("We offer flexible and secure payment options\n\n• M-Pesa Xpress - instant and secure\n• PayPal - for international transactions\n• Bank Transfer - for large wholesale orders\n\nFor big orders we always issue a formal pro-forma invoice first so you know exactly what you're paying before sending a single shilling. No surprises! Which payment method would you like to know more about?", currentContext, { lastTopic: 'payment' });
  }

  if (hasMatch(msg, /(minimum order|moq|minimum|least amount|smallest order|minimum quantity)/)) {
    return withContext("Great question! ShopZone does not have a fixed minimum order quantity.\n\nOrder what makes sense for your business - whether that's 1 bale, 1 carton, or 100 cartons. Each product page shows the unit type so you always know what you're getting.\n\nFor very large orders we recommend contacting support@shopzone.com for a custom bulk quote and possible better rates!", currentContext);
  }

  if (hasMatch(msg, /(cannot find|can't find|don't see|not listed|sourcing|can you get|can you find|can you source|looking for|need yarn|need fabric|need electronics|need stock|i need|request a product|request goods|custom order|special order|not available|out of stock)/)) {
    return withContext("We love custom requests!\n\nIf you can't find what you're looking for on ShopZone, we may be able to source it for you. Here's how to submit a product request:\n\n1. Email support@shopzone.com with:\n   • Product name and description\n   • Quantity needed (e.g. 5 bales, 10 cartons)\n   • Your location\n   • Your deadline\n   • Your budget range\n\n2. Our team reviews within 24-48 hours\n3. If we can source it, we'll send you a quote\n4. You approve and we handle the rest!\n\nWhat product were you looking for?", currentContext, { lastTopic: 'quote_request' });
  }

  if (hasMatch(msg, /(quote|get a quote|request quote|price quote|bulk quote|wholesale quote|how much for|price for|cost for|i want to order|i need to order|i want to buy|i need to buy)/)) {
    return withContext("Happy to help with a quote!\n\nFor the fastest quote, email us at support@shopzone.com with:\n• Product name\n• Quantity (e.g. 20 cartons, 5 bales)\n• Your location\n• Delivery deadline if any\n• Budget range\n\nWe typically respond within a few hours during business hours (Mon-Fri, 8am-6pm EAT).\n\nAlternatively, WhatsApp us directly at +254 700 000 000 for urgent quotes!", currentContext, { lastTopic: 'quote_request' });
  }

  if (hasMatch(msg, /(price|cost|how much|bei|cheap|expensive|afford|budget|rate|pricing)/)) {
    return withContext("Our prices are set to give you the best wholesale value in Kenya!\n\nHere's how pricing works:\n• Each product shows its price per unit - bale, carton, kg, box, dozen or sack\n• Prices are wholesale rates, better than retail\n• Shipping is KSh 300 for up to 5kg, plus KSh 100 per additional kg\n\nFor a specific bulk price quote, email support@shopzone.com or use our quote request - just tell us the product, quantity, and your location and we'll get back to you within a few hours!", currentContext);
  }

  if (hasMatch(msg, /(seller dashboard|seller portal|my dashboard|upload product|list product|manage product|seller account|product approval|why is my product|product review|seller login)/)) {
    return withContext("The ShopZone Seller Dashboard lets you manage your products and orders in one place!\n\nHere's what sellers can do:\n• Upload and manage product listings\n• Set prices and unit types (bale, carton, kg etc.)\n• View incoming orders - you see the shipping details but all communication goes through ShopZone\n• Mark orders as shipped\n• Track your sales\n\nProduct approval: All new product listings are reviewed by ShopZone before going live. This protects buyers and keeps the platform quality high.\n\nTo access your seller dashboard, log in and go to your profile. If you're not yet a seller, email support@shopzone.com to apply!", currentContext);
  }

  if (hasMatch(msg, /(sell|seller|vendor|supplier|list my product|become a seller|partner|wholesale supplier|distributor|stockist|i want to sell|i supply)/)) {
    return withContext("We're always looking for quality suppliers to join ShopZone!\n\nHere's how our seller program works:\n\n1. Email support@shopzone.com with:\n   • Your business name\n   • What products you supply\n   • Your location\n   • Approximate stock quantities\n\n2. Our team reviews your application within 48 hours\n3. We verify your products and business\n4. Once approved you get access to your seller dashboard\n5. You list products - ShopZone handles all customer communication\n\nImportant: On ShopZone, all buyer-seller communication goes through us. You ship the product and we handle the rest. This protects you and the customer.\n\nReady to apply? Email support@shopzone.com!", currentContext, { lastTopic: 'seller' });
  }

  if (hasMatch(msg, /(return|refund|exchange|wrong item|damaged|broken|defective|complaint|not happy|disappointed|spoilt|faulty|bad quality)/)) {
    return withContext("I'm really sorry to hear that! At ShopZone we take quality seriously.\n\nHere's our returns process:\n• Contact us within 7 days of delivery\n• WhatsApp or call +254 700 000 000 with photos of the issue\n• Our team reviews within 24 hours\n• If valid, we arrange an exchange or refund\n\nImportant: All return requests go through ShopZone - not directly to the seller. We investigate, mediate and resolve every issue on your behalf.\n\nWould you like to report an issue right now? If so please call or WhatsApp +254 700 000 000.", currentContext, { lastTopic: 'returns' });
  }

  if (hasMatch(msg, /(track|tracking|where is my order|order status|status|has it shipped|dispatched|on the way|update on my order)/)) {
    return withContext("To track your order:\n\n1. Log into your ShopZone account\n2. Go to your profile icon -> My Orders\n3. Click on the specific order to see its current status\n\nOrder statuses:\n• Pending - order received, being processed\n• Not Yet Delivered - order confirmed, awaiting shipment\n• Delivered - order completed\n• Cancelled - order was cancelled\n\nIf your order is overdue please call us at +254 700 000 000 or WhatsApp us and we'll investigate immediately!", currentContext);
  }

  if (hasMatch(msg, /(cancel|cancell|stop order|changed my mind|undo order|don't want anymore)/)) {
    return withContext("No problem at all! Orders can be cancelled as long as they haven't been dispatched yet.\n\nTo cancel:\n1. Go to your profile -> My Orders\n2. Open the order and click 'Cancel Order'\n3. Confirm the cancellation\n\nIf your order has already been dispatched, please call us urgently at +254 700 000 000 and we'll do our best to help!\n\nNote: Once an order is paid and dispatched, cancellation may not always be possible but we will always try our best.", currentContext);
  }

  if (hasMatch(msg, /(account|login|sign in|register|password|forgot|reset|create account|sign up|profile)/)) {
    return withContext("Account help is easy!\n\n• Create an account: Click 'Sign In' -> 'Register here'\n• Log in: Click 'Sign In' and enter your email and password\n• Forgot password: Contact support@shopzone.com and we'll reset it for you\n• Update profile: Click the profile icon -> My Profile\n\nIs there a specific account issue you're having?", currentContext);
  }

  if (hasMatch(msg, /(cart|checkout|add to cart|basket|purchase|buy|place order|place an order|how to order|ordering|how do i order|how do i place|how to buy|steps to order)/)) {
    return withContext("Ordering on ShopZone is really simple!\n\nStep by step:\n1. Browse products on the home page or search for what you need\n2. Click a product to see full details including unit type\n3. Select your quantity and click 'Add to Cart'\n4. Go to your cart and click 'Proceed to Checkout'\n5. Enter your shipping address\n6. Choose your payment method - M-Pesa, PayPal or Bank Transfer\n7. Review your order summary including VAT and shipping\n8. Click 'Place Order'\n\nYour order goes straight into our system and we handle everything from there!", currentContext, { lastTopic: 'ordering' });
  }

  if (hasMatch(msg, /(electronics|phone|laptop|gadget|appliance|computer|tv|television|smartphone)/)) {
    return withContext("We have a great Electronics category!\n\nYou'll find smartphones, accessories, home appliances, and more - all at wholesale prices. Perfect for electronics retailers, phone repair shops, and tech resellers.\n\nBrowse Electronics on the homepage or search for a specific product. For bulk electronics quotes email support@shopzone.com!", currentContext, { lastProduct: 'electronics' });
  }

  if (hasMatch(msg, /(fashion|clothes|clothing|fabric|bale|garment|textile|wear|shoes|footwear|dress|shirt|trouser|mitumba)/)) {
    return withContext("Fashion is one of our biggest categories!\n\nWe stock clothing bales, fabrics, footwear, and accessories - perfect for mitumba sellers, boutique owners, and market traders.\n\nOne bale typically contains a mix of assorted items. Browse Fashion on our homepage to see what's available!", currentContext, { lastProduct: 'fashion' });
  }

  if (hasMatch(msg, /(food|beverage|drink|grocery|sugar|flour|rice|maize|unga|oil|juice|water|snack|cereal)/)) {
    return withContext("Our Food & Beverage category has great wholesale deals!\n\nWe stock dry goods, cooking essentials, drinks, and packaged foods in bulk - ideal for shops, hotels, schools, and events businesses.\n\nFood products move fast so check the homepage for current stock. For large food orders email support@shopzone.com for a custom quote!", currentContext, { lastProduct: 'food' });
  }

  if (hasMatch(msg, /(beauty|cosmetic|skincare|hair|makeup|lotion|soap|cream|perfume|deodorant|hygiene)/)) {
    return withContext("Our Beauty & Personal Care section has fantastic wholesale options!\n\nFrom skincare to hair products to soap - perfect for beauty shops, salons, and supermarkets. All products are sourced from verified suppliers.\n\nBrowse Beauty on our homepage! Want to know about a specific product?", currentContext, { lastProduct: 'beauty' });
  }

  if (hasMatch(msg, /(hardware|tools|building|construction|paint|nail|screw|electrical|plumbing|wire)/)) {
    return withContext("Hardware & Tools - a growing category on ShopZone!\n\nWe stock construction materials, tools, electrical supplies, and plumbing items - ideal for hardware shops, contractors, and building suppliers.\n\nBrowse Hardware on the homepage or reach out for bulk pricing on specific items!", currentContext, { lastProduct: 'hardware' });
  }

  if (hasMatch(msg, /(office|stationery|pen|paper|printer|desk|furniture|school|exercise book|notebook)/)) {
    return withContext("Office & Stationery supplies available in bulk!\n\nPerfect for schools, offices, printing businesses, and stationery shops. We stock everything from exercise books to printer cartridges.\n\nCheck Office Supplies on our homepage. For school or corporate bulk orders email support@shopzone.com for a special quote!", currentContext, { lastProduct: 'office' });
  }

  if (hasMatch(msg, /(home|kitchen|cookware|furniture|bedding|curtain|utensil|appliance|cleaning)/)) {
    return withContext("Our Home & Kitchen category is stocked with great wholesale items!\n\nFrom cookware to bedding to cleaning supplies - perfect for home goods retailers, hotels, and hospitality businesses.\n\nBrowse Home & Kitchen on our homepage! For bulk hotel or hospitality orders contact support@shopzone.com", currentContext, { lastProduct: 'home_kitchen' });
  }

  if (hasMatch(msg, /(legit|legitimate|scam|trust|safe|real|fake|genuine|verified|reliable|honest|sure about)/)) {
    return withContext("100% legitimate and registered! ✅\n\nShopZone is a registered wholesale business based in Nairobi, Kenya. Here's why you can trust us:\n\n• Every seller on our platform is verified before listing\n• All transactions go through ShopZone - we are fully accountable\n• Secure payment methods - M-Pesa, PayPal, Bank Transfer\n• Pro-forma invoices for large orders\n• 7-day return policy on faulty or wrong items\n• You never deal with sellers directly - ShopZone handles everything\n• Real customer support: +254 700 000 000\n\nYour trust means everything to us. We built ShopZone specifically so small businesses have a safe, reliable supply chain.", currentContext);
  }

  if (hasMatch(msg, /(bulk|wholesale|large order|big order|stock up|restock|large quantity|many items|bulk buying)/)) {
    return withContext("Bulk orders are our specialty!\n\nAt ShopZone everything is priced for wholesale - whether you're buying 1 carton or 100 cartons. Benefits of bulk buying with us:\n\n• Competitive per-unit pricing\n• Flexible payment including bank transfer for large amounts\n• Pro-forma invoices available\n• Reliable delivery across all 47 counties\n• All handled by ShopZone from order to delivery\n\nFor very large orders email support@shopzone.com with product, quantity, location and budget for a custom quote!", currentContext);
  }

  if (hasMatch(msg, /(bale|carton|dozen|unit|kg|sack|box|what is one|what does one|quantity mean|mean by|unit type)/)) {
    return withContext("Great question - let me explain our unit system!\n\nAt ShopZone one quantity equals one wholesale unit:\n• 1 Bale - compressed pack, common for clothing and fabric\n• 1 Carton - sealed box, common for electronics and food\n• 1 Dozen - 12 individual items\n• 1 Kg - weight unit, common for food and raw materials\n• 1 Sack - large bag, common for grain, sugar, flour\n• 1 Box - general boxed quantity\n• 1 Per Unit - individual item\n\nEach product page shows exactly what the unit contains so you always know what you're buying. No hidden surprises!", currentContext);
  }

  if (hasMatch(msg, /(hours|open|close|working|available|when can|time|schedule|office hours)/)) {
    return withContext("ShopZone is online 24/7 - browse and place orders any time!\n\nFor live customer support:\n• Phone & WhatsApp: +254 700 000 000\n• Email: support@shopzone.com\n• Office hours: Monday to Friday, 8am-6pm EAT\n\nFor urgent delivery or order issues outside office hours, WhatsApp us and we'll respond as soon as possible!", currentContext);
  }

  if (hasMatch(msg, /(contact|reach|call|phone|whatsapp|email|talk to|speak|human|agent|person|staff|team|support)/)) {
    return withContext("Our support team is always ready to help!\n\n• Call or WhatsApp: +254 700 000 000\n• Email: support@shopzone.com\n• Location: Nairobi, Kenya\n• Hours: Mon-Fri, 8am-6pm EAT\n\nFor fastest response WhatsApp us - we typically reply within minutes during business hours!", currentContext);
  }

  if (hasMatch(msg, /(where are you|where is shopzone|your location|based|physical|office|address|find you)/)) {
    return withContext("ShopZone is based in Nairobi, Kenya!\n\nWe operate primarily as an online wholesale platform so you can order from anywhere in Kenya and we deliver to you.\n\nFor office visits or pickup arrangements, contact us at support@shopzone.com or +254 700 000 000 to make arrangements.", currentContext);
  }

  if (hasMatch(msg, /(vat|tax|kra|pin|receipt|invoice|etims|tax invoice|sixteen percent|16%)/)) {
    return withContext("All ShopZone orders include a 16% VAT charge shown clearly at checkout.\n\nFor formal KRA-compliant tax invoices and receipts, contact support@shopzone.com after placing your order and our team will issue the documentation you need.", currentContext);
  }

  if (hasMatch(msg, /(app|mobile app|download|android|ios|play store|apple store|apk)/)) {
    return withContext("We currently operate as a web platform - visit us on your phone browser and the site works great on mobile!\n\nA dedicated ShopZone app is something we're working towards as we grow. For now you can save the website to your home screen for quick access!\n\nIs there something specific that feels tricky on the browser?", currentContext);
  }

  if (hasMatch(msg, /(business|entrepreneur|hustle|side hustle|resell|reseller|profit|startup|shop|store|market|kiosk|duka)/)) {
    return withContext("Love the entrepreneurial spirit!\n\nShopZone was built exactly for people like you - whether you run a duka, a market stall, an online shop, or you're just starting out.\n\nMany of our customers:\n• Buy wholesale on ShopZone and sell retail for profit\n• Restock their shops at prices better than local wholesalers\n• Source products they can't find easily in their area\n\nWhat kind of business are you running or planning? I might be able to point you to the right category!", currentContext);
  }

  if (hasMatch(msg, /(great|awesome|amazing|love|excellent|perfect|best|wonderful|fantastic|nice|good job|well done|impressed)/)) {
    return withContext("That really means a lot to us! We work hard to make ShopZone the best wholesale experience in Kenya. Your kind words motivate us to keep improving!\n\nIs there anything else I can help you with today?", currentContext);
  }

  if (hasMatch(msg, /(bad|terrible|awful|worst|hate|useless|rubbish|poor|slow|disappointing|not good|unhappy|frustrated|angry)/)) {
    return withContext("I'm really sorry to hear you're not happy - that's the last thing we want!\n\nYour experience matters deeply to us. Please reach out directly so we can make this right:\n\n+254 700 000 000 (call or WhatsApp)\nsupport@shopzone.com\n\nWe take every complaint seriously and will do everything we can to resolve your situation as quickly as possible.", currentContext);
  }

  if (hasMatch(msg, /(joke|funny|laugh|fun|entertain|boring|tell me something)/)) {
    return withContext(
      pickRandom([
        "Why did the wholesale merchant go broke? Because he kept buying in bulk but selling retail emotions! But seriously, that's why ShopZone exists - to keep your margins healthy!",
        "What do you call a shopkeeper who loves ShopZone? A smart entrepreneur! Okay I'll stick to customer support... anything I can help you with?",
        "Why did the bale of clothes go to school? To get a little more class! Anyway - is there something I can help you with today?",
      ]),
      currentContext
    );
  }

  if (hasMatch(msg, /^(yes|yeah|yep|yup|sure|okay|ok|ndiyo|sawa|fine|alright|no|nope|nah|hapana)$/)) {
    return withContext("Got it! Is there anything specific I can help you with? Feel free to ask about our products, delivery, payments, or anything else ShopZone related!", currentContext);
  }

  return withContext(
    pickRandom([
      "That's a really interesting one! While I might not have the exact answer right now, our support team definitely will.\n\n+254 700 000 000 (call or WhatsApp)\nsupport@shopzone.com\nMon-Fri, 8am-6pm EAT\n\nIs there anything else I can try to help with?",
      "Hmm, I want to make sure I give you the right answer on that one! For the best response please reach out to our team directly:\n\nWhatsApp: +254 700 000 000\nsupport@shopzone.com\n\nThey're super responsive during business hours! Anything else on your mind?",
      "Great question - and I don't want to guess on this one! Our human support team will give you a much better answer:\n\n+254 700 000 000\nsupport@shopzone.com\n\nIs there something else I can help clarify in the meantime?",
    ]),
    currentContext
  );
};
