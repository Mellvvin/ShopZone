# SHOPZONE

## Platform Scalability & Feature Roadmap

Kenya B2B Wholesale Marketplace - Internal Strategy Document  
Prepared: June 23, 2026  
Current baseline: SESSION-012  
Status: Living roadmap  
Confidential

> Brand marker: ShopZone Scalability Roadmap - Markdown Edition. If this document is exported to DOCX or PDF, add the standard ShopZone footer/header treatment with page numbering, such as "ShopZone Scalability Roadmap - Page X of Y". Markdown itself has no stable page model, so page numbering is intentionally not hardcoded inside the body.

---

## 1. Purpose

This document replaces the earlier DOCX-only scalability roadmap with a Markdown roadmap that matches the current ShopZone project structure, current feature baseline, and current decision history.

The old roadmap was directionally useful, but it read more like notes than an operating reference. This version explains what each scalability area means, what exists today, what must happen next, what depends on what, and which rules cannot be violated as the platform grows.

ShopZone is not a generic marketplace. It is a private B2B wholesale commerce platform for Kenya. Buyers buy from ShopZone. Sellers supply through ShopZone. ShopZone owns the customer relationship, pricing presentation, delivery promise, dispute process, refund logic, and payout timing. That operating model is the foundation for every roadmap item below.

---

## 2. Current Product Baseline

### 2.1 What ShopZone Is Today

ShopZone is a full stack wholesale e-commerce platform based in Nairobi, Kenya. It serves retailers, small businesses, remote buyers, group buyers, hotel and hospitality buyers, institutions, and individual bulk buyers across all 47 Kenyan counties.

The platform is built around structured wholesale purchasing rather than casual one-item retail browsing. The current product already supports product browsing, cart, checkout, shipping, payment records, order tracking, profile management, seller applications, seller dashboard functions, admin review queues, enquiry handling, notifications, receipt viewing, and support issue reporting.

The current platform is still an MVP with substantial manual admin control, but the data model now has the core hooks required for scaling:

- Product ownership via `Product.seller`
- Seller state via `User.isSeller` and `User.sellerStatus`
- Product review state via `Product.status`
- Order payment linkage via `Order.paymentId`
- Payment history via the `Payment` model
- Enquiries and support reports via the `Enquiry` model
- In-app communication via the `Notification` model
- Delivery quote state on orders
- Payout release fields on orders
- Uploaded evidence paths stored on enquiries

### 2.2 Current Stack

| Layer | Current technology | Scaling note |
| --- | --- | --- |
| Frontend | React, Vite, Redux Toolkit, React Router, React Bootstrap, Axios | Suitable for MVP and early growth; later scale work should focus on bundle discipline, route-level splitting, API consistency, and tests. |
| Backend | Node.js, Express, CommonJS | The controller/model/route structure is clear and can scale through validation, service extraction where needed, and stronger tests. |
| Database | MongoDB with Mongoose | Good fit for current document-shaped commerce data; future scale needs indexing, pagination, audit logs, and careful write paths. |
| Auth | JWT in frontend state/local storage | Works for MVP; HTTP-only cookie auth is planned before production hardening. |
| Passwords | bcryptjs in controllers only | Permanent rule. Never move hashing into Mongoose pre-save hooks. |
| Uploads | Multer local uploads | Fine for development; Cloudinary or equivalent storage is required before production. |
| Payments | Manual Payment model; Daraja planned | Payment model is already the single source of truth. STK Push and B2C must plug into it rather than creating parallel payment paths. |
| Styling | Custom CSS, React Icons FA set | Preserve the brand system: Oxford Blue, Tan, Off-white, clean admin surfaces, cinematic content pages, working operational pages. |

### 2.3 Current Project Structure

The source structure is flat and deliberate. Page files live directly in `frontend/src/pages`; do not add page subfolders.

```text
frontend/src/
  components/
    CategoryBar/
    CategoryCards/
    ChatWidget/
    CheckoutSteps/
    ConfirmModal/
    DesktopDropdownMenu/
    Footer/
    Header/
    HeroBanner/
    MobileDrawer/
    NotificationBell/
    OfferCard/
    ProductCard/
    ReceiptModal/
    ScrollableTabBar/
    ScrollToTop/
    SearchBar/
    ShopZoneLogo/
    SkipLink/
    Toast/
  pages/
    AboutPage.jsx
    AdminEnquiriesPage.jsx
    AdminOrderListPage.jsx
    AdminProductEditPage.jsx
    AdminProductListPage.jsx
    AdminSellersPage.jsx
    AdminUserDetailPage.jsx
    AdminUserListPage.jsx
    BecomeSellerPage.jsx
    BrandsPage.jsx
    BulkOrdersPage.jsx
    CartPage.jsx
    ContactPage.jsx
    FAQPage.jsx
    FeaturedPage.jsx
    HomePage.jsx
    LoginPage.jsx
    NewArrivalsPage.jsx
    NotFoundPage.jsx
    OrderPage.jsx
    PaymentPage.jsx
    PlaceOrderPage.jsx
    ProductPage.jsx
    ProfilePage.jsx
    RegisterPage.jsx
    ReturnsPolicyPage.jsx
    SellerDashboardPage.jsx
    ShippingPage.jsx
    ShippingPolicyPage.jsx
    SpecialOffersPage.jsx
  redux/
    store.js
    slices/
      authSlice.js
      cartSlice.js
      productSlice.js
  utils/
    formatKES.js

backend/
  controllers/
    enquiryController.js
    notificationController.js
    orderController.js
    paymentController.js
    productController.js
    sellerController.js
    userController.js
  models/
    Enquiry.js
    Notification.js
    Order.js
    Payment.js
    Product.js
    User.js
  routes/
    enquiryRoutes.js
    notificationRoutes.js
    orderRoutes.js
    paymentRoutes.js
    productRoutes.js
    sellerRoutes.js
    uploadRoutes.js
    userRoutes.js
  middleware/
    authMiddleware.js
    errorMiddleware.js
  data/
    products.js
    shippingRates.js
    users.js
```

---

## 3. Non-Negotiable Scaling Principles

These rules matter more as the system scales, because a small leak or shortcut at MVP size becomes an expensive platform problem later.

### 3.1 ShopZone Is the Only Customer-Facing Seller

Customers must never see supplier identity, supplier contact details, supplier location, supplier cost pricing, raw seller identifiers, or direct seller communication channels. Sellers must never see customer contact details or communicate directly with customers through the platform.

Every growth feature must preserve this rule:

- RFQs must be blind.
- Seller order views must hide customer identity.
- Delivery flows must route through ShopZone.
- Notifications must come from ShopZone.
- Customer-facing trust signals must describe ShopZone verification, not named seller reputation.
- Disputes must be mediated by ShopZone.

### 3.2 Financial Logic Must Stay Traceable

The platform is already moving toward escrow, payouts, refunds, commissions, and Daraja automation. Scaling this safely requires one payment truth:

- The `Payment` model remains the single source of truth.
- `confirmPayment` remains the canonical payment confirmation path.
- One payment per order is the current policy.
- STK Push must confirm exact order amounts through backend callbacks.
- Buyer refunds must go back to the original payment method, not into platform credit or a wallet.
- Seller payouts must be calculated from seller-owned line items, not from whole order totals.

### 3.3 Orders Must Be Historical Snapshots

Existing orders must never silently change because a seller or admin later edits a product.

Already snapshotted:

- `priceAtPurchase`

Must be added next:

- `unitType`
- `itemsPerUnit`
- `weightPerUnit`

The next Step 11 build is important because wholesale clarity depends on knowing exactly what the buyer bought at the time of purchase. A future display must not live-lookup those values from the product document when rendering an old order.

### 3.4 Admin Approval Is for Public Trust, Not Busywork

Seller self-service should be allowed when the action is low-risk, reversible, auditable, and limited to the seller's own catalog or fulfillment data.

Admin approval is required when an action could:

- Publish new customer-facing listings
- Change public product identity in a misleading way
- Leak seller or customer information
- Affect existing orders
- Change payout or payment state
- Affect disputes or refunds
- Bypass delivery rules
- Create security or compliance risk

### 3.5 Backend Authorization Is the Real Wall

Frontend gates are useful for user experience, but backend middleware decides security. Any scalable feature must enforce role and ownership checks server-side.

Examples:

- `POST /api/enquiries` requires `protect`.
- Uploads require `protect`.
- Admin routes require admin middleware.
- Seller APIs require approved seller middleware.
- Sellers can only act on products/orders assigned to them.

---

## 4. Roadmap Phase Model

The roadmap is organized into six practical phases. The numbering is not a replacement for the existing Step 1-35 build order; it explains how those steps group into platform maturity.

| Phase | Name | Platform shape | Primary goal |
| --- | --- | --- | --- |
| Phase 0 | Current MVP foundation | Admin-led operations with seller and payment foundations in place | Stabilize the current system, close known issues, and prevent regressions. |
| Phase 1 | Operational hardening | Better admin queues, order snapshots, returns policy clarity, low-stock signals | Make current workflows reliable before adding more automation. |
| Phase 2 | Seller and catalogue maturity | Seller self-service, approval history, product audit trails, wholesale clarity | Let approved sellers operate efficiently without exposing them to buyers. |
| Phase 3 | RFQ, support, and dispute maturity | Manual RFQ, support tickets, line-item disputes, payout holds | Turn manual communication into structured platform workflows. |
| Phase 4 | Payment and logistics automation | Daraja STK/B2C, Cloudinary, email, validation, logistics service | Reduce manual admin work while preserving financial traceability. |
| Phase 5 | Scale and intelligence | Ranking, ads, analytics, reputation, bulk imports, localization, deployment | Prepare for larger catalog, more sellers, and multi-county operating scale. |

---

## 5. Immediate Execution Order

This is the current SESSION-012 execution order. It overrides older roadmap ordering where there is conflict.

| Order | Item | Why it matters now | Primary files likely involved |
| --- | --- | --- | --- |
| 1 | Wire `ScrollableTabBar` into `AdminProductListPage.jsx` | The component exists and is already used elsewhere, but the page that prompted the need still has the widest tab row. | `frontend/src/pages/AdminProductListPage.jsx` |
| 2 | Inspect `AdminUserDetailPage.jsx` for horizontal tab overflow | If it has a tab strip, it should follow the same reusable pattern. | `frontend/src/pages/AdminUserDetailPage.jsx` |
| 3 | Step 11 order item wholesale snapshots | `unitType`, `itemsPerUnit`, and `weightPerUnit` must be stored on order items at purchase time. | `backend/models/Order.js`, `backend/controllers/orderController.js` |
| 4 | Step 11 buyer sanity-check displays | Buyers need clear unit math on product, cart, order, and receipt views. | `ProductPage.jsx`, `CartPage.jsx`, `OrderPage.jsx`, `ReceiptModal.jsx` |
| 5 | Rewrite ReturnsPolicyPage around buyer-fault vs seller-fault | The policy decision is locked and must be visible before checkout. | `frontend/src/pages/ReturnsPolicyPage.jsx`, CSS if needed |
| 6 | Low-stock seller notifications | Sellers need a transactional alert when stock drops below 5 after order creation. | `orderController.js`, `Notification.js` usage |
| 7 | Product approval audit history | Admin needs status history and rejection reason history beyond a single feedback field. | `Product.js`, `productController.js`, admin pages |
| 8 | Support tickets and returns/disputes | Current enquiry support works, but full dispute lifecycle needs structure. | `Enquiry.js` or future Ticket model, admin/user order pages |
| 9 | Lightweight escrow and payout hold | Manual payout release exists; payout safety needs hold/dispute rules. | `Order.js`, `paymentController.js`, admin/seller pages |
| 10 | Daraja STK Push and B2C payouts/refunds | Automates exact payments, seller payouts, and buyer refunds through existing Payment architecture. | `Payment.js`, `paymentRoutes.js`, `paymentController.js` |
| 11 | Backend request validation | Controllers currently trust too much input. | All write routes/controllers |
| 12 | Forgot password and email infrastructure | Completes existing `/forgot-password` placeholders and enables outbound admin communication. | `User.js`, `userController.js`, frontend auth pages |
| 13 | Logistics-only pickup and consolidation service | New Step 35. Requires full scoping before code. | Likely `Enquiry.js`, admin quote flow, order-like quote acceptance |

---

## 6. Feature Scalability Matrix

| Feature area | Current state | Next maturity step | Scale target |
| --- | --- | --- | --- |
| Product catalog | Products have seller, brand, wholesale fields, status, tags, sale flags, images | Add approval audit history and wholesale unit display/snapshots | Large catalog with import tools, ranking, fair rotation, quality signals |
| Seller onboarding | Seller applications upsert user profiles; admin approves/rejects/suspends | Better audit trail and seller profile completeness checks | Seller verification pipeline with document review and risk flags |
| Seller dashboard | Product submission, image upload, stock confirmation, profile, payout info | Better order/payout visibility and low-stock alerts | Self-service catalog and fulfillment operations under privacy rules |
| Orders | Checkout, stock decrement, Tier 2 quote flow, receipt modal, support report link | Snapshot wholesale unit fields and add admin order detail page | Order splitting, consolidation, structured fulfillment statuses |
| Delivery | County flat rates plus Tier 2 quote-required categories | Improve quote handling and logistics-only request model | Courier API quotes, hub consolidation, route-level optimization |
| Payments | Manual payment records and confirmation through Payment model | Stronger validation, exact amount rules, UI clarity | Daraja STK Push, B2C payouts, B2C refunds, audit-ready reconciliation |
| Payouts | Manual release flag, seller earnings concept | Payout hold rules and dispute blocking | Automated B2C payouts after delivery/dispute window |
| Refunds | Decision locked; not fully implemented | Refund to original payment method only | Daraja B2C refund workflow tied to line-item dispute decisions |
| Enquiries/support | Enquiry model with support type, order links, attachments, admin detail panel | Full ticket/dispute lifecycle | SLA, evidence review, outcomes, refund/replacement records |
| Notifications | Bell, transactional/promotional type, links, read/read-all | Low-stock and richer admin/user events | Unified notification plus email communication layer |
| Admin operations | Product, order, user, seller, enquiry pages | Scrollable tabs, admin order detail, audit histories | Operational cockpit with queues, metrics, escalation workflows |
| Search/ranking | Product search, brand filter, featured/new arrivals pages | Pagination and filter hardening | Hybrid ranking, fair visibility rotation, sponsored placement |
| Uploads | Local Multer storage, protected upload route | Validate file type/size consistently | Cloudinary, metadata stripping, moderation support |
| Security | JWT, protected routes, admin/seller gates | Request validation and ObjectId validation | HTTP-only cookies, CSRF-aware flows, audit logging |
| Documentation | Strong session docs and project brain | Keep roadmap and brain synced to actual state | README, frontend docs, deployment docs, runbooks |

---

## 7. Detailed Scalability Areas

### 7.1 Product Catalog and Wholesale Clarity

Current state:

The Product model already supports more than simple retail data. It includes brand, seller, unit type, minimum order quantity, item count per unit, weight per unit, dimensions, bulk-only flag, lead time, tags, featured/sale/clearance flags, status, and admin feedback.

The weak point is display clarity. Buyers need to understand what the price actually buys: a carton, bale, sack, box, roll, pack, or other sellable wholesale unit. The locked decision is that product price always represents one full sellable unit. There is no stored per-piece price field. Per-piece value is computed only at render time.

Next step:

Add `unitType`, `itemsPerUnit`, and `weightPerUnit` to `orderItemSchema`, then snapshot them during order creation at the same moment `priceAtPurchase` is set. After that, display computed unit math on ProductPage, CartPage, OrderPage, and ReceiptModal.

Scale target:

The catalog should support:

- Tiered wholesale pricing
- MOQ enforcement
- Bulk-only products
- Accurate line-item weight for delivery logic
- Seller-owned stock updates
- Admin-visible product audit history
- Import tooling for large product batches
- Search filters based on unit type, MOQ, category, stock, lead time, brand, and sale state

Risks:

- Never display supplier identity.
- Never use live product data to render historical order unit information.
- Never let sellers publish new public listings without admin approval.

### 7.2 Seller Operations

Current state:

Sellers are upgraded buyer accounts, not separate identities. Seller applications flow through `POST /api/enquiries` with type `seller_application`, then the backend upserts the User document with seller fields. Admin approves, rejects, suspends, or reinstates sellers. Approved sellers can access SellerDashboardPage and submit products for review.

Known scaling need:

Seller operations need better auditability. The current product status/admin feedback model is a good MVP, but it does not preserve a full history of status changes, rejection reasons, admin overrides, or seller resubmissions.

Next step:

Build product approval audit history. Store each status transition with:

- Previous status
- New status
- Admin actor
- Timestamp
- Reason or feedback
- Whether the change was seller-submitted or admin-overridden

Scale target:

The seller dashboard eventually becomes the operating console for:

- Product submissions
- Stock updates
- Price updates for eligible products
- Lead-time updates
- Delivery quote submissions
- Payout tracking
- Fulfillment status responses
- ShopZone-only messages

Privacy boundary:

Seller-facing orders should expose only fulfillment-safe information. The seller can know what they need to fulfill and broad delivery context, but not buyer name, phone, email, full address, or direct communication channels.

### 7.3 Orders, Receipts, and Fulfillment

Current state:

Orders support checkout, server-side price verification, atomic stock decrement, shipping calculation, Tier 2 quote-required state, stock restoration on cancellation/rejected delivery quote, payment linkage, receipt display, and support issue reporting.

Session 011 fixed a critical Tier 2 bug: detection must run against `verifiedOrderItems` with database categories, not raw frontend cart items. This rule must never be broken.

Next step:

Order item snapshots need wholesale unit fields. Then customer-facing pages must explain the unit calculation consistently.

Scale target:

Order handling eventually needs:

- Expanded customer-visible statuses
- Internal fulfillment statuses
- Admin order detail page
- Seller fulfillment views
- Split supplier logic where one checkout may involve multiple sellers behind the scenes
- Consolidation logic where ShopZone coordinates delivery without exposing suppliers
- Receipt/invoice generation with KRA/VAT breakdown

Important distinction:

Customer-facing order experience remains one ShopZone order. Internal fulfillment can split by seller, warehouse, or courier later, but the buyer should still experience ShopZone as the accountable seller.

### 7.4 Delivery and Logistics

Current state:

ShopZone supports county-based flat rates for standard goods and Tier 2 quote-required delivery for Hardware & Tools, Agriculture & Garden, and Fabric & Textiles. Admin sends delivery quotes; buyers approve or reject; stock is restored if a quote is rejected.

Next step:

Keep Tier 2 reliable while adding richer order detail, dispute linkage, and future logistics-only requests. The new Step 35 requires full scoping before code.

Step 35 concept:

Logistics-only pickup and consolidation service means a buyer may ask ShopZone to collect goods from one or more places and deliver/consolidate them without necessarily buying those goods through the public product catalog. This should still follow the golden rule: ShopZone coordinates the work; the platform should not expose supplier/customer contact details casually.

Likely fields for future scoping:

- Request type: `logistics_request`
- Pickup locations or pickup stop descriptions
- Destination county and address
- Item descriptions
- Estimated weight/volume
- Preferred pickup date
- Handling requirements
- Admin cost estimate
- ShopZone margin
- Quote status
- Buyer approval/rejection

Scale target:

Delivery can mature into:

- Live courier quotes
- ShopZone delivery zones
- Multi-stop pickup coordination
- Hub consolidation
- Route planning
- Courier performance tracking

Rejected pattern:

Buyer-selected couriers that directly coordinate with sellers or reveal seller location are not allowed.

### 7.5 Payments, Payouts, Refunds, and Escrow

Current state:

The Payment model exists and links to orders. `confirmPayment` is the canonical confirmation path. Manual M-Pesa, bank transfer, cash, and future STK Push belong in the same Payment model. One payment per order is enforced.

Session 012 locked several financial rules:

- Refunds return to the original payment method.
- No platform credit or stored buyer wallet balance.
- Multi-item disputes are resolved at line-item level.
- Seller payouts are reduced only by the affected line item when seller fault is confirmed.

Next step:

Build payout hold and dispute-blocking logic before automating payouts. Add backend request validation before exposing payment flows to broader usage.

Scale target:

Daraja integration should cover:

- STK Push for buyer payment collection
- Callback-based payment confirmation
- B2C payout to seller M-Pesa numbers
- B2C refunds to buyer original payment method
- Clear payment failure, timeout, duplicate, and pending states

Important compliance note:

ShopZone should not create withdrawable buyer balances. That moves the product toward stored-value wallet behavior and regulatory complexity. Refund money should move back out to the original payment method instead.

### 7.6 Support, Returns, and Disputes

Current state:

OrderPage includes a Report Issue form that posts support enquiries with `orderId`, message, and attachments. ProfilePage links users directly to `OrderPage#report`. AdminEnquiriesPage has a Support tab, related-order cards, and attachment previews.

Next step:

Rewrite ReturnsPolicyPage so buyer-fault and seller-fault returns are visible before checkout:

- Defective, wrong, or damaged-in-transit item: free to buyer.
- Change of mind: buyer-paid where eligible.
- Bulk/wholesale-only items may be non-returnable for change-of-mind cases.
- Multi-item disputes affect only the disputed line item.

Scale target:

The support system should become a ticket/dispute module with:

- Ticket status
- Linked order and linked line item
- Evidence uploads
- Admin notes
- Seller fault/buyer fault/outcome fields
- Refund/replacement decision
- Payout hold integration
- Timeline of actions
- User-visible resolution state

### 7.7 Notifications and Communication

Current state:

Notifications are live with read/read-all behavior and frontend navigation links. Existing event coverage includes order placed, quote sent, quote rejected/cancelled, delivered, payout released, payment confirmed, and product status change notifications.

Next step:

Add low-stock seller notifications when stock falls below 5 after order creation. Use the existing try/catch pattern so notification failure never breaks the order operation.

Scale target:

The communication layer should eventually include:

- Admin-to-user composer
- In-app notification plus email
- Branded ShopZone email templates
- Support ticket replies
- RFQ quote emails with approve/reject action links
- Seller approval messages
- Tier 2 delivery quote communication

Rule:

Communication always comes from ShopZone. No buyer-seller direct channel.

### 7.8 Search, Ranking, Ads, and Discovery

Current state:

Search covers product name, category, description, tags, and brand. BrandsPage uses `/api/products/brands`. NewArrivalsPage and FeaturedPage exist as working pages.

Scale target:

Search should evolve into hybrid ranking:

- Relevance first
- Availability second
- Trust/reliability third
- Fair visibility rotation for newer eligible sellers
- Clearly labelled sponsored placements

Suggested first-page mix from prior decision history:

- 6 strong organic results
- 2 rotating eligible sellers
- 1 new seller discovery slot
- 1 clearly labelled sponsored result

Customer-facing trust signals must describe ShopZone-level quality:

- Verified by ShopZone
- Fast fulfillment
- Bulk ready
- High stock confidence
- Quality checked
- Sponsored

Never expose named seller ratings or seller identities to buyers.

### 7.9 Admin Operations

Current state:

Admin pages exist for products, product edit, orders, users, sellers, user detail, and enquiries. The design system is established: white header, tan icon, count pills, colored tabs, search, tables, badges, and full-width breakout from the App container.

Next step:

Finish ScrollableTabBar wiring and build a dedicated admin order detail page. AdminOrderListPage currently routes View actions to the customer-facing OrderPage, which is not enough for operations.

Scale target:

Admin should eventually have a true operations cockpit:

- Pending product reviews
- Delivery quotes needed
- Payment review queue
- Payout release queue
- Open disputes
- Seller risk flags
- Low-stock alerts
- RFQ sourcing queue
- Logistics requests
- Support tickets

### 7.10 Uploads and Media

Current state:

Uploads are handled by Multer and local storage. Upload route is protected. Seller product images and enquiry screenshots use the route.

Next step:

Keep current local uploads for development, but add consistent upload validation before production:

- File type
- File size
- File count
- Path sanitation
- Auth checks

Scale target:

Move to Cloudinary or equivalent storage:

- Durable production storage
- Remote image URLs
- Metadata stripping
- Potential moderation support
- Easier deployment

Special care:

Seller-uploaded product images must be reviewed for phone numbers, WhatsApp handles, watermarks, shop signs, invoices, competitor branding, and AI-generated renders.

### 7.11 Security, Validation, and Reliability

Current state:

Auth middleware exists. Admin and seller protections exist. The central error middleware exists. But request body validation is not yet systematic.

Next step:

Step 23 should add validation with Joi or express-validator. Prioritize write endpoints and ObjectId params.

Validation scope:

- Registration
- Login
- Profile update
- Seller application
- Product create/update
- Seller product submission
- Order creation
- Payment creation/confirmation/update
- Delivery quote actions
- Enquiry/support creation
- Review creation
- Uploads

Scale target:

Reliability improves through:

- Validation
- Tests
- Indexes
- Pagination
- Audit logs
- Idempotency for payment callbacks
- Consistent error responses

### 7.12 Documentation and Developer Operations

Current state:

The project has strong session history, a project brain, decision log, active roadmap, backend documentation, and this scalability roadmap.

Weak point:

Some docs are not perfectly synced. `01_PROJECT_BRAIN.md` still contains older references to ISS-004/ISS-005 as open even though Session 012 closed them. This is a documentation drift problem, not necessarily a code problem.

Scale target:

Documentation should become easier to maintain:

- Project Brain: compact current truth
- Decision Log: append-only decisions
- Scalability Roadmap: strategy and dependency map
- Session Docs: full historical record
- README: how a developer runs the project
- Frontend docs: page/component/API/styling guide
- Deployment docs: environment variables and production setup

---

## 8. Dependency Map

Some features must wait for others because they depend on data structure or workflow safety.

| Feature | Must happen first | Reason |
| --- | --- | --- |
| Unit clarity on receipts | Order item snapshots | Receipts must show historical purchase truth, not live product values. |
| Full disputes | Support ticket structure and line-item outcome fields | Disputes need structured outcomes, evidence, and payout impact. |
| Escrow/payout hold | Dispute lifecycle | Payout release should know whether an order has unresolved disputes. |
| Daraja B2C payouts | Payout hold rules and seller M-Pesa data | Automation should not release money that may need to be held. |
| Daraja refunds | Refund outcome model | Refunds need a clear order/line item reason and original payment method. |
| Admin communication layer | Email infrastructure | In-app notifications exist; outbound email needs provider setup. |
| Sponsored placement | Ranking/filtering foundation | Ads must not corrupt search quality or buyer trust. |
| Bulk imports | Validation and approval workflow | Imports can create many bad records quickly if validation is weak. |
| Cloudinary moderation | Cloudinary migration | Image moderation depends on provider-level storage and tooling. |
| HTTP-only cookie auth | Stable auth flows and API client update | This touches every protected frontend request. |

---

## 9. Current Open Issues

This list reflects Session 012 rather than older Markdown files.

| ID | Priority | Description |
| --- | --- | --- |
| ISS-006 | Medium | Low-stock notifications are not wired into `createOrder`. Notify the product's assigned seller when stock drops below 5 after decrement. |
| ISS-008 | Medium | Corrupted characters remain in several files. Needs a dedicated cleanup pass. |
| ISS-009 | Medium | No dedicated admin order detail page. Admin View still uses customer-facing OrderPage. |
| ISS-010 | Low | Accessibility and structure cleanup remains: MobileDrawer closed state, ShopZoneLogo inline styles, App container squeeze on some pages. |
| ISS-011 | Medium | AdminProductListPage still needs `ScrollableTabBar`. |
| ISS-012 | Low | AdminUserDetailPage needs inspection for possible `ScrollableTabBar` use. |
| ISS-013 | High | Step 11 is now business-critical: snapshot wholesale unit fields and display unit sanity checks. |
| ISS-014 | Medium | ReturnsPolicyPage must be rewritten around buyer-fault vs seller-fault return responsibility. |

---

## 10. Long-Term Step Roadmap

This keeps the older Step 1-35 roadmap shape but updates the descriptions so each step has a clearer purpose.

| Step | Name | Status | Purpose |
| --- | --- | --- | --- |
| 1 | Clean corrupted characters | Open | Remove mojibake from source and visible UI to prevent copy-paste spread. |
| 2 | Accessibility hardening | Partial | Tighten drawer semantics, focus states, logo styling, and container layout issues. |
| 3 | Core content pages and links | Done | FAQ, Contact, Become Seller, Shipping Policy, Returns Policy, Brands, Bulk Orders, About. |
| 4 | Seller role and middleware | Done | Approved seller role and route protection. |
| 5 | Seller dashboard | Done | Seller product submissions, images, profile, orders, and payout visibility. |
| 6 | Seller approval system | Done | Admin approve/reject/suspend/reinstate flow. |
| 7 | Admin seller management and product approval | Partial | Needs full product status audit history and rejection reason history. |
| 8 | Manual RFQ flow | Planned | Admin-brokered quote requests with final ShopZone quote to buyer. |
| 9 | Automated blind RFQ | Planned | Seller bidding without exposing buyers or sellers to each other. |
| 10 | Tiered wholesale pricing | Planned | Volume pricing ranges and tier snapshots at order time. |
| 11 | Bulk units, MOQ, wholesale clarity | Immediate | Snapshot unit fields and show clear sellable-unit math. |
| 12 | Wishlist and saved procurement list | Planned | Saved buying lists and future RFQ conversion. |
| 13 | Buyer profile enrichment | Planned | Buyer type, procurement habits, delivery preferences, admin trust notes. |
| 14 | Order status expansion | Planned | More customer and internal fulfillment statuses. |
| 15 | Support tickets and dispute system | Planned | Full ticket lifecycle, evidence, line-item outcomes, payout impact. |
| 16 | Lightweight escrow and payout hold | Planned | Hold payout until delivery/dispute conditions are satisfied. |
| 17 | Filtering, sorting, ranking, pagination, sponsored | Planned | Scalable discovery and fair seller visibility. |
| 18 | Bulk Excel product upload | Planned | Admin import first, seller import later under approval. |
| 19 | Seller reputation system | Planned | Internal reliability metrics and seller improvement guidance. |
| 20 | M-Pesa STK Push and B2C | Planned | Buyer STK Push, seller payouts, buyer refunds through Daraja. |
| 21 | Deposits and partial payment decision | Planned | Structured staged payments if business needs justify complexity. |
| 22 | Cloudinary image storage | Planned | Production-safe media storage and image handling. |
| 23 | Backend request validation | Planned | Consistent 400 responses and safer controller inputs. |
| 24 | Forgot password and email infrastructure | Planned | Reset flow and outbound communication foundation. |
| 25 | Invoice generation | Planned | KRA/VAT-aware downloadable invoices. |
| 26 | HTTP-only cookie auth | Planned | Stronger auth storage before production. |
| 27 | Ad management | Planned | Sponsored placements after ranking rules are built. |
| 28 | Swahili language option | Planned | Customer-facing localization after copy stabilizes. |
| 29 | Tests | Planned | Backend and frontend coverage for critical flows. |
| 30 | Build, lint, quality scripts | Planned | One-command quality checks from root. |
| 31 | README | Planned | Developer onboarding and setup guide. |
| 32 | Deployment and environment configuration | Planned | Production CORS, env docs, hosting decisions. |
| 33 | Frontend documentation | Planned | Page/component/redux/styling guide. |
| 34 | TypeScript migration | Post-deployment | Only after JS version is stable and tested. |
| 35 | Logistics-only pickup and consolidation | New planned | Quote-based logistics service using ShopZone-controlled coordination. |

---

## 11. What "Scale-Ready" Means for ShopZone

ShopZone is scale-ready when the platform can handle more buyers, more sellers, more products, and more disputes without relying on memory, manual spreadsheet logic, or hidden admin knowledge.

The practical definition:

- Every financial action has a model record.
- Every public product change has an audit trail.
- Every order item preserves historical purchase facts.
- Every support issue links to a user and, where relevant, an order and line item.
- Every payout can be blocked, released, or adjusted based on structured rules.
- Every seller action is limited by ownership and privacy boundaries.
- Every buyer-facing page presents ShopZone as the accountable seller.
- Every important admin queue has counts, filters, search, and clear next actions.
- Every uploaded file is authenticated, validated, and stored durably.
- Every high-risk write endpoint validates inputs before touching the database.

---

## 12. Maintenance Rules for This Roadmap

Update this Markdown file when:

- A roadmap step is completed.
- A new non-negotiable decision affects scaling.
- A data model changes in a way future features depend on.
- A feature is postponed for a specific dependency reason.
- A new operational risk is discovered.
- A session summary closes or reopens an issue listed here.

Do not use this file as a raw session transcript. Session docs preserve history. This roadmap should stay strategic, current, and readable.

When a DOCX/PDF version is needed, export this Markdown and add the ShopZone branded page header/footer treatment at export time rather than hardcoding page counts here.

