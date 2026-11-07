# ShopZone — Project Overview

## At a glance

| Field | Details |
| --- | --- |
| **Product** | B2B wholesale e-commerce platform |
| **Primary market** | Kenya, with Nairobi as its base |
| **Intended users** | Retailers, small businesses, hospitality buyers, institutions, bulk buyers |
| **Project stage** | Active development; evolving MVP |

## Purpose

ShopZone is intended to make wholesale purchasing easier to discover and manage online. A buyer can browse a structured catalogue, select products and quantities, place an order, and use an account to follow the purchasing process. The platform also provides tools for seller operations and administrators.

The central product principle is that **buyers transact through ShopZone**. Suppliers provide goods through the platform, while ShopZone presents the catalogue and manages the customer-facing experience. The project documentation specifies that customer-facing experiences should not reveal supplier identities or invite buyers and suppliers to transact outside the platform.

## Who uses it

- **Buyers** — Retailers, small businesses, hospitality and institutional buyers, and other customers purchasing wholesale quantities.
- **Sellers** — Approved suppliers who use seller-facing tools to view their ShopZone activity and handle supported fulfilment tasks.
- **Administrators** — Staff who manage listings, orders, users, seller status, payments, and customer enquiries.

## Typical use cases

1. A retailer browses categories or searches the catalogue, checks product and wholesale-unit information, and adds items to a cart.
2. A buyer signs in, enters shipping details, reviews the order, and follows the resulting order and payment record.
3. For eligible heavy or bulk orders, the platform supports a delivery-quote step that can be reviewed by the buyer.
4. An approved seller uses the seller dashboard for seller-side catalogue and order information, with buyer details protected by the platform's operating model.
5. An administrator reviews listings and seller activity, manages orders and payment records, and responds to enquiries.

## Implemented capability areas

### Buyer experience

The React application includes a homepage and product catalogue, category and brand entry points, search, featured and new-arrival sections, offers, product details, cart, account registration and sign-in, profile, wishlist, recently viewed items, notifications, checkout, and order views. Product pages include stock and pricing information; product reviews and review submission are represented in the application.

### Seller and administration

Seller application and status workflows, a seller dashboard, and seller order operations are present in the source. Administration screens cover products, orders, users, sellers, and enquiries; payment records and administrator-managed payment confirmation are also supported. The exact actions available to each role are enforced by backend authorization, not just by hiding frontend pages.

### Commerce and platform logic

The backend contains product, user, order, payment, enquiry, and notification models and APIs. Project notes describe server-side price checks at checkout, order-line price snapshots, stock handling, county-based shipping, delivery quotes for bulky orders, and platform commission/payout tracking. Authentication uses JWT, with bcryptjs password hashing in backend controllers.

## Technical architecture

ShopZone is a JavaScript full-stack application. The Vite-served React frontend communicates with an Express API; MongoDB documents are accessed through Mongoose. During development, Vite proxies `/api` and `/uploads` to the backend. Redux Toolkit holds frontend state, React Router maps screens, and the interface combines React Bootstrap with component-level CSS.

## Repository map

```text
ShopZone/
├── backend/
│   ├── config/          Backend configuration
│   ├── controllers/     API behavior and business logic
│   ├── data/            Product/user seed data and shipping rates
│   ├── middleware/      Authentication, role checks, sanitization, errors
│   ├── models/          Mongoose schemas
│   ├── routes/          User, product, order, payment, seller, upload, etc.
│   └── server.js        Express app, database connection, API startup
├── frontend/
│   ├── src/
│   │   ├── components/  Shared UI components
│   │   ├── data/        Categories, legal content, site configuration
│   │   ├── pages/       Buyer, seller, and admin screens
│   │   ├── redux/       Store and feature slices
│   │   └── utils/       Shared client helpers
│   └── vite.config.js   Dev server and API proxy
├── documentation/      Project brain, decisions, issues, and roadmaps
└── package.json        Root development scripts
```

## Development status and limits

The codebase and project notes describe an **active MVP under continued development**. Customer shopping, checkout, order handling, and initial seller/admin workflows are represented, but the repository should not be presented as a finished or production-hardened commerce service.

Current development caveats visible in the project configuration and roadmaps:

- Payment records and administrator confirmation exist; automated M-Pesa/Daraja integration is listed as future work.
- Product uploads use local development storage; managed storage is a production follow-up.
- The backend `test` script is a placeholder, so a backend automated test suite is not configured.
- Roadmaps continue to track interface, accessibility, validation, and operational improvements.

Before a production launch, review authorization and data privacy, payment and refund handling, uploads and backups, input validation, monitoring, and deployment configuration. The local setup is intended for development and evaluation.
