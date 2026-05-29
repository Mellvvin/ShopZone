# ShopZone — Master Project Document
> Last updated from conversation history. Add missing early chat transcripts to fill gaps marked [NEEDS CHAT HISTORY].
> Every section is marked: ✅ Done | 🔄 In Progress | ⏳ Planned | 🔴 Blocked | 💬 Decided-not-yet-built

---

## 1. What ShopZone Is

ShopZone is a B2B wholesale e-commerce platform for the Kenyan market, based in Nairobi. It serves retailers, small business owners, shop owners, market traders, hotel and hospitality buyers, institutions, group buyers, and individual bulk buyers across all 47 counties in Kenya.

**Core operating principle:** ShopZone is the face of every transaction. Buyers see ShopZone as the seller. Suppliers operate privately behind the platform. Customer identity is never exposed to sellers. Supplier identity, contact details, location, and pricing are never exposed to customers. This private supply chain model is non-negotiable and must be enforced at the backend level — not just on the frontend.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs (in controllers only — no pre-save hooks), Multer |
| Frontend | React, Vite, Redux Toolkit, React Bootstrap, Axios, React Icons (fa set only) |
| Styling | Custom CSS — Oxford Blue `#002147`, Tan `#D2B48C`, Off-white `#FAF8F5` |
| Module system | CommonJS throughout |
| Dev server | concurrently from root — backend port 5000, frontend port 5173 |
| Project path | `C:\Users\User\OneDrive\Desktop\ecommerce-platform` |

---

## 3. Non-Negotiable Rules (Must Never Change)

1. All transactions and communication go through ShopZone exclusively. No feature may expose supplier identity, contact details, location, cost prices, or direct seller identifiers to customers.
2. Sellers may never contact customers directly through the platform.
3. Cart items must use `item.product` as the MongoDB ID field — changing this breaks the cart throughout the codebase.
4. Password hashing stays in controllers. No pre-save hook on `User.js` ever.
5. VAT is inclusive. Extract as `price * 16 / 116`. Never add VAT on top of displayed prices.
6. All prices display in KES using `toLocaleString('en-KE', { minimumFractionDigits: 2 })`.
7. All icons use `react-icons/fa`. The only exception is the ChatWidget avatar emoji — intentional, never change it.
8. Zero inline `style={{}}` props in JSX. Exceptions: genuine Bootstrap override situations and dynamic accent colour values passed as props.
9. Every component has its own CSS file in its own folder. `index.css` is for globals and variables only.
10. The `display:contents` approach on product card Link wrappers is intentional for layout. Never revert.
11. Backend authorisation is the real security boundary. Frontend route hiding is supplementary only.
12. Seller self-service is the default for low-risk operations. Admin approval is reserved for actions affecting buyer safety, existing orders, public trust, security, supplier privacy, payouts, or disputes.
13. Existing orders must never be silently changed by later seller edits. Orders snapshot `priceAtPurchase`.
14. Sellers may set KES 0.00 prices on their own eligible products if it does not violate buyer-safety, fraud, content, payment, or platform rules.

---

## 4. Coding and Instruction Format Rules

These apply to every code change given in chat. Breaking these rules is not acceptable.

- Every fix must show exact existing code first under **"Find this:"** and replacement under **"Replace with:"** — never show only the new code.
- Never create files using file creation tools — always write code in a copyable code block so it can be pasted manually.
- Always explain what a file does and what is changing before showing any code.
- Be direct — no filler sentences, no over-explanation, no restating what was just said.
- When the developer says "lets continue" just continue without re-summarising.
- No bullet points or heavy formatting in conversational replies — plain prose only.
- All code must be fully commented. Every file needs a header comment explaining what it does. Functions that need explanation get inline comments. This is used as documentation.
- Summaries must be very descriptive — no detail left behind. Fixes, discussions, changes, workflow decisions all included.
- Every time a new feature or decision is made in chat it must be added to the steps/workflow immediately.

---

## 5. Design System

### Cinematic design system (static/rarely-visited pages only)
Applied to: About Us, FAQ, Become a Seller, Shipping Policy, Returns Policy, and any future static content page.

Components:
- Oxford Blue hero with floating particle dots animating upward
- Large semi-transparent background orbs with drift animation
- Typewriter effect on hero accent line — runs once on mount, never repeats
- Trust/feature badges as pill-shaped elements below subtitle
- SVG illustration on right side of split grid layout — hidden on mobile
- White stats strip with four metrics counting up from zero once on first viewport entry via IntersectionObserver — never repeats
- Scroll reveal on all sections — opacity 0 + translateY(24px), transitions in on intersection, triggers once
- Timeline sections use Oxford Blue backgrounds
- Promise and highlight cards use Oxford Blue
- FAQ sections use animated accordion with max-height transitions — only one item open at a time
- Every page ends with Oxford Blue CTA strip with decorative shape orb
- Interactive accent elements always use `var(--tan)` or `var(--tan-dark)`
- Section eyebrow labels are pill-shaped with tan border and tan text

### Working page design (frequently-used interactive pages)
Reference: SpecialOffersPage is the gold standard example.
Applied to: BrandsPage product grid, BulkOrders form, product listings, cart, checkout, admin pages, profile.

Components:
- Simple Oxford Blue hero strip (no particles, no typewriter, no orbs)
- Tabs or filter controls directly below hero
- Clean product/content grid
- No scroll reveal on individual cards — it slows interaction
- Focus is on content and conversion, not presentation

**Decision (confirmed in chat):** Not all pages should look the same. Cinematic only on static pages. Working pages follow the SpecialOffersPage pattern. This rule must be applied going forward.

---

## 6. Current Folder Structure

```
frontend/src/
  components/
    Header/ | SearchBar/ | CategoryBar/ | DesktopDropdownMenu/
    MobileDrawer/ | ShopZoneLogo/ | Footer/ | ChatWidget/
    Toast/ | HeroBanner/ | CategoryCards/ | CheckoutSteps/
    ConfirmModal/ | ScrollToTop/ | SkipLink/
  pages/
    HomePage | ProductPage | CartPage | LoginPage | RegisterPage
    ShippingPage | PaymentPage | PlaceOrderPage | OrderPage
    ProfilePage | NotFoundPage | AdminProductListPage
    AdminProductEditPage | AdminOrderListPage | AdminUserListPage
    SpecialOffersPage | FAQPage | ContactPage | BecomeSellerPage
    ShippingPolicyPage | ReturnsPolicyPage | BrandsPage
    BulkOrdersPage [NEW - built this session]
  redux/store.js | slices/productSlice.js | authSlice.js | cartSlice.js
  App.jsx | main.jsx | index.css

backend/
  controllers/ userController | productController | orderController
  models/ User | Product | Order
  middleware/ authMiddleware | errorMiddleware
  routes/ userRoutes | productRoutes | orderRoutes | uploadRoutes
  data/ users.js | products.js | shippingRates.js
  seeder.js | server.js | .env
```

---

## 7. Current Routes in App.jsx

```
/ → HomePage
/product/:id → ProductPage
/cart → CartPage
/login → LoginPage
/register → RegisterPage
/offers → SpecialOffersPage
/shipping → ShippingPage
/payment → PaymentPage
/placeorder → PlaceOrderPage
/order/:id → OrderPage
/profile → ProfilePage
/admin/products → AdminProductListPage
/admin/product/:id/edit → AdminProductEditPage
/admin/orders → AdminOrderListPage
/admin/users → AdminUserListPage
/faq → FAQPage
/contact → ContactPage
/become-seller → BecomeSellerPage
/shipping-policy → ShippingPolicyPage
/returns-policy → ReturnsPolicyPage
/brands → BrandsPage
/bulk-orders → BulkOrdersPage [NEW - needs route added to App.jsx]
/about → [NOT BUILT YET - links go nowhere]
* → NotFoundPage
```

---

## 8. What Is Built and Working ✅

### Backend
- Full order system with atomic stock management
- Stock decremented at order creation, restored on cancellation or rejected delivery quote
- County-based shipping calculated server-side
- Tier 2 delivery quote flow for bulk/heavy orders — quotes sent, buyer approve/reject
- Seller quote fields on orders
- Platform commission tracking
- VAT-inclusive pricing — extracted as `price * 16 / 116`
- Server-side price verification at checkout prevents frontend tampering
- `priceAtPurchase` snapshot on order items — later price changes never affect historical orders
- JWT authentication, bcrypt password hashing in controllers
- Central error middleware
- Product search across name, category, description, and tags

### Frontend — customer-facing
- Homepage: animated hero banner, particles, typewriter "Stock Smarter. Grow Faster.", stats strip, category cards, featured products, deals banner, new arrivals, product cards with Add to Cart and stepper
- Search and category filtering
- SpecialOffersPage at `/offers` — sale and clearance items, tabs, discount badges
- Product detail page with reviews
- Full cart with quantity controls
- Checkout flow: Shipping → Payment → Place Order → Order confirmation
- Profile page with order history
- Header with desktop and mobile layouts
- CategoryBar second navbar (desktop only)
- MobileDrawer (mobile only) with full navigation
- ChatWidget with rule-based conversation brain — delivery, payments, products, returns, seller enquiries

### Frontend — admin
- Admin product list
- Admin product edit (tags, featured, sale, clearance, sale price, unit, stock, image, category, description)
- Admin order list with Tier 2 quote handling
- Admin user list

### Frontend — content pages (cinematic design system)
- FAQPage `/faq` — search, category tabs, animated accordion, scroll reveals
- ContactPage `/contact` — topic cards, split form layout, contact info panel, office hours
- BecomeSellerPage `/become-seller` — full cinematic, typewriter, particles, pain point cards, stats strip, 5-step timeline, benefits grid, seller type cards, promise cards, application form
- ShippingPolicyPage `/shipping-policy` — animated truck SVG, rate grid, weight examples, timeline, FAQ accordion
- ReturnsPolicyPage `/returns-policy` — shield SVG, coverage grid, timeline, buyer protection, FAQ accordion
- BulkOrdersPage `/bulk-orders` — [NEW THIS SESSION] enquiry form, 4-step process, trust cards, stats strip, CTA

### Accessibility (audit complete — Lighthouse score 95 on May 25, 2026)
- Toast system: split into polite and assertive aria-live regions
- MobileDrawer: full focus trap, focus restoration on close, Escape key, role="dialog", aria-modal
- ConfirmModal: focuses cancel button on open
- Product cards: no role="button" conflict, Link with display:contents wrapping image and info, cart row outside link
- Footer headings changed from h6 to p — fixes heading order violation
- All Lighthouse contrast failures fixed across Footer, HomePage, HeroBanner
- SkipLink component added at top of App.jsx, id="main-content" on main tag
- Cart badge announces quantity changes via visually hidden aria-live region
- Header desktop dropdown restores focus to hamburger button on close
- Page titles set via useEffect on every page

### Dead links wired
- Footer: Become a Seller → /become-seller, FAQ → /faq, category spans → real Link to /?category=
- MobileDrawer: FAQ → /faq, Become a Seller → /become-seller, Deals → /offers

---

## 9. Fixes Applied This Session 🔄

| Fix | File | Status |
|-----|------|--------|
| MobileDrawer Contact Support mailto → navigate to /contact | MobileDrawer.jsx | ✅ Code given |
| MobileDrawer Bulk Orders → navigate to /bulk-orders | MobileDrawer.jsx | ✅ Code given |
| CategoryBar Bulk Orders → navigate to /bulk-orders | CategoryBar.jsx | ✅ Code given |
| BecomeSellerPage typewriter text centred instead of left-aligned | BecomeSellerPage.css | ✅ Code given |
| BulkOrdersPage built at /bulk-orders | New file | ✅ Code given |
| BulkOrdersPage route not yet added to App.jsx | App.jsx | ⏳ Needs to be done |
| MobileDrawer missing ShippingPolicy and ReturnsPolicy links | MobileDrawer.jsx | ⏳ Needs to be done |

---

## 10. Known Issues Still Outstanding

| Issue | Priority |
|-------|----------|
| BrandsPage needs full rebuild as working page (SpecialOffersPage style, real brand data from API) | High |
| AboutPage does not exist — /about links go nowhere | High |
| BulkOrders form currently shows success but saves nothing — needs backend wiring | High |
| BecomeSellerPage form currently opens mailto — needs backend wiring | High |
| ContactPage form destination unknown — needs backend wiring | High |
| Stats strips on BulkOrders and other pages show hardcoded numbers — need real API data | High |
| Mobile: ShippingPolicyPage and ReturnsPolicyPage not reachable on mobile — MobileDrawer links missing | High |
| ShopZone needs more products — currently under-stocked, not truly wholesale-feeling | High |
| Step 1: Corrupted characters in multiple files — not yet cleaned | High |
| Step 2: Remaining accessibility issues from Lighthouse audit | High |

---

## 11. All Discussions and Decisions (Chronological)

### Design philosophy decision
**Decision:** Premium cinematic aesthetic using Oxford Blue and Tan. Every page should feel alive and trustworthy rather than generic. Animations, scroll-triggered reveals, typewriter effects, floating particles, and SVG illustrations used deliberately.

**Sub-decision (this session):** Cinematic only on static pages. Working/interactive pages follow SpecialOffersPage pattern — clean, fast, focused. This was decided after reviewing that not all pages should feel the same and that animation can slow down pages people interact with constantly.

### Brands page discussion
**Problem:** Current BrandsPage uses category-as-brand cards. This was a compromise. It needs to be a real brand discovery experience.

**Decision reached:** BrandsPage should be rebuilt as a working page (not cinematic). Brand data should come from a `brand` field on the Product model. A `/api/products/brands` endpoint returns distinct brand values with product counts. Each brand card links to `/?brand=BrandName` to filter products. The page should feel like SpecialOffersPage — clean hero strip, brand grid, click to filter.

**Action required:** Add `brand` field to Product model. Add brand filter to `getProducts`. Add `/api/products/brands` endpoint. Rebuild BrandsPage frontend.

### Bulk Orders page discussion
**Problem:** Bulk Orders link in CategoryBar and MobileDrawer both pointed to /contact, which confused wholesale buyers with a generic support page.

**Decision:** Create a dedicated `/bulk-orders` page. This page explains the ShopZone sourcing process, builds trust with wholesale buyers, and has a structured enquiry form. When Step 8 (Manual RFQ Flow) is built, this form posts to `/api/rfq`. For now it posts to the new `/api/enquiries` catch-all endpoint.

**Additional discussion:** The longer-term vision (Step 9, Automated Blind RFQ) is that when a buyer submits a bulk order request, it gets pushed as a sanitised RFQ to sellers in the relevant category. Sellers bid with structured offers (available quantity, price, lead time, delivery capability). Admin reviews bids and selects suppliers. Customer only ever sees the ShopZone final quote, never seller identity or bids.

### Forms and data destination discussion
**Problem:** Multiple forms on the site (BulkOrders, BecomeSellerPage, ContactPage) currently save nothing. BecomeSellerPage opens a mailto link. BulkOrders shows a fake success state. No data is stored anywhere.

**Decision:** Build a backend `Enquiry` model as a catch-all destination for all forms immediately. Fields: type (enum: bulk_order, seller_application, contact, general), name, email, phone, business, message, data (mixed — full form payload), status (new, read, actioned, closed), createdAt, userId (optional — link to registered user if logged in), resolvedAt, resolvedBy.

**Migration path:** When Step 6 (Seller Approval) is built, seller_application enquiries migrate to the proper seller application model. When Step 8 (Manual RFQ) is built, bulk_order enquiries migrate to the RFQ model. When Step 15 (Support Tickets) is built, contact enquiries migrate to the ticket model.

**Admin view requirements (decided this session):**
- Admin enquiries page at `/admin/enquiries`
- Filter by type — bulk_order, seller_application, contact, general
- Filter by status — new, read, actioned, closed, resolved, unresolved
- Search bar across name, email, business, message content
- Each enquiry has a unique ID
- Enquiries are linked to user accounts when the submitter is logged in
- History of all enquiries per user visible on the user detail page
- Unresolved vs resolved filter clearly accessible
- Admin can mark enquiries as read, actioned, or closed

**Important:** ShopZone sells to both businesses AND individuals. The ContactPage and all forms must not assume B2B only. Individual buyers are a valid customer segment.

### Stats strips and real numbers discussion
**Problem:** Stats strips on BulkOrders, FAQ, BecomeSellerPage and other pages show hardcoded numbers. These will become misleading as the platform grows.

**Decision:** Build a `/api/stats` public endpoint returning real platform counts. Fields to return: totalOrdersFulfilled (orders where status is delivered), totalApprovedSellers (users where isSeller and sellerStatus is approved), totalProducts, totalCategories (distinct count), countiesServed (static 47 — Kenya has exactly 47 counties so this stays), totalBulkEnquiries (enquiries where type is bulk_order). All stats strips on all pages will call this endpoint on mount and display real numbers.

### Seller visibility and search ranking discussion
**Decision reached (recorded here for Step 17):** Search results should not be fully random — that reduces buyer trust. Pure seller rating ranking is also unfair to new sellers. The agreed model is hybrid ranking:

1. Relevance first — products directly matching the search rank above loosely related ones
2. Availability second — in-stock, complete listings, clear units, reliable lead times get a boost
3. Trust and reliability third — internal seller metrics improve ranking but do not permanently dominate
4. Fair visibility rotation — reserve slots for eligible newer/lower-exposure sellers who meet minimum standards
5. Sponsored placement — paid visibility is allowed but capped and clearly labelled

Agreed mix for first 10 results: 6 strong organic results, 2 rotating eligible sellers, 1 new seller discovery slot, 1 clearly labelled sponsored result. Numbers adjustable after testing but principle stays.

Customer-facing trust signals must never expose seller identity. Use ShopZone-level signals instead: "Verified by ShopZone", "Fast fulfillment", "Bulk ready", "High stock confidence", "Quality checked", "Sponsored".

This discussion is captured in Step 17 of the roadmap.

### Wholesale product fields discussion
**Problem:** Current product model has `unit` (Per Unit, Bale, Carton, Dozen, Kg, Box, Sack) but lacks proper wholesale structure that makes it clear to buyers exactly what they are ordering.

**Decision:** Add the following fields to the Product model (Step 11):
- `brand` — string, the product brand name, used for brand filtering and BrandsPage
- `unitType` — enum replacing/expanding current `unit` field
- `minimumOrderQuantity` — number, defaults to 1
- `itemsPerUnit` — number, e.g. 24 bars of soap per carton
- `weightPerUnit` — number in kg
- `dimensions` — string e.g. "40 x 30 x 20 cm"
- `isBulkOnly` — boolean, if true cannot be bought as single pieces
- `leadTimeDays` — number of days from order to dispatch

All fields optional so existing products are unaffected. Admin product edit page updated to include all new fields.

### About Us page decision
**Decision:** Build with full cinematic treatment but differentiate from other cinematic pages. This is the only page where ShopZone tells its own story rather than converting or informing. Design it as a narrative scroll. Sections: the problem Kenya's traders face, why ShopZone was built, how it works (buyer side and seller side), values, team/trust section, vision statement. Use a horizontal timeline for the story arc — no other page uses this layout so it feels distinct. Cinematic hero with particles yes, but the body feels editorial not commercial.

### MobileDrawer missing pages discussion
**Problem:** ShippingPolicyPage and ReturnsPolicyPage are not reachable on mobile because MobileDrawer does not have links to them.

**Initial diagnosis:** Thought it might be a CSS issue. Confirmed by developer — it is a navigation problem, the links simply do not exist in MobileDrawer.

**Decision:** Add ShippingPolicy and ReturnsPolicy links to the Support section of MobileDrawer.

### Product catalogue discussion
**Decision:** ShopZone needs more products that are genuinely wholesale in nature — products sold by bale, carton, sack, dozen. Products should represent the categories ShopZone actually serves in Kenya: FMCG, fashion bales, electronics accessories, food and grocery, hardware, agricultural inputs, beauty and personal care. The `brand` field should be set on all new products. `minimumOrderQuantity`, `unitType`, `itemsPerUnit` should all be populated. This will be done as part of the `seeder.js` update when the Product model fields are added.

---

## 12. The Full Build Sequence (All Steps with Sub-steps)

Priority legend: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

### Immediate — this session or next

**A. Backend foundations (must happen before forms go live)**

- A1 ⏳ 🔴 Add `brand` field to `backend/models/Product.js`
- A2 ⏳ 🔴 Add wholesale fields to Product model: `unitType`, `minimumOrderQuantity`, `itemsPerUnit`, `weightPerUnit`, `dimensions`, `isBulkOnly`, `leadTimeDays`
- A3 ⏳ 🔴 Build `backend/models/Enquiry.js` — catch-all for all form submissions
- A4 ⏳ 🔴 Build `backend/controllers/enquiryController.js` and `backend/routes/enquiryRoutes.js`
- A5 ⏳ 🔴 Build `/api/stats` endpoint in productController (or statsController)
- A5.1 ⏳ 🔴 Register enquiry routes and stats route in `backend/server.js`

**B. Admin updates**

- B1 ⏳ 🟠 Update `AdminProductEditPage` — add brand field and all new wholesale fields
- B2 ⏳ 🟠 Build `AdminEnquiriesPage` at `/admin/enquiries` — list, filter by type/status, search, mark as read/actioned/closed, link to user history

**C. Frontend wiring**

- C1 ⏳ 🟠 Add `/bulk-orders` route to `App.jsx`
- C2 ⏳ 🟠 Wire BulkOrders form to POST `/api/enquiries` with type `bulk_order`
- C3 ⏳ 🟠 Wire BecomeSellerPage form to POST `/api/enquiries` with type `seller_application`
- C4 ⏳ 🟠 Wire ContactPage form to POST `/api/enquiries` with type `contact` or `general`
- C5 ⏳ 🟠 Replace hardcoded stats numbers on BulkOrdersPage with real `/api/stats` data
- C6 ⏳ 🟠 Add MobileDrawer links for ShippingPolicyPage and ReturnsPolicyPage
- C7 ⏳ 🟠 Add `/about` route to `App.jsx`

**D. BrandsPage rebuild**

- D1 ⏳ 🟠 Add `/api/products/brands` endpoint returning distinct brands with product count
- D2 ⏳ 🟠 Add `?brand=` filter support to `getProducts` in productController
- D3 ⏳ 🟠 Update productSlice to support brand filter
- D4 ⏳ 🟠 Rebuild BrandsPage as working page — SpecialOffersPage style, brand cards from API, click links to `/?brand=BrandName`

**E. Content**

- E1 ⏳ 🟠 Build AboutPage `/about` — cinematic, narrative editorial, horizontal timeline
- E2 ⏳ 🟠 Populate seeder with more wholesale products — brand set, unitType, MOQ, realistic Kenyan wholesale inventory

### Step 1 — Clean corrupted characters ⏳ 🔴
Files affected: Header.jsx, Header.css, ShopZoneLogo.jsx, ShopZoneLogo.css, Footer.jsx, Toast.jsx, MobileDrawer.jsx, HomePage.css, SpecialOffersPage.css, productController.js, orderController.js, Product.js, Order.js, orderRoutes.js

### Step 2 — Final UI structure and accessibility hardening ⏳ 🟠
Remaining issues from Lighthouse 95 score (May 25, 2026):
- Contrast warnings
- MobileDrawer mounted when closed — hide from AT when closed
- ShopZoneLogo inline styles
- App.jsx Bootstrap Container squeezing full-width pages

### Step 3 — Fix dead links and add content pages ✅ Mostly done
- FAQ ✅, Contact ✅, Become a Seller ✅, Shipping Policy ✅, Returns Policy ✅
- Footer links ✅, MobileDrawer FAQ/Become a Seller/Deals ✅
- BulkOrders page ✅ (built this session)
- About Us ⏳, MobileDrawer ShippingPolicy/ReturnsPolicy links ⏳

### Step 4 — Seller role and middleware ⏳ 🔴
- Add `isSeller`, `sellerStatus` (none/pending/approved/suspended/rejected), `sellerProfile`, `sellerApprovedAt`, `sellerSuspendedAt` to User model
- Add seller middleware to authMiddleware.js
- Add seller route protection
- Add frontend seller route guard
- Temporary manual MongoDB approval until admin UI exists

### Step 5 — Seller dashboard ⏳ 🔴
- Private portal for approved sellers
- Seller overview, profile, product submissions, stock updates
- Seller-owned price updates with confirmation modal and audit log — applies to future orders only
- Lead time updates
- Delivery quote submissions for Tier 2 orders
- Payout tracking
- ShopZone-to-seller messages only
- Customer identity always hidden from sellers

### Step 6 — Seller approval system and trust badges ⏳ 🟠
- Public application form (currently uses Enquiry catch-all — migrate here)
- Admin seller application review page
- Admin can approve, reject, suspend, request more info
- Internal trust fields: verified documents, fulfillment reliability, dispute count, cancellation rate, average response time
- Internal trust badges for admin/seller views only — never shown publicly as raw seller identity

### Step 7 — Admin seller management and product approval workflow ⏳ 🟠
- Admin seller list and detail pages
- Seller contact data visible to admin only
- Seller private catalogue visible to admin
- Admin converts seller submissions into public ShopZone listings
- Product submission statuses: draft, submitted, needs_changes, approved, rejected, archived
- Rejection reasons and change requests
- Audit history for all seller self-service actions
- Admin override/suspend controls

### Step 8 — Manual RFQ flow ⏳ 🟠
- Customer submits: item name, quantity, unit type, location/county, desired delivery date, budget range, optional image, notes
- This is what the BulkOrders form feeds into once Step 8 is built
- Admin sees: customer request, internal sourcing notes, private supplier options, supplier cost, transport estimate, handling cost, margin calculation, quote draft, quote status
- Customer sees: ShopZone quote, final price, delivery estimate, payment terms, accept/reject
- Statuses: request_received, sourcing, quote_sent, accepted, rejected, expired, cancelled
- Supplier identity and costs always admin-only

### Step 9 — Automated blind RFQ with supplier bidding ⏳ 🟡
- Only after Step 8 works
- Admin sends sanitised RFQs to approved sellers
- Sellers receive only fulfillment-safe details — no customer identity
- Sellers submit structured offers: available quantity, seller price, lead time, pickup/delivery capability
- No free-text fields that could leak contact details unless moderated
- Admin reviews seller offers and selects suppliers
- Customer receives only ShopZone final quote — never sees seller bids or identities

### Step 10 — Tiered wholesale pricing ⏳ 🟠
- Volume-based price tiers e.g. 1-2 cartons at KES 2,000, 3-9 at KES 1,850, 10+ request quote
- Pricing tiers on Product model — validate ranges do not overlap
- Tier price calculated based on cart quantity
- Tier price snapshotted into `priceAtPurchase` at order time
- Tier table shown on product detail page
- Applied tier shown in cart and checkout
- Quote-required tier support
- Supplier cost hidden from customers and unrelated sellers — admin and owning seller only

### Step 11 — Bulk units, MOQ, and product detail wholesale clarity ⏳ 🟠
- `unitType`, `minimumOrderQuantity`, `itemsPerUnit`, `weightPerUnit`, `dimensions`, `isBulkOnly`, `leadTimeDays` (being done in Block A above)
- Update seed data
- Update admin product form (Block B1)
- Update product cards, product detail, cart, checkout
- Prevent cart quantities below MOQ
- Clear explanation of buying unit on product detail page

### Step 12 — Wishlist and saved procurement list ⏳ 🟡
- Saved item model or user field
- Save/remove API
- Saved items page
- Save button on product cards and detail page
- Move saved items to cart
- Convert saved items to RFQ requests
- Consider saved procurement lists by business purpose (monthly restock)

### Step 13 — Buyer profile enrichment ⏳ 🟡
- Buyer type: retailer, individual bulk buyer, institution, group buyer
- Preferred product categories, typical order size, preferred delivery/pickup point, payment preference, restock frequency
- Admin-only: trust level, credit eligibility, average order value, quote history, dispute history, internal notes
- Admin notes hidden from customers

### Step 14 — Order status expansion ⏳ 🟡
Customer statuses: pending, awaiting_payment, paid, sourcing, procurement_confirmed, preparing_dispatch, in_transit, ready_for_pickup, delivered, cancelled, refunded
Internal fulfillment statuses: seller_requested, seller_confirmed, seller_unavailable, preparing, ready_for_pickup, handed_over, cancelled

### Step 15 — Support tickets and dispute system ⏳ 🟠
- Support ticket model (Enquiry model migrates here)
- Categories: order issue, damaged goods, missing item, delivery issue, seller application, payment issue, general support
- Customer ticket form
- Admin ticket list/detail page with search and filters
- Tickets linked to order ID where applicable
- Statuses: open, waiting_customer, waiting_internal, resolved, closed
- Internal admin notes on each ticket
- Dispute evidence uploads for damaged/missing goods
- Seller/customer communication always mediated by ShopZone
- Tickets have unique IDs
- Tickets linked to user account for history tracking
- Unresolved vs resolved filter
- Admin can diagnose recurring issues from ticket history

### Step 16 — Lightweight escrow and payout hold ⏳ 🟠
- Admin payout queue UI
- Payout hold window after delivery
- Block payout release if open dispute exists
- Admin payout release confirmation
- Store payout release actor and timestamp
- Seller payout view after seller dashboard exists

### Step 17 — Product filtering, sorting, ranking, pagination, and sponsored visibility ⏳ 🟡
**Ranking model (decided in chat):**
- Relevance first → availability second → trust/reliability third → fair visibility rotation → sponsored placement
- First 10 results mix: 6 strong organic, 2 rotating eligible sellers, 1 new seller discovery slot, 1 clearly labelled sponsored
- Customer-facing trust signals: "Verified by ShopZone", "Fast fulfillment", "Bulk ready", "High stock confidence", "Quality checked", "Sponsored"
- Never expose raw seller identity, seller names, or seller ratings to customers
- Sponsored results must be clearly labelled, category-relevant, capped per page, eligible sellers only

Checklist:
- Backend pagination for products, admin orders, users, seller products
- Filters: keyword, category, unit type, MOQ, price range, in-stock, delivery region, lead time, sale, clearance, featured, quality signals, brand
- Sort: relevance, ShopZone recommended, newest, price, rating/quality signal, stock, lead time
- Backend ranking logic combining relevance, availability, seller reliability, listing completeness
- Fair-visibility rotation for new/lower-exposure sellers
- Sponsored placement with eligibility checks, clear labelling, admin controls
- Analytics: search impressions, clicks, add-to-cart, quote requests, conversion, sponsored impressions, seller exposure distribution

### Step 18 — Bulk Excel product upload ⏳ 🟡
- CSV/XLSX parser
- Import template definition
- Validate required columns, categories, units, MOQ, prices, stock, sale fields, tiered pricing
- Preview before saving
- Row-level error display
- Admin upload first, seller upload later as private submissions requiring approval

### Step 19 — Seller reputation system ⏳ 🟡
- Track: fulfillment reliability, cancellation rate, response time, dispute rate, quality issue rate
- Admin-only seller score
- Seller-facing improvement guidance without exposing customer identities

### Step 20 — M-Pesa STK Push integration ⏳ 🔴
- Safaricom Daraja API — start with sandbox
- Backend payment routes
- Initiate STK Push from order page
- Handle callback from M-Pesa, verify signatures
- Mark paid only after confirmed success
- Handle failed, cancelled, timeout, duplicate, pending states
- Never allow frontend to directly mark orders paid

### Step 21 — Deposits, partial payments, bank transfer, card decision ⏳ 🟡
- Required deposit amount field
- Balance due field
- Payment status tracking
- Prevent fulfillment before required payment threshold
- Admin confirms manual bank transfers
- Decide on PayPal/card — if kept, add official integration

### Step 22 — Cloudinary image storage ⏳ 🟡
- Replace local Multer uploads with Cloudinary
- Store remote URLs on products, requests, disputes, seller submissions
- Validate image size and type
- Strip supplier-identifying metadata during admin review

### Step 23 — Backend request validation ⏳ 🟠
- Validate all API endpoints with express-validator or Joi
- Validate registration, login, profile, product, seller application, quote, order, shipping, review fields
- Validate prices as non-negative (KES 0.00 allowed by policy)
- Validate ObjectId params before database calls
- Sanitise strings appearing in public UI
- Consistent 400 responses for bad input

### Step 24 — Forgot password and email infrastructure ⏳ 🟡
- Email provider/SMTP setup
- Reset token fields on User model
- Forgot/reset password API and frontend pages
- Token expiry, no email existence reveal
- Password hashing stays in controller

### Step 25 — Invoice generation with KRA/VAT breakdown ⏳ 🟡
- pdfkit or similar
- ShopZone business details, KRA PIN field
- VAT-inclusive breakdown: `price * 16 / 116`
- Item subtotal, shipping, VAT component, total
- Download invoice button on order page
- Admin invoice access

### Step 26 — HTTP-only cookie auth ⏳ 🟡
- Cookie-based JWT response
- httpOnly, secure, sameSite settings
- Update frontend API auth flow
- Logout cookie clearing
- Update CORS credentials

### Step 27 — Ad management system ⏳ 🟢
- Only after product and seller workflows stable
- Must follow Step 17 ranking rules
- Admin ad creation, image upload, start/end dates, active/inactive
- Sponsored search/category placement — relevant, approved, in-stock, policy-compliant
- Clearly labelled in customer-facing UI
- Ads must not crowd operational pages

### Step 28 — Swahili language option ⏳ 🟢
- Translation approach decision
- Extract visible strings
- English and Swahili dictionaries
- Language switcher
- Core customer flows first: browse, cart, checkout, order status, support, FAQ

### Step 29 — Tests ⏳ 🟠
Backend: Jest or similar, test database, registration/login, protected routes, admin routes, seller routes, product CRUD, search/filtering, order creation, atomic stock, cancellation stock restore, access authorization, delivery quote flow, payout release restrictions
Frontend: React Testing Library, login/register forms, cart behavior, checkout rendering, protected pages, admin routes, product list states, Special Offers filters, drawer keyboard, ConfirmModal focus

### Step 30 — Build, lint, quality scripts ⏳ 🟡
- Root build script
- Root lint script
- Backend linting
- Root test script
- Document all commands in README

### Step 31 — README ⏳ 🟡
Full developer documentation including: project overview, private supplier model explanation, tech stack, folder structure, installation, environment setup, seed command, VAT rule, KES formatting rule, no direct supplier contact rule

### Step 32 — Deployment and environment configuration ⏳ 🟡
- .env.example
- Document all environment variables
- Hosting decisions
- Production CORS
- Production build instructions

### Step 33 — Frontend documentation ⏳ 🟢
Component-level docs, Redux store explanation, routing, styling conventions, Toast/inline alert coexistence

### Step 34 — TypeScript migration ⏳ 🟢
After JavaScript version is stable, tested, and deployed. Shared types first, then Redux slices, API clients, components, pages.

---

## 13. Prompt for Next Chat Session

Use this entire section as the opening message in any new chat to give full context. Copy everything from the line below marked START to the line marked END.

---START---

I am building a full stack e-commerce wholesale platform called **ShopZone** with React, Node.js and MongoDB. It is a B2B wholesale platform based in Nairobi, Kenya that connects retailers, small businesses, and individual bulk buyers to structured supply chains. All transactions and communication go exclusively through ShopZone — customers never contact sellers directly and sellers never know customer identities.

**Tech Stack:**
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs (in controllers only, no pre-save hooks), Multer. CommonJS throughout. Port 5000.
- Frontend: React, Vite, Redux Toolkit, React Bootstrap, Axios, React Icons (fa set only). Port 5173.
- Styling: Custom CSS only. Oxford Blue `#002147`, Tan `#D2B48C`, Off-white `#FAF8F5`. Every component has its own CSS file in its own folder. index.css is globals only.
- Dev: concurrently from root with `npm run dev`. Project at `C:\Users\User\OneDrive\Desktop\ecommerce-platform`.

**How I need instructions delivered — read this before writing anything:**
- Every fix must show exact existing code first under "Find this:" then replacement under "Replace with:" — never show only the new code
- Never create files using file creation tools — always write code in a copyable code block for manual paste
- Always explain what a file does and what is changing before showing code
- Be direct — no filler sentences, no over-explanation
- When I say "lets continue" just continue without re-summarising
- No bullet points or heavy formatting in conversational replies — plain prose only
- All code must be fully commented — file header comments always, function comments where needed
- Summaries must be very descriptive, no detail left behind
- Every new feature or decision discussed must be added to the build steps immediately

**Non-negotiable rules:**
- All transactions through ShopZone only — never expose supplier identity, contact, location, cost, or seller identifiers to customers
- Cart items use `item.product` as the MongoDB ID field
- Password hashing in controllers only — no pre-save hook on User.js ever
- VAT is inclusive — `price * 16 / 116` — never add on top
- Prices in KES: `toLocaleString('en-KE', { minimumFractionDigits: 2 })`
- Icons: react-icons/fa only — ChatWidget avatar emoji is the only exception
- Zero inline style={{}} except Bootstrap overrides and dynamic accent colour props
- Every component has its own CSS file in its own folder
- display:contents on product card Link wrappers is intentional — never revert
- Backend authorisation is the real security boundary
- Existing orders never changed by later seller edits — priceAtPurchase snapshot

**Design system rules:**
- Cinematic design (particles, typewriter, scroll reveal, orbs, stats strip) ONLY on static/rarely-visited pages: About, FAQ, Become a Seller, Shipping Policy, Returns Policy
- Working/interactive pages use SpecialOffersPage as the reference — clean hero strip, tabs, grid, no heavy animation
- Not all pages should look the same — variety builds interest and avoids user fatigue

**Current routes:**
/ | /product/:id | /cart | /login | /register | /offers | /shipping | /payment | /placeorder | /order/:id | /profile | /admin/products | /admin/product/:id/edit | /admin/orders | /admin/users | /faq | /contact | /become-seller | /shipping-policy | /returns-policy | /brands | /bulk-orders [NEEDS App.jsx route] | /about [NOT BUILT] | * NotFoundPage

**What is built and working:**
Full order system, atomic stock management, county-based shipping, Tier 2 delivery quotes, seller quote fields, platform commission, VAT-inclusive pricing, priceAtPurchase snapshots, JWT auth, bcrypt in controllers, central error middleware, product search across name/category/description/tags. All pages listed in current routes except /about. Accessibility audit complete — Lighthouse 95. All cinematic content pages built and working. BulkOrdersPage built this session.

**What needs to happen next (in order):**

BLOCK A — Backend foundations (do first):
- A1: Add `brand` field to Product model
- A2: Add wholesale fields to Product model: unitType, minimumOrderQuantity, itemsPerUnit, weightPerUnit, dimensions, isBulkOnly, leadTimeDays
- A3: Build Enquiry model — catch-all for all form submissions (type, name, email, phone, business, message, data, status, createdAt, userId, resolvedAt, resolvedBy)
- A4: Build enquiryController and enquiryRoutes — public POST to create, admin GET to list with filters
- A5: Build /api/stats endpoint — totalOrdersFulfilled, totalApprovedSellers, totalProducts, totalCategories, countiesServed (47 static), totalBulkEnquiries

BLOCK B — Admin updates:
- B1: Update AdminProductEditPage with brand field and new wholesale fields
- B2: Build AdminEnquiriesPage at /admin/enquiries — list, filter by type/status, search bar, mark as read/actioned/closed, link to user history, unique IDs, unresolved/resolved filter

BLOCK C — Frontend wiring:
- C1: Add /bulk-orders route to App.jsx
- C2: Wire BulkOrders form to POST /api/enquiries with type bulk_order
- C3: Wire BecomeSellerPage form to POST /api/enquiries with type seller_application
- C4: Wire ContactPage form to POST /api/enquiries
- C5: Replace hardcoded stats on BulkOrdersPage with real /api/stats data
- C6: Add MobileDrawer links for ShippingPolicyPage and ReturnsPolicyPage
- C7: Add /about route to App.jsx

BLOCK D — BrandsPage rebuild:
- D1: Add /api/products/brands endpoint
- D2: Add ?brand= filter to getProducts
- D3: Update productSlice for brand filter
- D4: Rebuild BrandsPage as working page in SpecialOffersPage style

BLOCK E — Content:
- E1: Build AboutPage /about — cinematic, narrative editorial, horizontal timeline
- E2: Populate seeder with more wholesale products — brand, unitType, MOQ, Kenyan wholesale inventory

**Known issues outstanding:**
- BrandsPage needs full rebuild as real brand working page
- AboutPage does not exist — /about goes nowhere
- All forms (BulkOrders, BecomeSellerPage, ContactPage) save no data — need backend wiring
- Stats strips show hardcoded numbers — need real API
- MobileDrawer missing ShippingPolicy and ReturnsPolicy links
- More products needed in the database
- Step 1 corrupted characters not yet cleaned
- Step 2 remaining accessibility issues

**Folder structure:**
frontend/src/components/: Header, SearchBar, CategoryBar, DesktopDropdownMenu, MobileDrawer, ShopZoneLogo, Footer, ChatWidget, Toast, HeroBanner, CategoryCards, CheckoutSteps, ConfirmModal, ScrollToTop, SkipLink
frontend/src/pages/: HomePage, ProductPage, CartPage, LoginPage, RegisterPage, ShippingPage, PaymentPage, PlaceOrderPage, OrderPage, ProfilePage, NotFoundPage, AdminProductListPage, AdminProductEditPage, AdminOrderListPage, AdminUserListPage, SpecialOffersPage, FAQPage, ContactPage, BecomeSellerPage, ShippingPolicyPage, ReturnsPolicyPage, BrandsPage, BulkOrdersPage
backend/: controllers (user, product, order), models (User, Product, Order), middleware (auth, error), routes (user, product, order, upload), data (users, products, shippingRates), seeder.js, server.js

---END---
