// frontend/src/data/legalContent.js
// ─────────────────────────────────────────────────────────────
// PLACEHOLDER legal text for development. Not legal advice —
// have a Kenyan lawyer review before launch. Each document is
// { title, intro, sections: [{ heading, paragraphs[] }] } so the
// LegalDocument component can render any of them.
// ─────────────────────────────────────────────────────────────
import { SITE } from './siteConfig';

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  intro: `${SITE.name} is a wholesale marketplace based in ${SITE.location}. This policy explains what personal data we collect, why, and the choices you have.`,
  sections: [
    {
      heading: 'Information we collect',
      paragraphs: [
        'Account details: name, email, phone number, business name and delivery address.',
        'Order details: items ordered, amounts, payment method and delivery status. We do not store card numbers, CVV or expiry dates.',
        'Usage data: pages viewed, products viewed and search activity, used to improve the platform.',
      ],
    },
    {
      heading: 'How we use your information',
      paragraphs: [
        'To process orders, arrange delivery, confirm payments and provide support.',
        'To send order updates and, only if you allow it, promotional messages.',
        'To prevent fraud and keep the platform safe.',
      ],
    },
    {
      heading: 'How suppliers are involved',
      paragraphs: [
        `All transactions go through ${SITE.name}. Suppliers only receive the information needed to prepare an order. They never receive your name, phone number or full address.`,
      ],
    },
    {
      heading: 'Sharing and storage',
      paragraphs: [
        'We do not sell your personal data. We share it only with delivery and payment partners as needed to complete your order, or where the law requires it.',
        'Data is kept for as long as your account is active and as required for tax and accounting records.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        `Under the Kenya Data Protection Act, 2019 you may ask to access, correct or delete your data, or object to its processing. Contact ${SITE.supportEmail}.`,
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [`Questions about this policy: ${SITE.supportEmail}.`],
    },
  ],
};

export const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  intro: `By creating an account or placing an order on ${SITE.name} you agree to these terms.`,
  sections: [
    {
      heading: 'Using the platform',
      paragraphs: [
        'You must provide accurate information and keep your login details secure. You are responsible for activity on your account.',
        'Buyers and sellers must not attempt to contact or transact with each other outside the platform.',
      ],
    },
    {
      heading: 'Orders and pricing',
      paragraphs: [
        'Prices are in Kenyan Shillings and include 16% VAT. Prices show the full unit (for example a carton), not individual pieces.',
        'Some heavy or bulk categories require a delivery quote, which you may approve or reject before the order proceeds.',
      ],
    },
    {
      heading: 'Payment',
      paragraphs: [
        'Orders are processed once payment is confirmed. Funds are held until delivery is confirmed and the dispute window has passed.',
      ],
    },
    {
      heading: 'Delivery, returns and refunds',
      paragraphs: [
        'Faulty, wrong or damaged goods are resolved at no cost to you. Change-of-mind returns are buyer-paid or not available on bulk listings. Clearance items are final sale except for wrong or damaged goods.',
        'Refunds are returned to the original payment method.',
      ],
    },
    {
      heading: 'Sellers',
      paragraphs: [
        'Sellers must list accurate products and photos, fulfil orders promptly, and keep contact details out of listings. Accounts may be suspended for breaches.',
      ],
    },
    {
      heading: 'Limitation and changes',
      paragraphs: [
        'We may update these terms; continued use means you accept the changes. To the extent permitted by law, our liability is limited to the value of the affected order.',
        'These terms are governed by the laws of Kenya.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [`Questions: ${SITE.supportEmail}.`],
    },
  ],
};

export const COOKIE_POLICY = {
  title: 'Cookie Policy',
  intro: `${SITE.name} uses cookies and similar browser storage to keep the site working and to remember your choices.`,
  sections: [
    {
      heading: 'What we store',
      paragraphs: [
        'Essential: your login session, shopping cart and checkout details, without which the site cannot work.',
        'Preferences: recent searches and viewed products to make browsing faster.',
      ],
    },
    {
      heading: 'Analytics and advertising',
      paragraphs: [
        'We do not currently use third-party advertising cookies. If analytics tools are added later, this policy will be updated and consent requested where required.',
      ],
    },
    {
      heading: 'Your choices',
      paragraphs: [
        'You can clear or block cookies in your browser settings. Blocking essential storage will stop login and the cart from working.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [`Questions: ${SITE.supportEmail}.`],
    },
  ],
};