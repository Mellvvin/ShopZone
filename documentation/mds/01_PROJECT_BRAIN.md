# ShopZone — Project Brain
> **Paste this entire document at the start of every Claude session.**
> Last updated: June 23, 2026 | Current baseline: SESSION-012 + documentation sync

---

## What ShopZone Is

ShopZone is a B2B wholesale e-commerce platform based in Nairobi, Kenya. It connects retailers, small businesses, remote buyers, group buyers, hotel and hospitality buyers, institutions, and individual bulk buyers to structured supply chains across all 47 Kenyan counties.

**The business model:** Customers buy from ShopZone. Suppliers sell through ShopZone. ShopZone is the face of every transaction — buyers see ShopZone as the seller, not the individual supplier behind the product.

---

## The Golden Rule — Non-Negotiable, No Exceptions

> All transactions and communication go exclusively through ShopZone. Customers never contact sellers. Sellers never contact customers. Supplier identity, contact details, location, and cost pricing are **never** exposed to customers at any point on any page or in any feature. ShopZone is the sole intermediary for every interaction.

Any feature that could create a channel for direct contact — buyer-selected couriers, seller chat, WhatsApp integration, supplier names in delivery notifications — must be rejected or redesigned to keep ShopZone as the only intermediary. This rule has no exceptions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + MongoDB + Mongoose |
| Auth | JWT + bcryptjs — hashing in controllers only, never in pre-save hooks |
| File uploads | Multer — local storage in development, Cloudinary planned (Step 22) |
| Module system | CommonJS throughout backend |
| Frontend | React + Vite + Redux Toolkit + React Bootstrap + Axios |
| Icons | React Icons — `react-icons/fa` set only. ChatWidget avatar emoji is the only exception |
| Styling | Custom CSS only |
| Dev ports | Backend: 5000 — Frontend: 5173 |
| Project path | `C:\Users\User\OneDrive\Desktop\ecommerce-platform` |
| Dev command | `npm run dev` from root (uses concurrently) |

### Colours

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Oxford Blue | `#002147` | `var(--oxford-blue)` | Headers, heroes, table headers, buttons, nav |
| Tan | `#D2B48C` | `var(--tan)` | Accent, interactive highlights, eyebrow pills, icon colour |
| Off-white | `#FAF8F5` | `var(--off-white)` | Global background, form inputs, card backgrounds |

---

## Non-Negotiable Technical Rules

These rules exist because past violations caused real bugs. Every rule is permanent unless a specific decision reversal is logged in the Decision Log.

1. **Cart ID field** — `item.product` is the MongoDB product ID field on cart items. Never change this to `item._id` or anything else. Every cart handler, order creation function, and price verification check depends on it.
2. **Password hashing** — Always done in controllers (`userController.js`). Never add a pre-save hook to `User.js`. The bcryptjs UMD build conflicts with Mongoose middleware parameter names.
3. **VAT** — Inclusive in all prices. Extract as `price * 16 / 116` when you need to show VAT separately. Never add VAT on top of displayed prices.
4. **Price formatting** — Always use `formatKES()` from `frontend/src/utils/formatKES.js`. Never recreate `toLocaleString('en-KE', { minimumFractionDigits: 2 })` inline.
5. **Redux after profile save** — Always `dispatch(setCredentials(data))`. Never `dispatch(login.fulfilled(...))` manually.
6. **isSeller and sellerStatus** — Must be included in all four user controller responses: login, register, getProfile, updateProfile.
7. **Notification type enum** — Only `transactional` or `promotional`. Adding any other value without first updating the Notification model enum throws a silent Mongoose validation error and the notification is not saved.
8. **County field** — Always a `<select>` populated with the 47-county COUNTIES array. Never a free text input. County drives delivery rate lookups — free text breaks shipping calculations.
9. **Admin pages layout** — Never use the App.jsx Bootstrap Container on admin pages. Use negative margin breakout: `margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); width: 100vw`.
10. **Admin count pills** — The summary count pills on AdminOrderListPage (Total Orders, Quotes Needed, Payout Ready) must always be kept. They can be made smaller but never removed.
11. **Notification route order** — `read-all` route must be registered before `/:id/read` in `notificationRoutes.js`. Express would match the string "read-all" as a MongoDB ObjectId and crash otherwise.
12. **User full-profile route order** — `GET /api/users/:id/full-profile` must be registered before `GET /api/users/:id` in `userRoutes.js`. Same Express routing reason.
13. **Anonymous enquiries** — `POST /api/enquiries` requires the `protect` middleware. No anonymous submissions. The frontend login gate is a courtesy redirect — the backend is the real wall.
14. **userId on writes** — `userId` must be attached to every write action: orders, enquiries, payments, notifications, reviews. Never put it on a URL.
15. **Payment model** — Single source of truth for all payment activity. STK Push, manual M-Pesa, bank transfer, and cash all create and update the same Payment document. The `confirmPayment` function in `paymentController.js` is the canonical confirmation path. Step 20 Daraja callback must call this same function.
16. **Payment route order** — Order-scoped payment routes (`POST /order/:orderId`, `GET /order/:orderId`) must be registered before `/:id` in `paymentRoutes.js`.
17. **Seller product status** — All seller-submitted products always start with `status: 'submitted'`. Admin must explicitly change status to `'approved'` before the product appears publicly. `getProducts` filters to `{ status: 'approved' }` by default.
18. **One payment per order** — `createPayment` checks for an existing record before creating. Duplicate payments on the same order are rejected. This is a deliberate policy decision.
19. **Page file locations** — All page files are FLAT in `frontend/src/pages/`. Never create subfolders. Every page JSX file and its CSS file sit directly in that folder.
20. **Component CSS** — Every component has its own CSS file in its own folder. `index.css` is for globals and CSS variable declarations only.
21. **No inline styles** — Zero `style={{}}` props in JSX except genuine Bootstrap override situations and dynamic accent colour values passed as component props. The pre-React splash screen in `index.html` is the one documented exception.
22. **display:contents** — The `display:contents` approach on product card Link wrappers is intentional for layout. Never revert it.
23. **overflow-x** — `overflow-x: clip` on html and body. Never change to `hidden`. Clip was the fix that made `position:sticky` work on the condensed header.
24. **Toast and inline alerts** — Both fire together on every error and success event. Toast does NOT replace inline alerts.
25. **Legacy unit field** — The legacy `unit` field on Product only accepts 7 values: Per Unit, Bale, Carton, Dozen, Kg, Box, Sack. Use `Per Unit` as fallback for anything outside these 7.
26. **Seeder** — Never run `seeder.js` on a database with real data. It wipes everything.
27. **isAdmin** — Must be set manually in MongoDB after admin registration. The register endpoint never sets it.
28. **businessType enum** — Valid values are `Retailer`, `Wholesaler`, `Distributor`, `Other`, and `''`. Never write `'business'` to `businessType`. The MongoSH correction `db.users.updateMany({ businessType: 'business' }, { $set: { businessType: '' } })` is a standing, idempotent remedy for old corrupted records.
29. **Tier 2 detection source** — Tier 2 delivery detection must run against `verifiedOrderItems` after database products have been fetched. Never run Tier 2 checks against raw `req.body.orderItems`, because cart items do not carry reliable category data.
30. **Seller earnings** — Seller earnings must be calculated from order line items filtered to that seller's product IDs. Never calculate seller revenue or payout from the whole `order.totalPrice`.
31. **Refunds** — Buyer refunds return to the original payment method. Never create platform credit or a stored buyer wallet balance for real refunded money.
32. **Disputes** — Multi-item order disputes are resolved at line-item level. One defective, wrong, or damaged item never triggers a refund or return of the entire order.
33. **Product price unit** — Product price represents one full sellable unit as defined by `unitType`. Do not store a separate per-piece price field; compute per-piece value at render time only.
34. **Order item unit snapshots** — `unitType`, `itemsPerUnit`, and `weightPerUnit` must be snapshotted onto every order item at the same time as `priceAtPurchase`. Historical order and receipt displays must not live-lookup these values from the Product document.

---

## How Instructions Must Be Delivered (Tell Claude This Every Session)

- Every fix shows exact existing code under **"Find this in full/file/path:"** then replacement under **"Replace with:"** — never show only new code
- Always state the full file path on every single find/replace block — every time, no exceptions
- Never create files using file creation tools — always write in a copyable code block
- Always explain what a file does and what is changing before showing code
- Be direct — no filler, no over-explanation
- When I say "lets continue" just continue without re-summarising
- No bullet points in conversational replies — plain prose only
- All code must be fully commented — file header always, function comments where needed
- Every new feature or decision must be added to the build steps immediately
- Always warn when approaching token limit
- If something can be implemented now, implement it — no silent deferrals without a step number and reason
- Every response with code changes must end with a testing checklist
- When I say "give me the session doc" generate a full replacement session document in SESSION format

---

## Design System

### Page Type Rules

**Cinematic pages — static/rarely-visited only**
Applied to: About, FAQ, Become a Seller, Shipping Policy, Returns Policy, BulkOrders.
Features: Oxford Blue hero with floating particle dots animating upward, large semi-transparent background orbs with drift animation, typewriter effect on hero accent line (runs once on mount, never repeats), white stats strip with four metrics counting up from zero via IntersectionObserver (fires once only), scroll reveal on all sections (opacity 0 + translateY(24px), triggers once), animated accordion, Oxford Blue CTA strip at the bottom of every page.

**Working pages — interactive/frequently-used**
Applied to: BrandsPage, NewArrivalsPage, FeaturedPage, product listings, SpecialOffersPage, cart, checkout, profile.
Features: Simple Oxford Blue hero strip (no particles, no typewriter, no orbs), tabs or filter controls directly below hero, clean product/content grid, no scroll reveal on individual cards.

**Eyebrow pill pattern** (working pages): `inline-flex`, Tan text, uppercase, `letter-spacing: 0.1em`, `border: 1px solid rgba(210,180,140,0.3)`, `padding: 4px 12px`, `border-radius: 999px`.

**Admin pages gold standard**
Reference implementations: AdminOrderListPage and AdminEnquiriesPage.
Pattern: White header section with Tan icon + bold title + grey subtitle + right-side count pills (amber for pending/warning, green for good/complete, red for urgent, Oxford Blue for neutral). Coloured tab bar with coloured count badges. Search bar on every list page. Oxford Blue table header with Tan column text. Alternating row shading. Colour-coded status badges. Full-width own layout via negative margin breakout. Never use App.jsx Bootstrap Container.

---

## Current Folder Structure

```
frontend/src/
  components/
    Header/                   Header.jsx + Header.css
    SearchBar/                SearchBar.jsx + SearchSuggestions.jsx + SearchSuggestions.css
    CategoryBar/
    DesktopDropdownMenu/
    MobileDrawer/
    ShopZoneLogo/
    Footer/
    ChatWidget/
    Toast/
    HeroBanner/
    CategoryCards/
    CheckoutSteps/
    ConfirmModal/
    ScrollToTop/
    SkipLink/
    ProductCard/              ProductCard.jsx + SkeletonCard.jsx + ProductCard.css
    OfferCard/                OfferCard.jsx + OfferCard.css
    NotificationBell/         NotificationBell.jsx + NotificationBell.css
    ReceiptModal/             ReceiptModal.jsx + ReceiptModal.css
    ScrollableTabBar/         ScrollableTabBar.jsx + ScrollableTabBar.css
  pages/                      ALL FLAT — no subfolders ever
    HomePage + .css
    ProductPage + .css
    CartPage + .css
    LoginPage + .css
    RegisterPage + .css
    ShippingPage + .css
    PaymentPage + .css
    PlaceOrderPage + .css
    OrderPage + .css
    ProfilePage + .css
    NotFoundPage + .css
    AdminProductListPage + .css
    AdminProductEditPage + .css
    AdminOrderListPage + .css
    AdminUserListPage + .css
    AdminEnquiriesPage + .css
    AdminSellersPage + .css
    AdminUserDetailPage + .css
    SellerDashboardPage + .css
    SpecialOffersPage + .css
    FAQPage + .css
    ContactPage + .css
    BecomeSellerPage + .css
    ShippingPolicyPage + .css
    ReturnsPolicyPage + .css
    BrandsPage + .css
    BulkOrdersPage + .css
    AboutPage + .css
    NewArrivalsPage + .css
    FeaturedPage + .css
  utils/
    formatKES.js
  redux/
    store.js
    slices/
      productSlice.js
      authSlice.js
      cartSlice.js
  App.jsx
  main.jsx
  index.css

backend/
  controllers/
    userController.js
    productController.js
    orderController.js
    enquiryController.js
    notificationController.js
    paymentController.js
    sellerController.js
  models/
    User.js
    Product.js
    Order.js
    Enquiry.js
    Notification.js
    Payment.js
  middleware/
    authMiddleware.js
    errorMiddleware.js
  routes/
    userRoutes.js             /api/users — full-profile route BEFORE /:id
    productRoutes.js          /api/products — optionalAuth on GET /
    orderRoutes.js
    uploadRoutes.js           requires protect middleware
    enquiryRoutes.js          requires protect middleware on POST /
    notificationRoutes.js     read-all route BEFORE /:id/read
    paymentRoutes.js          order/:orderId routes BEFORE /:id
    sellerRoutes.js
  data/
    users.js
    products.js
    shippingRates.js
  seeder.js
  server.js
  .env
```

---

## Current Routes

| Route | Page | Status |
|-------|------|--------|
| `/` | HomePage | ✅ Live |
| `/product/:id` | ProductPage — verified purchase reviews, profanity filter | ✅ Live |
| `/cart` | CartPage — checkout redirects to /login with state.from | ✅ Live |
| `/login` | LoginPage — reads location.state.from for redirect, forgot password link | ✅ Live |
| `/register` | RegisterPage | ✅ Live |
| `/offers` | SpecialOffersPage | ✅ Live |
| `/shipping` | ShippingPage — pre-fills from saved profile | ✅ Live |
| `/payment` | PaymentPage | ✅ Live |
| `/placeorder` | PlaceOrderPage | ✅ Live |
| `/order/:id` | OrderPage — receipt modal, report issue form with screenshot upload, #report hash auto-expand | ✅ Live |
| `/profile` | ProfilePage — Report Issue link in My Orders tab | ✅ Live |
| `/admin/products` | AdminProductListPage — status tabs ADDED | ✅ Live |
| `/admin/product/:id/edit` | AdminProductEditPage — seller assignment + status dropdown | ✅ Live |
| `/admin/orders` | AdminOrderListPage | ✅ Live |
| `/admin/users` | AdminUserListPage | ✅ Live |
| `/admin/enquiries` | AdminEnquiriesPage — Support tab, related order card, attachment previews | ✅ Live |
| `/admin/sellers` | AdminSellersPage | ✅ Live |
| `/admin/users/:id` | AdminUserDetailPage — full aggregated profile | ✅ Live |
| `/seller/dashboard` | SellerDashboardPage — image upload now working | ✅ Live |
| `/faq` | FAQPage | ✅ Live |
| `/contact` | ContactPage — login gate + auth header | ✅ Live |
| `/become-seller` | BecomeSellerPage — all fields, user document upsert | ✅ Live |
| `/shipping-policy` | ShippingPolicyPage | ✅ Live |
| `/returns-policy` | ReturnsPolicyPage | ✅ Live |
| `/brands` | BrandsPage — A-Z brand directory | ✅ Live |
| `/bulk-orders` | BulkOrdersPage — login gate + auth header | ✅ Live |
| `/about` | AboutPage | ✅ Live |
| `/new-arrivals` | NewArrivalsPage | ✅ Live |
| `/featured` | FeaturedPage | ✅ Live |
| `/forgot-password` | NOT BUILT — Step 24 placeholder, link present on LoginPage | ⏳ Planned |
| `/categories` | NOT BUILT — future step | ⏳ Planned |

---

## What Is Built and Working

### Backend
- Full order system with atomic stock checks/decrements and stock restoration on cancellation or rejected delivery quote
- County-based shipping calculated server-side from 47-county lookup table in `shippingRates.js`
- Tier 2 delivery quote flow for Hardware & Tools, Agriculture & Garden, Fabric & Textiles — admin sends quote, buyer approves or rejects, stock restored on rejection
- Platform commission tracking, VAT-inclusive pricing (`price * 16 / 116`), server-side price verification at checkout
- `priceAtPurchase` snapshot on all order items — later product price changes never affect historical orders
- JWT auth, bcryptjs in controllers, central error middleware
- Product search across name, category, description, tags, and brand
- User model with: `shippingAddress` sub-document, `isSeller`, `sellerStatus` (none/pending/approved/suspended/rejected), `sellerProfile` (businessName, businessAddress, description, kraPin, mpesaNumber), `sellerApprovedAt`, `sellerSuspendedAt`
- Product model with: `brand`, `seller` (ref User), `unitType`, `minimumOrderQuantity`, `itemsPerUnit`, `weightPerUnit`, `dimensions`, `isBulkOnly`, `leadTimeDays`, `tags`, `isFeatured`, `isOnSale`, `isClearance`, `salePrice`, `status` (draft/submitted/needs_changes/approved/rejected/archived), `adminFeedback`
- All 66 existing products backfilled to `status: 'approved'` via MongoDB Compass on June 12, 2026 — one-time operation, complete
- `getProducts` filters to `{ status: 'approved' }` by default; `optionalAuth` middleware on `GET /api/products` lets admin see all statuses
- Notification model with: `userId`, `type` (transactional/promotional), `title`, `message`, `link`, `isRead`, `relatedOrderId`, `relatedEnquiryId`
- Five order event notifications wired in `orderController`: placed, quote sent, quote rejected/cancelled, delivered, payout released
- Payment notification in `paymentController`: payment confirmed to buyer
- Product status change notifications in `productController`: fires to `product.seller` whenever admin changes status
- Enquiry model with: `type`, `name`, `email`, `phone`, `business`, `message`, `data`, `status`, `userId`, `orderId`, `attachments`, `resolvedAt`, `resolvedBy`
- `POST /api/enquiries` requires `protect` — no anonymous submissions; profanity filtered via `leo-profanity`
- `seller_application` enquiries immediately upsert the User document with all seller profile fields
- Enquiry attachments are stored as uploaded URL/path strings. ContactPage, BulkOrdersPage, BecomeSellerPage, and OrderPage support up to three optional uploaded images for evidence/reference.
- Payment model with: `orderId`, `userId`, `method` (mpesa_stk/mpesa_manual/bank_transfer/cash/other), `status` (pending/confirmed/failed/disputed/refunded), `amount`, `mpesaReceiptNumber`, `rawMessage`, `reference`, `confirmedBy`, `confirmedAt`, `stkCheckoutRequestId`, `stkResultCode`, `stkResultDesc`, `notes`
- `confirmPayment` five-step sequence: update Payment → mark Order.isPaid → set Order.paidAt → link Order.paymentId → advance Order.status → create buyer Notification
- `Order.paymentId` field links every order back to its Payment document
- `POST /api/seller/products` creates products with `status: 'submitted'` and `seller: req.user._id`
- `GET /api/users/:id/full-profile` — admin-only aggregation running five Promise.all queries: user document, all orders where user matches, all products where seller matches, all enquiries where userId matches, 50 most recent notifications where userId matches
- `/api/products/brands` — returns distinct brand names with product counts, excludes empty strings
- `/api/stats` — returns `totalOrdersFulfilled`, `totalApprovedSellers`, `totalProducts`, `totalCategories`, `countiesServed` (47 static), `totalBulkEnquiries`
- `PUT /api/users/:id/seller-status` — admin approve/reject/suspend/reinstate
- Verified purchase check in `createProductReview`: queries for delivered order containing product before allowing review
- Seller self-review block: checks `product.seller` against `req.user._id`
- Profanity filter on both `createProductReview` and `createEnquiry` via `leo-profanity`
- `uploadRoutes.js` now requires `protect` — anonymous image uploads rejected

### Frontend — Customer-Facing
- Full cart with quantity controls, MOQ enforcement pending (Step 11)
- Checkout: Shipping (pre-fills from saved profile) → Payment → Place Order → Order confirmation
- OrderPage: receipt modal (ReceiptModal component, printable, shows items/VAT/delivery/payment details), Report Issue form (pre-fills order ID, supports screenshot upload, posts to `/api/enquiries` with `type: 'support'`, `orderId`, and optional `attachments`), `#report` hash auto-expands the form
- ProfilePage: avatar zone with initials, account type badge, member since, order stats row, collapsible Delivery Info, Security section with `/forgot-password` placeholder, Report Issue link beside every non-cancelled order in My Orders tab
- ProductPage: verified purchase gate (frontend shows "Verified purchases only" message if no qualifying delivered order; backend independently enforces), review list visible, profanity error message on rejection
- NotificationBell: polls every 60 seconds, uses `notif.link` for navigation with `relatedOrderId` fallback, mark one/all read, renders null when logged out
- Login gates on: ContactPage, BulkOrdersPage, BecomeSellerPage, CartPage checkout, ProductPage review form — all redirect to `/login` with `state: { from: location.pathname }`
- LoginPage reads `location.state?.from`, falls back to `?redirect=` query param, then falls back to `/`
- BrandsPage: real A-Z brand directory, sticky letter navigation, live search, product counts from `/api/products/brands`, clicking brand navigates to `/?brand=BrandName`
- NewArrivalsPage at `/new-arrivals` — working page, dispatches `listProducts({ sort: 'newest' })` with no limit
- FeaturedPage at `/featured` — working page, dispatches `listProducts({ featured: true })` with no limit
- All cinematic content pages: FAQ, Contact, Become a Seller, Shipping Policy, Returns Policy, Bulk Orders, About. ContactPage, BulkOrdersPage, and BecomeSellerPage now support optional screenshot/reference uploads on their enquiry forms.
- `formatKES` utility at `frontend/src/utils/formatKES.js`
- Branded splash screen in `index.html` (documented exception to no-inline-styles rule)

### Frontend — Admin
- All admin pages use gold standard design system
- AdminProductListPage: tabs (All / Awaiting Review / Needs Changes / Rejected / Archived / Featured / On Sale / Clearance / Out of Stock), amber Awaiting Review count pill in header, Status column with coloured badges
- AdminProductEditPage: seller assignment dropdown (fetches approved sellers from `/api/users?isSeller=true`), product status dropdown, admin feedback textarea (appears when status is needs_changes or rejected)
- AdminOrderListPage: 5 tabs, summary count pills (keep always), search bar, send delivery quote modal, mark delivered modal, release payout, tab row wrapped with ScrollableTabBar
- AdminEnquiriesPage: All/Unread/Support/Bulk Orders/Seller Applications/Contact/General type tabs (Unread powered by backend `?status=new`), status filter, resolved filter, search bar, side detail panel, admin notes, related order card for support enquiries, attachment thumbnails, tab row wrapped with ScrollableTabBar
- AdminUserListPage: tabs (All/Customers/Admins), count pills, search, clicking row goes to `/admin/users/:id`
- AdminSellersPage: tabs (Pending/Approved/Suspended/Rejected), count pills, search, approve/reject/suspend/reinstate with ConfirmModal, clicking row goes to `/admin/users/:id`
- AdminUserDetailPage: account info card, seller profile card with action buttons, orders as buyer table with View links, products as seller table with Edit links, expandable enquiry rows with full message/admin notes, notifications with View Order links

### Frontend — Seller
- SellerDashboardPage: 4 tabs (Overview, My Products, My Orders, My Profile)
- My Products: product submission form with all wholesale fields, **image upload with preview**, photography tip panel, stock confirmation checkbox (both required), Review Status badges (Awaiting Review/Changes Requested/Live/Rejected), admin feedback shown under Changes Requested badge
- My Orders: table with inline Tier 2 quote form (amount, courier dropdown, estimated days — amount capped at 3x zone base rate server-side)
- My Profile: account summary cards (products, orders, pending orders, payouts released), payout info strip (M-Pesa number status, KRA PIN status, seller status), editable business profile fields, save button
- Complete seller application flow: BecomeSellerPage (with auth header) → POST `/api/enquiries` type `seller_application` → `enquiryController` upserts User document + sets sellerStatus to pending → appears on AdminSellersPage Pending tab → admin approves → seller logs out and back in → seller dashboard accessible

---

## Open Issues Summary (see Issues & Blockers for full detail)

| ID | Priority | Title |
|----|----------|-------|
| ISS-006 | MEDIUM | Low stock notifications not wired in createOrder after stock decrement |
| ISS-008 | MEDIUM | Corrupted characters in multiple files (Step 1) |
| ISS-009 | MEDIUM | No dedicated admin order detail page — View goes to customer-facing OrderPage |
| ISS-010 | LOW | Accessibility/layout debt: MobileDrawer closed state, ShopZoneLogo inline styles, App container squeezing some full-width pages |
| ISS-011 | MEDIUM | AdminProductListPage still needs ScrollableTabBar |
| ISS-012 | LOW | AdminUserDetailPage needs inspection for possible ScrollableTabBar use |
| ISS-013 | HIGH | Step 11 wholesale unit snapshots and sanity-check displays |
| ISS-014 | MEDIUM | ReturnsPolicyPage needs buyer-fault vs seller-fault rewrite |

---

## Build Order Going Forward

1. **ISS-011** — Wire ScrollableTabBar into AdminProductListPage
2. **ISS-012** — Inspect AdminUserDetailPage and wire ScrollableTabBar if it has a horizontal tab strip
3. **ISS-013 / Step 11** — Add `unitType`, `itemsPerUnit`, and `weightPerUnit` to order item snapshots; then display wholesale unit sanity checks on ProductPage, CartPage, OrderPage, and ReceiptModal
4. **ISS-014** — Rewrite ReturnsPolicyPage around buyer-fault vs seller-fault responsibility
5. **ISS-006** — Low stock notifications in `createOrder`
6. **Step 7** — Admin product approval workflow (full audit history, rejection reason history, admin overrides)
7. **Step 15** — Support tickets and returns/dispute flow from My Orders
8. **Step 16** — Lightweight escrow and payout hold UI
9. **Step 20** — M-Pesa STK Push and B2C payouts/refunds via Safaricom Daraja, plugged into the existing Payment model
10. **Step 23** — Backend request validation (Joi or express-validator)
11. **Step 24** — Forgot password and email infrastructure
12. **Step 35** — Logistics-only pickup and consolidation service, scoped before coding
13. **Step 22** — Cloudinary image storage (replacing local Multer uploads)

---

## Roadmap at a Glance (Steps 1–34)

| Step | Title | Priority | Status |
|------|-------|----------|--------|
| 1 | Clean corrupted characters | High | ⚠️ Open |
| 2 | Accessibility hardening | High | ⚠️ Partial |
| 3 | Fix dead links + content pages | High | ✅ Done |
| 4 | Seller role and middleware | High | ✅ Done |
| 5 | Seller dashboard | High | ✅ Done |
| 6 | Seller approval system | High | ✅ Done |
| 7 | Admin seller management + product approval | High | ⚠️ Partial |
| 8 | Manual RFQ flow | High | ⏳ Planned |
| 9 | Automated blind RFQ with supplier bidding | Medium | ⏳ Planned |
| 10 | Tiered wholesale pricing | High | ⏳ Planned |
| 11 | Bulk units, MOQ, product detail wholesale clarity | High | ⚠️ Immediate |
| 12 | Wishlist and saved procurement list | Medium | ⏳ Planned |
| 13 | Buyer profile enrichment | Medium | ⏳ Planned |
| 14 | Order status expansion | Medium | ⏳ Planned |
| 15 | Support tickets and dispute system | High | ⏳ Planned |
| 16 | Lightweight escrow and payout hold | High | ⏳ Planned |
| 17 | Filtering, sorting, ranking, pagination, sponsored | Medium | ⏳ Planned |
| 18 | Bulk Excel product upload | Medium | ⏳ Planned |
| 19 | Seller reputation system | Medium | ⏳ Planned |
| 20 | M-Pesa STK Push | High | ⏳ Planned |
| 21 | Deposits, partial payments, bank transfer | Medium | ⏳ Planned |
| 22 | Cloudinary image storage | Medium | ⏳ Planned |
| 23 | Backend request validation | High | ⏳ Planned |
| 24 | Forgot password + email infrastructure | Medium | ⏳ Planned |
| 25 | Invoice generation with KRA/VAT breakdown | Medium | ⏳ Planned |
| 26 | HTTP-only cookie auth | Medium | ⏳ Planned |
| 27 | Ad management system | Low | ⏳ Planned |
| 28 | Swahili language option | Low | ⏳ Planned |
| 29 | Tests | High | ⏳ Planned |
| 30 | Build, lint, quality scripts | Medium | ⏳ Planned |
| 31 | README | Medium | ⏳ Planned |
| 32 | Deployment and environment configuration | Medium | ⏳ Planned |
| 33 | Frontend documentation | Medium | ⏳ Planned |
| 34 | TypeScript migration | Low | ⏳ Post-deployment |
| 35 | Logistics-only pickup and consolidation service | Medium | ⏳ Planned |

---

## Recently Completed Since SESSION-010

- **SESSION-011:** Fixed Tier 2 delivery quote detection by moving checks to `verifiedOrderItems`; fixed/stabilised the `businessType: 'business'` validation issue as a stored-data repair; clarified seller earnings must be calculated from seller-owned line items.
- **SESSION-012:** Closed ISS-004 and ISS-005 by adding enquiry attachments, screenshot uploads on ContactPage/BulkOrdersPage/BecomeSellerPage/OrderPage, AdminEnquiries Support tab, related order card, and attachment previews. Added shared ScrollableTabBar and wired it into AdminEnquiriesPage, AdminOrderListPage, AdminSellersPage, AdminUserListPage, and SpecialOffersPage.
- **Documentation sync on June 23, 2026:** Added `documentation/mds/ShopZone_Scalability_Roadmap.md`, a current Markdown scalability roadmap aligned to SESSION-012 and the live project structure. The original DOCX roadmap remains untouched.
