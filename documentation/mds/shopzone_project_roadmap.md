# ShopZone Active Roadmap

This is the working Notion roadmap for ShopZone. It removes issues and improvements that are already fixed, keeps unfinished work in the execution order, and adds clearer implementation notes for the next build steps.

## Product Direction

ShopZone is a full stack B2B wholesale platform based in Nairobi, Kenya. It connects retailers, small businesses, remote buyers, group buyers, and individuals to structured supply chains.

The operating model is:

- Customers buy from ShopZone.
- Suppliers and sellers sell through ShopZone.
- ShopZone controls customer communication, delivery promises, quality control, support, disputes, payouts, platform fees, and the safety rules around seller actions.
- Approved sellers should be allowed to manage low-risk parts of their own catalog, including price changes, without waiting for admin approval when the change does not create a security issue, expose private data, mislead buyers, alter existing orders, or create buyer/payment/dispute risk.
- Customers never see supplier names, supplier contacts, supplier locations, supplier cost prices, or direct seller identifiers.
- Sellers never contact customers directly through the platform.
- Public listings use ShopZone-approved presentation and privacy rules only, even when an approved seller is allowed to self-manage eligible price or stock fields.

## Current Implemented Baseline

These items are already present and should not be repeated as active roadmap tasks unless regression testing shows a problem:

- Architecture and stack:
  - React/Vite frontend, Node/Express backend, MongoDB/Mongoose data layer, JWT auth, bcryptjs password hashing in controllers, Multer uploads, Redux Toolkit, React Bootstrap, Axios, React Icons.
  - Root scripts currently support running the frontend/backend dev setup, while frontend already has build, lint, and preview scripts.
  - Uploads are local through the existing upload route and `backend/uploads`, which is acceptable for development but still needs production storage later.

- Customer-facing frontend:
  - Public browsing starts at the redesigned homepage with hero content, category cards, product sections, deals banner, product cards, search/category entry points, and cart controls.
  - Product detail pages support product information, pricing, stock state, quantity selection, review display, and review submission.
  - Cart, login, registration, shipping, payment method selection, place order, order detail, profile, and order history flows are implemented.
  - Special Offers page and `/offers` route are implemented for sale and clearance products.
  - Expanded customer categories are present across header/category surfaces.
  - Mobile header fixes, tan cart badge override, mobile deals banner containment, and mobile Special Offers card overrides are already applied.
  - Chat widget, toast notifications, footer, scroll-to-top behavior, category bar/cards, desktop dropdown menu, search bar, and shared logo component are present.

- Admin-facing frontend:
  - Foundation admin pages are present: product list, product edit, order list, and user list.
  - Admin product editing includes merchandising fields for tags, featured placement, sale state, clearance state, sale price, unit, stock, image, category, and description.
  - Admin order views include operational order handling for payment/delivery state and the newer Tier 2 delivery quote and payout concepts.

- Backend API and data model:
  - Product model includes core product fields, reviews, stock, wholesale unit, `tags`, `isFeatured`, `isOnSale`, `isClearance`, and `salePrice`.
  - Order model includes order item price snapshots, county shipping address, shipping tier, shipping zone, Tier 2 delivery quote fields, seller quote fields, platform commission, payout release fields, payment state, delivery state, and lifecycle status.
  - User model supports customer account data and admin checks.
  - Product search covers product name, category, description, and tags in `backend/controllers/productController.js`.
  - Secure order access exists in `backend/controllers/orderController.js`, where only the order owner or admin can view an order by ID.
  - Central error middleware exists in `backend/middleware/errorMiddleware.js` and is registered in `backend/server.js`.

- Order integrity and pricing protections:
  - Order creation uses atomic stock checks/decrements and restores stock if a later item fails.
  - Stock is restored on order cancellation and rejected delivery quote.
  - Server-side item price verification prevents frontend price tampering at checkout.
  - Order items snapshot `priceAtPurchase`, so later product price changes do not change historical orders.
  - VAT is treated as inclusive and extracted using `price * 16 / 116`.
  - County-based shipping is calculated server-side instead of trusting the frontend.
  - Tier 2 delivery quote flow exists for bulk/heavy goods, including quote send, buyer approve, buyer reject, and quote queues.
  - Platform commission tracking and a lightweight payout release flag are present.

- Current accessibility and interaction baseline:
  - Shared `ConfirmModal` replaces direct `window.confirm` usage in the reviewed flows.
  - Toast live region improvements are present.
  - `MobileDrawer` has focus trap work, dialog semantics, Escape close behavior, and CSS-backed icon styling in drawer support/admin links.
  - Lighthouse desktop accessibility score from the May 25, 2026 run is 95, with remaining issues documented in Step 2.

## Non-Negotiable Rules

- All transactions and communication go through ShopZone.
- No customer-facing page may expose supplier identity, supplier contact details, supplier location, supplier cost, or direct seller identifiers.
- Cart items must continue using `item.product` as the MongoDB product ID field.
- Password hashing stays in controllers; do not add a `User.js` pre-save password hook.
- VAT is inclusive and must be extracted as `price * 16 / 116`; do not add VAT on top of displayed product prices.
- Prices must display in KES using `toLocaleString('en-KE', { minimumFractionDigits: 2 })`.
- UI icons use `react-icons/fa`; do not use emojis for visible UI.
- Avoid inline `style={{}}` props in JSX. Move styling to component CSS files except where a Bootstrap override is genuinely unavoidable.
- Each component keeps its own CSS file in its own folder. `index.css` stays for global variables and globals only.
- Backend authorization is the real security boundary. Frontend route hiding is not enough.
- Seller autonomy should be the default for low-risk seller-owned operations. Admin approval should be reserved for actions that can affect buyer safety, existing orders, public trust, security, supplier privacy, payouts, disputes, or platform liability.
- Existing orders must never be silently changed by later seller edits. Product price changes affect future orders only because orders snapshot `priceAtPurchase`.
- Sellers may choose aggressive prices, including KES 0.00, for their own eligible products if the change is confirmed and does not violate buyer-safety, fraud, content, payment, or platform rules.

## Step 1: Clean Corrupted Characters And Text Encoding

Priority: High

This remains the most visible cleanup issue. Many files still contain mojibake/corrupted characters. Use ASCII-safe searches for the corrupted byte patterns and common replacement targets instead of copying the broken symbols back into new docs.

Known affected areas:

- `frontend/src/components/Header/Header.jsx`
- `frontend/src/components/Header/Header.css`
- `frontend/src/components/ShopZoneLogo/ShopZoneLogo.jsx`
- `frontend/src/components/ShopZoneLogo/ShopZoneLogo.css`
- `frontend/src/components/Footer/Footer.jsx`
- `frontend/src/components/Toast/Toast.jsx`
- `frontend/src/components/MobileDrawer/MobileDrawer.jsx`
- `frontend/src/pages/HomePage.css`
- `frontend/src/pages/SpecialOffersPage.css`
- `backend/controllers/productController.js`
- `backend/controllers/orderController.js`
- `backend/models/Product.js`
- `backend/models/Order.js`
- `backend/routes/orderRoutes.js`

Checklist:

- Search the whole repo for corrupted UTF-8 patterns and non-ASCII symbols, especially broken box-drawing comments, broken dashes, broken check/cross/info icons, broken footer arrows, and broken copyright text.
- Replace corrupted comment dividers with plain ASCII comment dividers.
- Replace corrupted visible UI symbols with React Icons from `react-icons/fa`.
- Replace corrupted footer arrow bullets with CSS bullets or proper icon components.
- Replace Toast visible close/icon characters with React Icons or plain accessible text.
- Replace corrupted copyright text with ASCII-safe `Copyright {year} ShopZone Wholesale. All rights reserved.` or a CSS-safe entity rendered intentionally.
- Keep all visible UI labels readable after cleanup.
- Run frontend build after cleanup.

Acceptance criteria:

- No corrupted characters remain in visible UI.
- Comments are readable and no longer polluted by mojibake.
- Toast, Footer, Header, MobileDrawer, product pages, checkout pages, and admin pages still render correctly.
- Frontend build succeeds.

## Step 2: Final UI Structure And Accessibility Hardening

Priority: High

The first accessibility pass has been started, but several semantics and layout details still need tightening before building more features on top.

Latest audit context:

- Lighthouse was run on May 25, 2026 at 3:47 PM GMT+3 using Lighthouse 13.0.2, Chromium 148.0.0.0, emulated desktop, single page session, initial page load, and custom throttling.
- Accessibility score was 95.
- The run reported that clearing the browser cache timed out, so the audit should be repeated after fixes to confirm the score.
- Automated Lighthouse checks only cover part of accessibility. Manual keyboard and screen-reader review remains required.

Issues to address:

- Fix the Lighthouse contrast warning by reviewing foreground/background pairs on the audited page and raising low-contrast text, icons, badges, muted labels, and sale/deal elements to WCAG-friendly contrast.
- Fix the Lighthouse heading order warning caused by `h6.footer-col-heading`. Footer column headings should not skip heading levels; use a semantically appropriate heading level or style non-heading text when the footer label is not part of the page heading outline.
- `MobileDrawer` remains mounted as a dialog even when closed. Hide it from assistive technology when closed or render it only when open while preserving exit animation if needed.
- Product cards use `display: contents` link wrappers. This can be inconsistent for focus rings and assistive technology. Convert clickable product content to a normal block link, with cart controls outside the link.
- `ShopZoneLogo.jsx` still uses inline `style` props for gap, font size, and color. Move size/color variants into CSS classes or CSS variables.
- `App.jsx` wraps all routes in a Bootstrap `Container`, while pages like HomePage and SpecialOffersPage already manage their own widths. This can constrain full-width sections and create nested layout spacing.
- Confirm whether `confirmVariant="primary-branded"` is still used anywhere. If it is, add a CSS-backed variant instead of relying on old inline styles.
- Ensure all icon-only buttons have clear `aria-label` values.
- Ensure modal close buttons, drawer close buttons, cart steppers, and search controls have visible focus states.

Checklist:

- Review `frontend/src/App.jsx` and decide which pages should be full-width outside Bootstrap `Container`.
- Review `frontend/src/components/MobileDrawer/MobileDrawer.jsx` for closed-state semantics.
- Review `frontend/src/pages/HomePage.jsx` and `frontend/src/pages/SpecialOffersPage.jsx` for card link/button structure.
- Review `frontend/src/components/ShopZoneLogo/ShopZoneLogo.jsx` and move inline visual styling into CSS.
- Review `frontend/src/components/Footer/Footer.jsx` and `frontend/src/components/Footer/Footer.css` for footer heading semantics and contrast.
- Review `frontend/src/index.css`, page CSS files, header/footer CSS, and product-card/deals CSS for low-contrast color combinations.
- Run a keyboard-only pass through header, search, drawer, product cards, cart controls, checkout, admin pages, modal, and toast dismissal.
- Run a manual screen-reader-oriented pass for heading order, landmark clarity, dialog names, drawer state, toast announcement behavior, and product-card link/button labels.
- Test mobile width around 360px, 390px, 430px, 768px, and desktop.
- Re-run Lighthouse after changes and record the new date, score, and remaining warnings in this roadmap.

Acceptance criteria:

- Lighthouse no longer reports contrast failures on the audited page.
- Footer headings no longer skip heading levels.
- Keyboard users can open, navigate, and close the drawer without escaping into background content.
- Product cards have predictable focus rings and semantic links.
- No avoidable inline visual styles remain in the reviewed components.
- Full-width pages are not unintentionally squeezed by the global Bootstrap container.
- Manual review confirms that automated Lighthouse success did not hide keyboard, focus, dialog, heading, or announcement issues.

## Step 3: Fix Dead Links And Add Core Content Pages

Priority: High

Several visible navigation items point to placeholder routes or routes that may not exist. These should be fixed before seller features so customer support and onboarding are not broken.

Known issues:

- Footer `Become a Seller` points to `/`.
- Footer `FAQ` points to `/`.
- Footer category names are non-clickable spans instead of category links.
- Mobile drawer links include `/brands`, `/contact`, and seller/support labels that need real routes or intentional removal.
- Header/support links should not lead nowhere.

Pages to add:

- FAQ page.
- Contact Support page.
- Become a Seller page.
- Shipping Policy page.
- Returns Policy page.
- Optional Brands page only if ShopZone will actually support brand browsing.

Checklist:

- Add routes in `frontend/src/App.jsx`.
- Add page files in `frontend/src/pages/`.
- Add page-specific CSS files when the page needs custom styling.
- Update Footer links to real routes.
- Update MobileDrawer links to real routes.
- Make footer category names link to `/?category=<category>`.
- Contact page should support customer support, order issues, seller applicant questions, and dispute starts.
- FAQ should cover wholesale buying, MOQ, delivery quotes, payment, returns, seller privacy, and bulk sourcing.
- Become a Seller page should explain that ShopZone reviews applications and sellers do not communicate directly with customers.
- Shipping Policy should explain county rates, Tier 2 delivery quote flow, pickup options, timelines, and remote-area limitations.
- Returns Policy should explain issue reporting, dispute window, damaged goods evidence, refund or replacement conditions, and ShopZone mediation.

Acceptance criteria:

- No visible nav/footer/support link points to an accidental placeholder.
- Customers can find FAQ, support, shipping, and returns information.
- Seller applicants can understand the private supplier model before applying.

## Step 4: Seller Role And Middleware

Priority: High

The order system already has seller quote concepts, but user accounts do not yet have seller roles or seller authorization. This is the next structural step before building a seller dashboard.

Implementation target:

- Keep `isAdmin` for admin checks.
- Add seller-specific fields without breaking existing users.
- Add backend middleware that allows only approved sellers into seller routes.
- Keep seller identity private from customers.

Suggested user fields:

- `isSeller`
- `sellerStatus`: `none`, `pending`, `approved`, `suspended`, `rejected`
- `sellerProfile`
- `sellerApprovedAt`
- `sellerSuspendedAt`

Checklist:

- Update `backend/models/User.js`.
- Add seller middleware in `backend/middleware/authMiddleware.js`.
- Add seller route protection for future seller APIs.
- Ensure admin middleware remains unchanged for admin-only APIs.
- Add frontend route guard for seller pages after backend guard exists.
- Add temporary manual seller approval support through MongoDB until admin UI exists.

Acceptance criteria:

- Customers cannot access seller screens.
- Pending/rejected/suspended sellers cannot access seller dashboard APIs.
- Approved sellers can access seller-only APIs.
- Admin remains the only role with admin dashboard access.

## Step 5: Seller Dashboard

Priority: High

Approved sellers need a private portal, but nothing seller submits should become public automatically.

Seller dashboard scope:

- Seller overview.
- Seller profile summary.
- Private product submissions.
- Stock update requests.
- Seller-owned price updates for eligible products, applied directly after confirmation when the change is low-risk and affects future orders only.
- Lead time updates.
- Delivery quote submissions for Tier 2 orders.
- Payout tracking.
- ShopZone-to-seller messages only.

Privacy rules:

- Sellers cannot see customer contact details.
- Sellers cannot message customers.
- Sellers cannot see full buyer profile data unless ShopZone intentionally exposes a fulfillment-safe subset.
- Sellers can set their own eligible product prices, including KES 0.00, when the product belongs to them and the change does not alter existing orders, bypass payment rules, mislead buyers, or violate platform policy.
- Price changes must use a confirmation modal and must be logged for admin review/audit.
- Seller-uploaded photos must be reviewed before public use.
- Seller submissions must not expose phone numbers, WhatsApp numbers, shop signs, supplier invoices, watermarks, or warehouse addresses.

Seller autonomy policy:

- Default to allowing seller actions when they are low-risk, reversible, auditable, and limited to the seller's own catalog or fulfillment data.
- Require admin approval for actions that publish new public listings, change public product identity/content in a way that could mislead buyers, expose supplier/customer information, modify existing orders, change payout/payment state, affect disputes/refunds, bypass delivery rules, or create security/compliance risk.
- Price and stock changes should not require admin approval by default, because existing order price snapshots and stock checks protect buyers. The UI should make risky values obvious with confirmation, but not block seller business decisions solely because the price is very low.
- Keep structured inputs wherever possible for delivery quotes and fulfillment data so sellers cannot leak direct contact details through free text.

Checklist:

- Add seller dashboard route and page.
- Add seller-specific API routes.
- Add private seller product submission model or fields.
- Add seller stock update flow.
- Add seller direct price update flow for eligible products, with confirmation, audit log, and future-orders-only behavior.
- Add seller lead-time update flow.
- Add seller order/fulfillment request list that hides customer identity.
- Add seller payout status display.
- Add backend ownership checks so sellers can only update products/orders assigned to them.
- Add admin review/audit view for seller self-service actions so admin can monitor behavior without approving every normal change.

Acceptance criteria:

- Approved sellers can manage their private supply information.
- Approved sellers can update eligible product prices and stock without admin approval, and existing orders remain unchanged.
- Seller submissions that create new public products or public content do not appear publicly without the required approval.
- Customer identity remains protected.
- Admin workload is reduced because normal seller-owned updates are self-service, while genuinely risky actions still require review.

## Step 6: Seller Approval System And Trust Badges

Priority: High

Seller onboarding should become a controlled workflow instead of manual database edits.

Checklist:

- Add seller application model or embedded user application fields.
- Add public application form on Become a Seller page.
- Add admin seller application review page.
- Let admin approve, reject, suspend, or request more information.
- Add internal seller trust fields: verified documents, fulfillment reliability, dispute count, cancellation rate, average response time.
- Add internal trust badges for admin/seller views only.
- Decide if any public trust signal is shown as ShopZone-level quality assurance, not seller identity.

Acceptance criteria:

- Sellers can apply from the site.
- Admin can review and approve sellers.
- Customers never see raw seller application data or direct seller identity.

## Step 7: Admin Seller Management And Product Approval Workflow

Priority: High

Admin needs full control over seller data, supplier cost, and public product approval.

Important operating decision:

- Admin should not approve every seller action. Admin control should focus on sensitive seller data, supplier cost visibility, public product approval, privacy, disputes, payouts, suspicious behavior, and policy enforcement.
- Routine seller-owned changes that do not harm buyers or the platform, such as price updates and stock updates on eligible products, should be self-service with confirmation and audit history.

Admin seller focus:

- Seller approval, suspension, rejection, reactivation, verification, and document review.
- Public product approval for new listings, product images, descriptions, categories, titles, and any content that could mislead buyers or expose supplier identity.
- Seller behavior monitoring: cancellations, late fulfillment, inaccurate stock, repeated unavailable items, poor delivery quote behavior, complaint patterns, and suspicious price activity.
- Disputes, refunds, damaged goods, missing goods, buyer complaints, and seller accountability.
- Payout release, payout holds, payout disputes, fraud checks, and commission reconciliation.
- Privacy and policy enforcement: phone numbers, WhatsApp details, shop signs, supplier addresses, invoice photos, watermarks, direct-contact attempts, and off-platform transaction attempts.
- Pricing abuse only when it becomes a buyer/platform risk, such as bait pricing, hidden charges, repeated confusing KES 0.00 listings, fake discounts, or attempts to bypass payment and order rules.
- Sponsored placement approval so paid visibility supports the business without destroying buyer trust.

Reasoning:

- Admin time should be spent where human judgment protects buyers, ShopZone, and the private supplier model.
- Normal seller updates should be logged and reversible rather than manually approved one by one.
- The system should reduce admin workload while still giving admin strong override, audit, and suspension tools when a seller becomes risky.

Checklist:

- Add admin seller list page.
- Add admin seller detail page.
- Show seller contact data only to admin.
- Show seller private catalog to admin.
- Let admin convert seller submissions into public ShopZone listings.
- Add product submission statuses: `draft`, `submitted`, `needs_changes`, `approved`, `rejected`, `archived`.
- Let admin set or override public title, description, category, images, sale price, ShopZone price, stock, availability, and delivery classification when approval, correction, or policy enforcement is needed.
- Add rejection reasons and change requests.
- Add audit history for seller self-service actions: price changes, stock changes, lead-time changes, delivery quote submissions, and profile edits.
- Add admin override/suspend controls for sellers who abuse self-service permissions.

Acceptance criteria:

- Seller products are private until approved.
- Admin controls public listings.
- Supplier cost and contact data remain private.
- Admin can monitor seller changes without approving every normal low-risk update.

## Step 8: Request Goods Flow - Manual RFQ First

Priority: High

Customers need a way to request goods that are not publicly listed. Start with a manual ShopZone-managed RFQ before automating supplier bidding.

Customer submits:

- Item name.
- Quantity.
- Unit type.
- Location/county.
- Desired delivery date.
- Budget range.
- Optional image.
- Notes.

Admin sees:

- Customer request.
- Internal sourcing notes.
- Private supplier options.
- Supplier cost.
- Transport estimate.
- Handling cost.
- Margin calculation.
- Quote draft.
- Quote status.

Customer sees:

- ShopZone quote.
- Final price.
- Delivery estimate.
- Payment terms.
- Accept/reject action.

Suggested statuses:

- `request_received`
- `sourcing`
- `quote_sent`
- `accepted`
- `rejected`
- `expired`
- `cancelled`

Checklist:

- Add quote/request model.
- Add customer request form.
- Add admin request list/detail page.
- Add admin quote builder.
- Add customer quote response flow.
- Support image upload using current local upload first, then Cloudinary later.
- Keep supplier identities and costs admin-only.

Acceptance criteria:

- Customers can request unavailable bulk goods.
- Admin can source privately and send ShopZone quotes.
- Customers never see supplier identity or supplier pricing.

## Step 9: Automated Blind RFQ With Supplier Bidding

Priority: Medium

Only start this after the manual RFQ flow works.

Checklist:

- Let admin send sanitized RFQs to approved sellers.
- Sellers receive only fulfillment-safe request details.
- Sellers submit structured offers: available quantity, seller price, lead time, pickup/delivery capability.
- Prevent free-text fields that could leak phone numbers or direct contact details unless moderated.
- Admin reviews seller offers and selects one or more suppliers.
- Customer receives only ShopZone final quote.

Acceptance criteria:

- Sellers can bid privately.
- Admin controls final customer quote.
- Customers never see seller bids or identities.

## Step 10: Tiered Wholesale Pricing

Priority: High

The platform has units, sale prices, and order price snapshots, but true tiered volume pricing is still needed.

Customer-facing example:

- 1-2 cartons: KES 2,000 each.
- 3-9 cartons: KES 1,850 each.
- 10+ cartons: request quote.

Internal pricing controls:

- Supplier cost.
- ShopZone margin.
- Transport estimate.
- Handling cost.
- Final selling price owner/override rules: admin can set or override; approved sellers can self-manage eligible product prices when allowed by seller autonomy rules.

Checklist:

- Add pricing tiers to product model.
- Add admin UI for tier editing.
- Validate tier ranges do not overlap.
- Calculate tier price based on cart quantity.
- Snapshot tier price into order item `priceAtPurchase`.
- Show tier table on product detail page.
- Show applied tier in cart and checkout.
- Support quote-required tier such as `10+ request quote`.
- Keep supplier cost hidden from customers and from unrelated sellers; only admin and the owning seller context should see cost data where intentionally supported.

Acceptance criteria:

- Bulk discounts work correctly.
- Cart and checkout use the correct tier.
- Existing sale/clearance pricing does not conflict with tiered pricing.

## Step 11: Bulk Units, MOQ, And Product Detail Wholesale Clarity

Priority: High

The current model has `unit`, but not the full wholesale structure. Add richer wholesale fields once tiered pricing is planned.

Suggested fields:

- `unitType`: bale, carton, sack, dozen, kg, box, piece.
- `minimumOrderQuantity`.
- `itemsPerUnit`.
- `weightPerUnit`.
- `dimensions`.
- `isBulkOnly`.
- `leadTimeDays`.

Checklist:

- Update `backend/models/Product.js`.
- Update seed data.
- Update product create/edit API.
- Update admin product form.
- Update product cards, product detail, cart, and checkout.
- Prevent cart quantities below MOQ.
- Explain buying unit clearly on product detail page.

Acceptance criteria:

- Customers understand exactly what one unit means.
- Checkout cannot proceed below MOQ.
- Wholesale data is consistent across admin and customer views.

## Step 12: Wishlist And Saved Procurement List

Priority: Medium

Saved items should support repeat procurement, not only casual wishlisting.

Checklist:

- Add saved item model or user field.
- Add save/remove API.
- Add saved items page.
- Add save button on product cards and product detail page.
- Allow saved items to be moved into cart.
- Allow saved items to become RFQ requests.
- Consider saved procurement lists by business purpose, such as monthly restock.

Acceptance criteria:

- Logged-in customers can save products.
- Saved items support repeat bulk buying and future sourcing requests.

## Step 13: Buyer Profile Enrichment

Priority: Medium

The user model already has basic account type, business name, business type, county, and phone. Expand this into a procurement profile.

Suggested customer fields:

- Buyer type: retailer, individual bulk buyer, institution, group buyer.
- Preferred product categories.
- Typical order size.
- Preferred delivery or pickup point.
- Payment preference.
- Restock frequency.

Admin-only fields:

- Trust level.
- Credit eligibility.
- Average order value.
- Quote history.
- Dispute history.
- Internal notes.

Checklist:

- Update user model carefully without breaking existing accounts.
- Update profile page form.
- Add admin-only profile fields to admin user detail/edit flow.
- Keep admin notes hidden from customers.

Acceptance criteria:

- Customers can identify their buying context.
- Admin can make better sourcing and support decisions.

## Step 14: Order Status Expansion

Priority: Medium

The order model now has `pending`, `processing`, `dispatched`, `delivered`, and `cancelled`, but the business flow needs richer customer-facing and internal statuses.

Suggested customer statuses:

- `pending`
- `awaiting_payment`
- `paid`
- `sourcing`
- `procurement_confirmed`
- `preparing_dispatch`
- `in_transit`
- `ready_for_pickup`
- `delivered`
- `cancelled`
- `refunded`

Suggested internal fulfillment statuses:

- `seller_requested`
- `seller_confirmed`
- `seller_unavailable`
- `preparing`
- `ready_for_pickup`
- `handed_over`
- `cancelled`

Checklist:

- Update `backend/models/Order.js`.
- Add valid status transitions.
- Update payment logic.
- Update delivery/admin logic.
- Update customer order pages.
- Update admin order pages.
- Update seller portal fulfillment pages when seller portal exists.

Acceptance criteria:

- Customer status reflects ShopZone progress.
- Seller fulfillment status remains internal.
- Invalid transitions are blocked.

## Step 15: Support Tickets And Dispute System

Priority: High

A contact page alone is not enough for a marketplace-style wholesale platform. Support and disputes should be tracked.

Checklist:

- Add support ticket model.
- Add ticket categories: order issue, damaged goods, missing item, delivery issue, seller application, payment issue, general support.
- Add customer ticket form.
- Add admin ticket list/detail page.
- Link tickets to order ID where applicable.
- Add ticket statuses: open, waiting_customer, waiting_internal, resolved, closed.
- Add internal admin notes.
- Add dispute evidence uploads for damaged or missing goods.
- Keep seller/customer communication mediated by ShopZone.

Acceptance criteria:

- Customers can report issues through ShopZone.
- Admin can track and resolve support tickets.
- Disputes do not expose sellers to customers.

## Step 16: Lightweight Escrow And Payout Hold System

Priority: High

The order model has payout release tracking. Build the operational UI and rules around it.

Checklist:

- Add admin payout queue UI if not fully surfaced.
- Show delivered and paid orders awaiting payout release.
- Add payout hold window after delivery.
- Block payout release if there is an open dispute.
- Add admin payout release confirmation.
- Store payout release actor and timestamp.
- Add seller payout view after seller dashboard exists.

Acceptance criteria:

- Admin can release payouts intentionally.
- Disputed orders cannot be paid out accidentally.
- Sellers can eventually see payout status without seeing customer details.

## Step 17: Product Filtering, Sorting, Ranking, Pagination, And Sponsored Visibility

Priority: Medium

Search and category filters exist, but full filtering, ranking, fair seller visibility, sponsored placement, and pagination are still needed for scale.

Search bar and filter scope:

- The search bar should support product keyword search plus filters so buyers can narrow results without leaving the search flow.
- Filters should include price range, category, unit type, MOQ, in-stock only, sale/clearance, rating or ShopZone quality signal, delivery region, lead time, and featured/verified flags where appropriate.
- Sorting should include relevance, ShopZone recommended, newest, price low-to-high, price high-to-low, stock availability, lead time, and rating/quality signal where appropriate.

Ranking principle:

- Search should not be fully random.
- Fully random results can reduce buyer trust because weaker or less relevant products may appear above clearly better matches.
- Pure seller rating or badge ranking is also risky because it can permanently lock new sellers out of visibility.
- The recommended model is hybrid ranking: relevance first, availability second, trust/reliability third, then controlled fair-visibility rotation and limited sponsored placement.

Recommended ranking model:

- Relevance first: products that directly match the searched item should rank above vague or loosely related products.
- Availability second: in-stock products, complete listings, clear units, reliable lead times, and deliverable regions should receive a ranking boost.
- Trust and reliability third: internal seller reliability, cancellation rate, fulfillment accuracy, dispute rate, stock accuracy, and response time should improve ranking, but should not permanently dominate search.
- Fair visibility rotation: reserve a small number of result slots for eligible newer or lower-exposure sellers who still meet minimum quality and policy standards.
- Sponsored placement: allow paid visibility as a business model, but label it clearly and cap it so search does not become pay-to-win.

Suggested top-results mix:

- For the first 10 search results, use a controlled mix such as 6 strong organic results, 2 rotating eligible sellers, 1 new seller discovery slot, and 1 clearly labeled sponsored result.
- The exact numbers can be adjusted after testing, but the principle should remain: buyers see relevant, trustworthy results while new sellers still get a real chance.
- Rotation should never override basic quality gates. A seller should not receive rotation visibility if the listing is out of stock, misleading, unapproved, policy-risky, or has serious unresolved reliability issues.

Buyer-facing trust signals:

- Do not expose seller identity, seller names, seller contact details, or raw seller ratings on customer-facing pages.
- Use ShopZone-level signals instead, such as `Verified by ShopZone`, `Fast fulfillment`, `Bulk ready`, `High stock confidence`, `Quality checked`, or `Sponsored`.
- Internally, those signals can be powered by seller badges, seller reliability, fulfillment history, and admin review, but customers should still experience ShopZone as the service provider.

Personalization and fairness:

- Different buyers can see slightly different ranking based on county, delivery availability, stock, buying context, previous behavior, and fair-visibility rotation.
- Personalization should be controlled and explainable internally. It should improve relevance without making search feel arbitrary.
- New sellers should receive visibility opportunities, but not at the expense of buyer trust or product relevance.

Sponsored visibility rules:

- Sponsored products must be clearly labeled as sponsored.
- Sponsored placement should be category/search relevant; a seller should not buy visibility for unrelated searches.
- Sponsored results should be capped per page and should not occupy all top positions.
- Sponsored eligibility should require approved seller status, compliant listings, sufficient stock, and acceptable reliability.
- Admin should be able to pause, reject, or remove sponsored placements that create buyer confusion, policy risk, or poor customer experience.

Checklist:

- Add backend pagination for products.
- Add backend pagination for admin orders.
- Add backend pagination for users.
- Add backend pagination for seller products.
- Add filters for search keyword, category, unit type, MOQ, price range, in-stock status, delivery region, lead time, sale, clearance, featured, and ShopZone quality signals.
- Add sort by relevance, ShopZone recommended, newest, price, rating/quality signal, stock, and lead time.
- Add backend ranking logic that combines relevance, availability, internal seller reliability, listing completeness, and delivery suitability.
- Add fair-visibility rotation for eligible new or lower-exposure sellers.
- Add sponsored placement support with clear labeling, eligibility checks, category relevance, and admin controls.
- Add analytics for search impressions, clicks, add-to-cart, quote requests, conversion, sponsored impressions, and seller exposure distribution.
- Preserve filters/search while paginating.
- Keep URL query params shareable.

Acceptance criteria:

- Large product and admin lists load efficiently.
- Customers can narrow results accurately.
- Search, filters, sorting, and pagination work together.
- Search results prioritize relevant and available products without permanently locking out new sellers.
- Sponsored results are clearly labeled and do not dominate organic search.
- Customer-facing ranking signals protect seller privacy and present ShopZone as the service provider.
- Admin can monitor seller visibility, sponsored placements, and search quality.

## Step 18: Bulk Excel Product Upload

Priority: Medium

Admin and future sellers will need faster product creation than one form at a time.

Checklist:

- Choose CSV/XLSX parser.
- Define import template.
- Validate required columns.
- Validate categories, units, MOQ, prices, stock, sale fields, and tiered pricing.
- Preview import before saving.
- Show row-level errors.
- Support admin upload first.
- Add seller upload later as private submissions requiring admin approval.

Acceptance criteria:

- Admin can upload many products safely.
- Bad rows do not corrupt product data.
- Seller bulk uploads do not publish directly.

## Step 19: Seller Reputation System

Priority: Medium

Reputation should be operational and private by default.

Checklist:

- Track fulfillment reliability.
- Track cancellation/unavailable rate.
- Track response time.
- Track dispute rate.
- Track quality issue rate.
- Show admin-only seller score.
- Show seller-facing improvement guidance without exposing customer identities.
- Decide whether any customer-facing signal should be ShopZone quality controlled rather than seller-named.

Acceptance criteria:

- Admin can prioritize reliable sellers.
- Seller reputation does not leak supplier identity to customers.

## Step 20: M-Pesa STK Push Integration

Priority: High

M-Pesa is the most important real payment method for this Kenya-focused platform.

Production note:

- Safaricom Daraja production access requires correct business account setup and a reachable live callback URL.
- Start with Daraja sandbox.

Checklist:

- Add backend payment routes.
- Store Daraja environment variables.
- Initiate STK Push from order page.
- Handle callback from M-Pesa.
- Verify callback signatures/status.
- Mark order as paid only after confirmed success.
- Store payment reference/result on the order.
- Handle failed, cancelled, timeout, duplicate, and pending states.
- Prevent customer-side button clicks from directly marking orders paid.

Acceptance criteria:

- Customer can initiate M-Pesa payment.
- Backend receives and verifies payment result.
- Paid orders update correctly.
- Failed payments do not mark orders as paid.

## Step 21: Deposits, Partial Payments, Bank Transfer, And Card Decision

Priority: Medium

Bulk orders may require staged payments and manual payment support.

Checklist:

- Add required deposit amount.
- Add balance due amount.
- Add payment status tracking.
- Prevent fulfillment before required payment threshold.
- Let admin confirm manual bank transfers.
- Add ShopZone bank transfer instructions if bank transfer is enabled.
- Decide whether to keep PayPal/card in the UI.
- If PayPal/card remains, add official frontend integration and backend confirmation route.
- Never expose seller bank details to customers.

Acceptance criteria:

- Large orders can be paid in stages.
- Manual payments are trackable.
- Payment UI does not promise unsupported methods.

## Step 22: Cloudinary Image Storage

Priority: Medium

Local `backend/uploads` is acceptable for development but risky in production.

Checklist:

- Choose Cloudinary or another storage provider.
- Add provider environment variables.
- Update upload route.
- Store remote image URLs on products, requests, disputes, and seller submissions.
- Validate image size.
- Validate image type.
- Keep local upload only as a development fallback if useful.
- Remove supplier-identifying image metadata or reject images with visible direct contact information during admin review.

Acceptance criteria:

- Images persist reliably in production.
- Uploads are validated.
- Seller/customer image flows do not leak private supplier data.

## Step 23: Backend Request Validation

Priority: High

Controllers still trust too much incoming request body data. Add validation before real users or seller data scale.

Checklist:

- Validate registration fields.
- Validate login fields.
- Validate profile updates.
- Validate product create/update fields.
- Validate seller application fields.
- Validate seller product submission fields.
- Validate quote request fields.
- Validate order creation payload.
- Validate shipping address fields.
- Validate quantities as positive numbers and prices as non-negative numbers where KES 0.00 is intentionally allowed by seller/admin policy.
- Validate sale price lower than normal price when sale/clearance is active.
- Validate review rating between 1 and 5.
- Validate ObjectId params before database calls.
- Sanitize strings that appear in public UI.
- Add consistent `400` responses for bad input.

Acceptance criteria:

- Invalid input returns clear errors.
- Invalid MongoDB IDs do not crash or produce confusing server errors.
- Product, order, seller, and quote data stay consistent.

## Step 24: Forgot Password And Email Infrastructure

Priority: Medium

Add password recovery after core account and validation work is stable.

Checklist:

- Choose email provider or SMTP setup.
- Add reset token fields to user model.
- Add forgot password API.
- Add reset password API.
- Add frontend forgot/reset pages.
- Add token expiry.
- Do not reveal whether an email exists.
- Keep password hashing in controller.

Acceptance criteria:

- Users can recover accounts securely.
- Reset tokens expire and cannot be reused.

## Step 25: Invoice Generation With KRA/VAT Breakdown

Priority: Medium

Invoices should reflect Kenya context and VAT-inclusive pricing.

Checklist:

- Add invoice generation using `pdfkit` or similar.
- Include ShopZone business details.
- Include KRA PIN field when available.
- Include customer/order details.
- Show VAT-inclusive breakdown using `price * 16 / 116`.
- Show item subtotal, shipping, VAT component, and total.
- Add download invoice button on order page.
- Add admin invoice access.

Acceptance criteria:

- Customers can download invoices.
- VAT display is accurate and not added on top.

## Step 26: HTTP-Only Cookie Auth

Priority: Medium

Move from local token storage to stronger auth storage before production.

Checklist:

- Add cookie-based JWT response.
- Set `httpOnly`, `secure`, and `sameSite` appropriately.
- Update frontend API auth flow.
- Add logout cookie clearing.
- Update CORS credentials.
- Ensure protected routes still work.

Acceptance criteria:

- Auth no longer depends on JavaScript-readable tokens.
- Login/logout/profile/admin flows still work.

## Step 27: Ad Management System

Priority: Low

Only add this after product and seller workflows are stable.

Search placement note:

- Sponsored search/category visibility can become part of the ad system, but it must follow the Step 17 ranking rules.
- Paid placement should create revenue and seller opportunity without weakening buyer trust, hiding better matches, or exposing seller identity.

Checklist:

- Define ad placements.
- Add admin ad creation UI.
- Add image upload and validation.
- Add start/end dates.
- Add active/inactive state.
- Add click tracking if needed.
- Add sponsored search/category placement rules after the ranking system exists.
- Require sponsored products to be relevant, approved, in stock, and policy-compliant.
- Clearly label sponsored placements in customer-facing UI.
- Ensure ads do not crowd operational pages.

Acceptance criteria:

- Admin can manage promotional placements.
- Ads do not interfere with checkout or core browsing.
- Sponsored search/category placements remain limited, relevant, and transparent.

## Step 28: Swahili Language Option

Priority: Low

Add localization after the main UI copy stabilizes.

Checklist:

- Choose translation approach.
- Extract visible strings.
- Add English and Swahili dictionaries.
- Add language switcher.
- Translate core customer flows first: browse, cart, checkout, order status, support, FAQ.
- Keep admin/seller translation optional until later.

Acceptance criteria:

- Customers can use core flows in English or Swahili.
- Currency, dates, and status labels remain clear.

## Step 29: Tests

Priority: High

There are no real automated tests yet.

Backend test checklist:

- Choose Jest or another runner.
- Add test database setup.
- Test registration/login.
- Test protected routes.
- Test admin-only routes.
- Test seller-only routes after seller middleware exists.
- Test product CRUD.
- Test product search/filtering.
- Test order creation.
- Test atomic stock protection.
- Test order cancellation stock restore.
- Test order access authorization.
- Test delivery quote approve/reject flow.
- Test payout release restrictions.

Frontend test checklist:

- Choose React Testing Library.
- Test login/register forms.
- Test cart behavior.
- Test checkout step rendering.
- Test protected page behavior.
- Test admin route behavior.
- Test product list loading/empty/error states.
- Test Special Offers filters/tabs.
- Test drawer keyboard behavior.
- Test ConfirmModal focus/default action.

Acceptance criteria:

- Backend test command runs successfully.
- Frontend test command runs successfully.
- Critical customer, admin, and seller flows are covered.

## Step 30: Build, Lint, And Quality Scripts

Priority: Medium

Root scripts should make quality checks easy.

Current state:

- Root has `npm run dev`, `npm run server`, `npm run client`, and `npm start`.
- Frontend has `build`, `lint`, and `preview`.

Checklist:

- Add root `build` script.
- Add root `lint` script.
- Add backend linting if desired.
- Add root `test` script after tests exist.
- Document all commands in README.
- Run build/lint after significant frontend changes.

Acceptance criteria:

- One root command can build frontend.
- One root command can run lint/tests when configured.

## Step 31: README

Priority: Medium

The README should be enough for another developer to run and understand ShopZone.

Checklist:

- Add project overview.
- Explain the private supplier model.
- Add tech stack.
- Add folder structure.
- Add installation steps.
- Add environment setup.
- Add seed command.
- Add development command: `npm run dev`.
- Add backend and frontend ports.
- Add build command after root build exists.
- Add test command after tests exist.
- Add demo credentials if available.
- Add screenshots if available.
- Document VAT-inclusive pricing rule.
- Document KES formatting rule.
- Document no direct supplier contact rule.

Acceptance criteria:

- A new developer can run the project from README alone.
- The business model is clear.

## Step 32: Deployment And Environment Configuration

Priority: Medium

Prepare deployment only after core workflows are stable.

Checklist:

- Add `.env.example` for backend.
- Document `MONGO_URI`, `JWT_SECRET`, `PORT`, payment variables, storage variables, and frontend API URL.
- Decide backend hosting.
- Decide frontend hosting.
- Configure production CORS.
- Configure frontend API base URL.
- Add production build instructions.
- Test deployed frontend against deployed backend.
- Ensure no real secrets are committed.

Acceptance criteria:

- Frontend and backend work from deployed URLs.
- New environments can be configured without guessing.

## Step 33: Frontend Documentation

Priority: Medium

Document the frontend with the same clarity as the backend docs.

Checklist:

- Document folder structure.
- Explain every page component.
- Explain every reusable component.
- Explain Redux store and slices.
- Explain routing.
- Explain protected/admin/seller route behavior after seller routes exist.
- Explain API call patterns.
- Explain styling conventions.
- Explain how Toast and inline alerts coexist.
- Explain how to run, lint, build, and test frontend.

Acceptance criteria:

- A new developer can understand what every frontend file does.
- Frontend docs match backend documentation quality.

## Step 34: TypeScript Migration

Priority: Post-deployment

Do not start until the JavaScript version is stable, tested, and deployed.

Checklist:

- Add TypeScript config.
- Migrate shared types first.
- Migrate Redux slices.
- Migrate API clients.
- Migrate reusable components.
- Migrate pages.
- Add backend type strategy only if moving backend to TypeScript later.

Acceptance criteria:

- TypeScript improves maintainability without blocking current delivery.

## Suggested Execution Order

Use this as the Notion step checklist.

1. Clean corrupted characters and text encoding.
2. Final UI structure and accessibility hardening.
3. Fix dead links and add FAQ, Contact, Become a Seller, Shipping Policy, and Returns Policy pages.
4. Add seller role and middleware.
5. Add seller dashboard.
6. Add seller approval system and trust badges.
7. Add admin seller management and product approval workflow.
8. Add manual Request Goods / RFQ flow.
9. Add automated blind RFQ with supplier bidding.
10. Add tiered wholesale pricing.
11. Add bulk units, MOQ, and wholesale product detail clarity.
12. Add wishlist / saved procurement list.
13. Enrich buyer profiles.
14. Expand order statuses.
15. Add support tickets and dispute system.
16. Build lightweight escrow and payout hold UI/rules.
17. Add product filtering, sorting, ranking, pagination, and sponsored visibility.
18. Add bulk Excel product upload.
19. Add seller reputation system.
20. Integrate M-Pesa STK Push.
21. Add deposits, partial payments, bank transfer, and final card/PayPal decision.
22. Move production image storage to Cloudinary or equivalent.
23. Add backend request validation.
24. Add forgot password and email infrastructure.
25. Add invoice generation with KRA/VAT breakdown.
26. Move auth toward HTTP-only cookies.
27. Add ad management system.
28. Add Swahili language option.
29. Add backend and frontend tests.
30. Add root build, lint, and quality scripts.
31. Update README.
32. Configure deployment and environment documentation.
33. Add frontend documentation.
34. Migrate to TypeScript after deployment.

## Working Notes

- Keep each task small and finish one before starting the next.
- After every backend change, test the affected API manually or with automated tests.
- After every frontend change, run lint/build and manually check the affected page.
- When showing fixes in chat, show `Find this:` with the exact existing code, then `Replace with:` with the replacement.
- Never create new files in chat instructions; provide code blocks for manual paste unless directly editing the project in the local workspace.
- Toast remains bottom-left fixed and does not replace inline alerts.
- Seller-facing work must never expose customer contact information unless ShopZone intentionally allows a fulfillment-safe subset.
- Customer-facing work must present ShopZone as the service provider, not individual suppliers.
