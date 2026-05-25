# ShopZone Active Roadmap

This is the working Notion roadmap for ShopZone. It removes issues and improvements that are already fixed, keeps unfinished work in the execution order, and adds clearer implementation notes for the next build steps.

## Product Direction

ShopZone is a full stack B2B wholesale platform based in Nairobi, Kenya. It connects retailers, small businesses, remote buyers, group buyers, and individuals to structured supply chains.

The operating model is:

- Customers buy from ShopZone.
- Suppliers and sellers sell through ShopZone.
- ShopZone controls pricing, customer communication, delivery promises, quality control, support, disputes, and payouts.
- Customers never see supplier names, supplier contacts, supplier locations, supplier cost prices, or direct seller identifiers.
- Sellers never contact customers directly through the platform.
- Public listings show ShopZone-controlled information only.

## Current Implemented Baseline

These items are already present and should not be repeated as active roadmap tasks unless regression testing shows a problem:

- React/Vite frontend, Node/Express backend, MongoDB/Mongoose data layer, JWT auth, bcryptjs password hashing in controllers, Multer uploads, Redux Toolkit, React Bootstrap, Axios, React Icons.
- Customer browsing, product detail pages, cart, registration, login, shipping, payment method selection, order placement, profile, order history, product reviews, admin APIs, and upload route.
- Secure order access in `backend/controllers/orderController.js`, where only the order owner or admin can view an order by ID.
- Central error middleware in `backend/middleware/errorMiddleware.js`, registered in `backend/server.js`.
- Foundation admin pages: product list, product edit, order list, and user list.
- Product merchandising fields in `backend/models/Product.js`: `tags`, `isFeatured`, `isOnSale`, `isClearance`, and `salePrice`.
- Expanded customer categories in the header/category surfaces.
- Search across product name, category, description, and tags in `backend/controllers/productController.js`.
- Homepage redesign with hero, category cards, product sections, deals banner, product cards, and cart controls.
- Special Offers page and `/offers` route for sale and clearance products.
- Mobile header fixes, tan cart badge override, mobile deals banner containment, and mobile Special Offers card overrides.
- Shared `ConfirmModal` replacing `window.confirm` usage.
- Toast live region improvements, MobileDrawer focus trap, dialog semantics, Escape close, and no inline icon styles in drawer support/admin links.
- Atomic stock protection during order creation, stock restore on cancellation/rejected delivery quote, server-side item price verification, VAT-inclusive extraction, county-based shipping, Tier 2 delivery quote flow, seller delivery quote submission, platform commission tracking, and lightweight payout release flag.

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

Issues to address:

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
- Run a keyboard-only pass through header, search, drawer, product cards, cart controls, checkout, admin pages, modal, and toast dismissal.
- Test mobile width around 360px, 390px, 430px, 768px, and desktop.

Acceptance criteria:

- Keyboard users can open, navigate, and close the drawer without escaping into background content.
- Product cards have predictable focus rings and semantic links.
- No avoidable inline visual styles remain in the reviewed components.
- Full-width pages are not unintentionally squeezed by the global Bootstrap container.

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
- Price update requests.
- Lead time updates.
- Delivery quote submissions for Tier 2 orders.
- Payout tracking.
- ShopZone-to-seller messages only.

Privacy rules:

- Sellers cannot see customer contact details.
- Sellers cannot message customers.
- Sellers cannot see full buyer profile data unless ShopZone intentionally exposes a fulfillment-safe subset.
- Sellers cannot set final public selling price.
- Seller-uploaded photos must be reviewed before public use.
- Seller submissions must not expose phone numbers, WhatsApp numbers, shop signs, supplier invoices, watermarks, or warehouse addresses.

Checklist:

- Add seller dashboard route and page.
- Add seller-specific API routes.
- Add private seller product submission model or fields.
- Add seller stock/price/lead-time update flow.
- Add seller order/fulfillment request list that hides customer identity.
- Add seller payout status display.

Acceptance criteria:

- Approved sellers can manage their private supply information.
- Seller submissions do not appear publicly without admin approval.
- Customer identity remains protected.

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

Checklist:

- Add admin seller list page.
- Add admin seller detail page.
- Show seller contact data only to admin.
- Show seller private catalog to admin.
- Let admin convert seller submissions into public ShopZone listings.
- Add product submission statuses: `draft`, `submitted`, `needs_changes`, `approved`, `rejected`, `archived`.
- Let admin set final public title, description, category, images, sale price, ShopZone price, stock, availability, and delivery classification.
- Add rejection reasons and change requests.

Acceptance criteria:

- Seller products are private until approved.
- Admin controls public listings.
- Supplier cost and contact data remain private.

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

Admin-only pricing:

- Supplier cost.
- ShopZone margin.
- Transport estimate.
- Handling cost.
- Final selling price.

Checklist:

- Add pricing tiers to product model.
- Add admin UI for tier editing.
- Validate tier ranges do not overlap.
- Calculate tier price based on cart quantity.
- Snapshot tier price into order item `priceAtPurchase`.
- Show tier table on product detail page.
- Show applied tier in cart and checkout.
- Support quote-required tier such as `10+ request quote`.
- Keep supplier cost hidden from customers and sellers unless admin-only.

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

## Step 17: Product Filtering, Sorting, And Pagination

Priority: Medium

Search and category filters exist, but full filtering and pagination are still needed for scale.

Checklist:

- Add backend pagination for products.
- Add backend pagination for admin orders.
- Add backend pagination for users.
- Add backend pagination for seller products.
- Add filters for category, unit type, MOQ, price range, rating, in-stock status, delivery region, sale, clearance, and featured.
- Add sort by newest, price, rating, stock, and lead time.
- Preserve filters/search while paginating.
- Keep URL query params shareable.

Acceptance criteria:

- Large product and admin lists load efficiently.
- Customers can narrow results accurately.
- Search, filters, sorting, and pagination work together.

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
- Validate prices and quantities as positive numbers.
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

Checklist:

- Define ad placements.
- Add admin ad creation UI.
- Add image upload and validation.
- Add start/end dates.
- Add active/inactive state.
- Add click tracking if needed.
- Ensure ads do not crowd operational pages.

Acceptance criteria:

- Admin can manage promotional placements.
- Ads do not interfere with checkout or core browsing.

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
17. Add product filtering, sorting, and pagination.
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
