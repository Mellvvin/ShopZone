// frontend/src/data/legalContent.js
// ─────────────────────────────────────────────────────────────
// DEVELOPMENT PLACEHOLDER legal text, written to reflect how
// ShopZone actually works so the layout can be judged with
// realistic content. NOT legal advice. A practising Kenyan
// lawyer must review and replace before launch.
//
// Shape: { title, intro, sections: [{ heading, paragraphs?, items? }] }
//   paragraphs — plain text blocks
//   items      — rendered as a bulleted list under the paragraphs
// ─────────────────────────────────────────────────────────────
import { SITE } from './siteConfig';

// ═════════════════════════════════════════════════════════════
// PRIVACY POLICY
// ═════════════════════════════════════════════════════════════
export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  intro: `${SITE.legalName} ("${SITE.name}", "we", "us") operates a wholesale marketplace from ${SITE.location}. This policy explains what personal data we collect, why we collect it, who sees it, how long we keep it, and the rights you have over it. It is written to comply with the Data Protection Act, 2019 of Kenya.`,
  sections: [
    {
      heading: 'Who is responsible for your data',
      paragraphs: [
        `${SITE.legalName} is the data controller for personal data collected through this platform. Registration details: ${SITE.registrationNumber}. Data protection registration: ${SITE.odpcRegistration}.`,
        `For any privacy question or request, contact us at ${SITE.supportEmail}.`,
      ],
    },
    {
      heading: 'Information we collect',
      paragraphs: ['Depending on how you use the platform, we collect the following.'],
      items: [
        'Account information: your name, email address, phone number, password (stored only in encrypted form), account type and business name.',
        'Delivery information: street address, apartment or building, town, county and country.',
        'Order information: the items you order, quantities, prices, delivery fees, order status and delivery confirmation.',
        'Payment information: the payment method used, M-Pesa receipt numbers, bank references and amounts. We never store card numbers, CVV codes or card expiry dates.',
        'Seller information (sellers only): business address, business description, KRA PIN and the M-Pesa number used for payouts.',
        'Communications: messages and screenshots you send us through contact, bulk-order, support and seller-application forms, and your replies to our notifications.',
        'Usage information: products you view, items you save, searches you make and basic technical data such as browser type, used to keep the platform working and to improve it.',
        'Consent records: the date and version of the Terms of Service and Privacy Policy you accepted, kept as proof of your agreement.',
      ],
    },
    {
      heading: 'Why we use your information',
      paragraphs: ['We process personal data only where we have a lawful basis to do so:'],
      items: [
        'To perform our contract with you: creating your account, processing and delivering orders, confirming payments, resolving disputes and providing support.',
        'To meet legal obligations: keeping tax and accounting records, including VAT, and responding to lawful requests from authorities.',
        'For our legitimate interests: preventing fraud and abuse, securing the platform, and improving our service.',
        'With your consent: sending promotional messages and newsletters. You can withdraw consent at any time from your notification preferences.',
      ],
    },
    {
      heading: 'Our marketplace model and what suppliers see',
      paragraphs: [
        `All transactions on ${SITE.name} go through ${SITE.name}. Suppliers who fulfil your order receive only what they need to prepare it: the products, quantities, handling instructions and the delivery county. They never receive your name, phone number, email address or full delivery address, and they may not contact you directly.`,
        'Likewise, we do not show buyers the identity, contact details or location of the suppliers behind a product.',
      ],
    },
    {
      heading: 'Who we share information with',
      paragraphs: ['We do not sell your personal data. We share it only with:'],
      items: [
        'Delivery and courier partners, who receive the details needed to deliver your goods.',
        'Payment providers and banks, to process and confirm payments.',
        'Technology providers who host or support the platform, under confidentiality obligations.',
        'Professional advisers, auditors, regulators, courts or law enforcement where the law requires or permits it.',
        'A buyer of our business, if we are ever merged or acquired, subject to the same protections described here.',
      ],
    },
    {
      heading: 'How long we keep your data',
      paragraphs: [
        'We keep account data for as long as your account is active. Order, payment and invoice records are kept for at least seven years to meet tax and accounting requirements. Support messages are kept for as long as needed to resolve the issue and handle any later dispute.',
        'When data is no longer needed it is deleted or anonymised.',
      ],
    },
    {
      heading: 'How we protect your data',
      paragraphs: [
        'Passwords are stored using one-way encryption. Sessions use signed tokens that expire automatically. Access to personal data inside the business is restricted by role. Payment card details are never stored on our systems.',
        'No system is perfectly secure. If a breach affecting your data occurs, we will notify the Office of the Data Protection Commissioner and affected users as the law requires.',
      ],
    },
    {
      heading: 'International transfers',
      paragraphs: [
        'Some of our technology providers may process data outside Kenya. Where this happens we take steps to ensure your data receives protection equivalent to that required under Kenyan law.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: ['Under the Data Protection Act, 2019 you have the right to:'],
      items: [
        'Be informed about how your data is used.',
        'Access the personal data we hold about you.',
        'Ask us to correct inaccurate or incomplete data.',
        'Ask us to delete your data, subject to records we must keep by law.',
        'Object to processing, including direct marketing, and withdraw consent.',
        'Receive your data in a portable format where applicable.',
      ],
    },
    {
      heading: 'How to exercise your rights or complain',
      paragraphs: [
        `Email ${SITE.supportEmail} with your request. We aim to respond within 30 days. If you are not satisfied with our response, you may lodge a complaint with the Office of the Data Protection Commissioner of Kenya.`,
      ],
    },
    {
      heading: 'Children',
      paragraphs: [
        `${SITE.name} is a business platform and is not intended for anyone under 18. We do not knowingly collect data from children.`,
      ],
    },
    {
      heading: 'Changes to this policy',
      paragraphs: [
        'We may update this policy as the platform or the law changes. The "last updated" date at the top shows the current version. Significant changes will be notified through the platform.',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════
// TERMS OF SERVICE
// ═════════════════════════════════════════════════════════════
export const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  intro: `These terms govern your use of ${SITE.name}, operated by ${SITE.legalName} (${SITE.registrationNumber}). By creating an account, placing an order or listing products you agree to them. If you do not agree, please do not use the platform.`,
  sections: [
    {
      heading: 'About the platform',
      paragraphs: [
        `${SITE.name} is a wholesale marketplace connecting buyers with suppliers across Kenya. Buyers purchase from ${SITE.name}, and suppliers sell through ${SITE.name}. All ordering, payment, communication and dispute handling happens on the platform.`,
      ],
    },
    {
      heading: 'Accounts',
      items: [
        'You must be at least 18 and able to enter a binding contract, or act on behalf of a business that is.',
        'You must give accurate information and keep it up to date, including your delivery county, which determines delivery pricing.',
        'You are responsible for keeping your password secure and for all activity on your account. Tell us immediately if you suspect unauthorised use.',
        'For security, your login session expires automatically and you will need to sign in again.',
        'We may suspend or close accounts that breach these terms, are used for fraud, or put other users at risk.',
      ],
    },
    {
      heading: 'Platform rules for everyone',
      paragraphs: [
        'Buyers and sellers must not contact each other, share contact details, or arrange transactions outside the platform. This includes placing phone numbers, social media handles or website links in product listings, images, reviews, screenshots or messages. Breaches may lead to suspension.',
        'You must not post unlawful, misleading or abusive content, attempt to interfere with the platform, or use it to commit fraud. Messages and reviews containing abusive language are blocked.',
      ],
    },
    {
      heading: 'Products, pricing and units',
      items: [
        'All prices are in Kenyan Shillings (KES) and include 16% VAT. VAT is shown separately on invoices and receipts.',
        'The price shown is for one full selling unit, such as a carton, bale or sack, not a single piece. Where available, we show an approximate per-piece figure for guidance only.',
        'Many products have a minimum order quantity. Orders below it cannot be placed.',
        'Sale and clearance prices apply only while the offer is active. The price confirmed at checkout is the price you pay, and it is recorded on your order.',
        'We make every effort to keep stock and descriptions accurate, but errors can occur. We may cancel an order affected by a clear pricing or stock error and will refund any payment in full.',
      ],
    },
    {
      heading: 'Placing an order',
      paragraphs: [
        'An order is a request to buy. It becomes binding once payment is confirmed. Stock is reserved when you place the order and returned if the order is cancelled or a delivery quote is rejected.',
      ],
    },
    {
      heading: 'Delivery',
      items: [
        'Standard goods are delivered for a flat fee based on your delivery county, shown at checkout.',
        'Heavy and bulk categories, including Hardware & Tools, Agriculture & Garden and Fabric & Textiles, require a delivery quote. We will send you a quote that you may approve or reject. If you reject it, the order is cancelled and stock is restored.',
        'Delivery times are estimates, not guarantees. We choose the courier or delivery method.',
        'Once your goods are handed to a courier, you may confirm receipt on the order page. If you do not respond within 5 days, delivery is treated as confirmed.',
        'You can tell us how goods should be handled (for example fragile or keep upright) using the options at checkout.',
      ],
    },
    {
      heading: 'Payment',
      paragraphs: [
        'We accept the payment methods shown at checkout, including M-Pesa. Orders are processed only after we confirm your payment. We do not store card details.',
        'Payments are held by us until delivery is confirmed and the dispute window has closed, then released to the supplier. Each order carries a single payment, so please pay the exact amount shown.',
      ],
    },
    {
      heading: 'Returns, refunds and disputes',
      paragraphs: [
        'Our returns approach depends on who is at fault. Full detail is on our Returns Policy page.',
      ],
      items: [
        'Wrong, damaged, defective or misdescribed goods: resolved at no cost to you, by replacement or refund.',
        'Change of mind or ordering the wrong option: buyer-paid where a return is offered at all. Bulk and wholesale-quantity listings are generally not returnable for change of mind.',
        'Clearance items are final sale, except where goods are wrong or damaged.',
        'Problems with one item in a multi-item order are resolved for that item only. The rest of the order is unaffected.',
        'You must report problems from the order page within 72 hours of delivery being confirmed.',
        'Refunds are paid back to the original payment method.',
      ],
    },
    {
      heading: 'Reviews',
      paragraphs: [
        'Only buyers who have received a product may review it, once per product. Reviews must be honest, courteous and free of contact details. We may remove reviews that break these rules.',
      ],
    },
    {
      heading: 'Terms for sellers',
      items: [
        'Becoming a seller requires an application and our approval. Your seller access is part of your normal account.',
        'You must list accurate products with genuine photos of your actual stock. Watermarks, contact details, screenshots from other platforms and AI-generated product images are not allowed.',
        'New listings are reviewed before going live. Changes to a live product image or category are re-reviewed. You control your own prices and stock.',
        'You must confirm handoff to a courier promptly after an order is paid, using the dashboard.',
        'We deduct a platform commission from each sale. Payouts are released after delivery is confirmed and the 72-hour dispute window has passed, to the M-Pesa number on your profile. Keep it accurate.',
        'If a delivery fault is confirmed, the value of the affected item may be deducted from your payout.',
        'You must not contact buyers. We may suspend your account, which removes your products from the storefront until reinstated.',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        `The ${SITE.name} name, logo, design and software belong to us. Sellers keep ownership of their product content but grant us a licence to display it on the platform. You must not copy or reuse platform content without permission.`,
      ],
    },
    {
      heading: 'Availability and liability',
      paragraphs: [
        'We work to keep the platform available but cannot guarantee uninterrupted service. To the fullest extent permitted by law, we are not liable for indirect or consequential loss, and our total liability for any claim relating to an order is limited to the value of that order. Nothing in these terms limits rights you have under the Consumer Protection Act, 2012 or any liability that cannot lawfully be limited.',
      ],
    },
    {
      heading: 'Changes to these terms',
      paragraphs: [
        'We may update these terms. The "last updated" date shows the current version, and continued use after a change means you accept it. Orders already placed remain subject to the terms in force when they were placed.',
      ],
    },
    {
      heading: 'Governing law and disputes',
      paragraphs: [
        'These terms are governed by the laws of Kenya. We encourage you to contact us first so we can resolve any complaint. Unresolved disputes are subject to the courts of Kenya.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [`${SITE.legalName}, ${SITE.location}. Email ${SITE.supportEmail}. Phone ${SITE.supportPhone}.`],
    },
  ],
};

// ═════════════════════════════════════════════════════════════
// COOKIE POLICY
// ═════════════════════════════════════════════════════════════
export const COOKIE_POLICY = {
  title: 'Cookie Policy',
  intro: `This policy explains how ${SITE.name} uses cookies and similar browser storage on your device. In plain terms: we store only what is needed to keep you signed in, keep your cart, and make browsing faster. We do not currently use advertising or tracking cookies.`,
  sections: [
    {
      heading: 'What cookies and browser storage are',
      paragraphs: [
        'Cookies are small files saved by your browser. Browser storage (such as local storage) works the same way and lets a website remember information on your device. We use both and refer to them together as "cookies" in this policy.',
      ],
    },
    {
      heading: 'What we store and why',
      paragraphs: ['Essential storage, without which the site cannot work:'],
      items: [
        'Login session: a secure token that keeps you signed in. It expires automatically (1 day for admin accounts, 3 days for sellers and 7 days for buyers).',
        'Shopping cart: the items you have added, so they are still there when you return.',
        'Checkout details: your delivery address and chosen options while you move through checkout.',
      ],
    },
    {
      heading: 'Preference storage',
      paragraphs: ['Storage that makes the site more convenient. You can clear it at any time:'],
      items: [
        'Recent searches, shown as suggestions in the search bar.',
        'Recently viewed products, so you can pick up where you left off.',
        'Interface choices, such as dismissed banners and notices.',
      ],
    },
    {
      heading: 'What we do not store',
      paragraphs: [
        'We never store card numbers, CVV codes or card expiry dates, in cookies or anywhere else. We do not use third-party advertising cookies and we do not sell data collected through cookies.',
      ],
    },
    {
      heading: 'Third-party services',
      paragraphs: [
        'Some features, such as embedded social links, may be provided by other companies who could set their own cookies once you interact with them. We do not control those cookies. Please check the relevant provider\'s policy.',
        'If we add analytics or similar tools in future, we will update this policy and ask for your consent where required.',
      ],
    },
    {
      heading: 'Managing cookies',
      paragraphs: [
        'You can clear or block cookies and site storage in your browser settings. Blocking essential storage will stop you from signing in and will empty your cart on each visit.',
      ],
    },
    {
      heading: 'Changes and contact',
      paragraphs: [
        `We may update this policy, and the "last updated" date shows the current version. Questions: ${SITE.supportEmail}.`,
      ],
    },
  ],
};