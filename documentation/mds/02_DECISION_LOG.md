# ShopZone — Decision Log

> Every significant decision made during the ShopZone build. Each entry records what was decided, why, what alternatives were rejected, and what it means going forward.
>
> **Rules for this document:**
> - Never delete or edit old entries
> - New decisions go at the bottom
> - If a decision is reversed, add a NEW entry explaining the reversal — do not edit the original
> - If you are unsure whether something is worth logging, log it anyway

---

## DEC-001 — ShopZone Is the Sole Intermediary (Golden Rule)
**Date:** May 2026 | **Status:** PERMANENT — cannot be reversed

**Decision:** All transactions and communication go exclusively through ShopZone. Buyers and sellers never contact each other directly. Supplier identity, contact details, location, and cost pricing are never exposed to customers at any point on any page or in any feature.

**Why:** B2B wholesale in Kenya currently runs on WhatsApp and personal referrals because trust is personal, not platform-based. The only way for ShopZone to become the trusted entity is to own every customer touchpoint and be the face of every transaction. If buyers can contact suppliers directly, ShopZone becomes a listing directory with no moat. The private supply chain model is the entire value proposition.

**Alternatives rejected:** Marketplace model where buyers and sellers negotiate directly — rejected because it destroys platform value, eliminates supplier privacy protection, and removes ShopZone's ability to quality-control the buyer experience. Agent model where ShopZone staff broker manually — rejected because it cannot scale and is too labour-intensive.

**Implications:** Every feature that could create a channel for direct contact must be rejected or redesigned. Buyer-selected couriers are rejected because they expose courier contact details. Seller chat is rejected. WhatsApp integration is rejected. Even tracking notification emails must come from ShopZone, not from the courier. `getSellerOrders` in `sellerController.js` deliberately strips customer identity — only `deliveryCounty` is exposed to the seller, never the full address, name, or contact.

---

## DEC-002 — Password Hashing in Controllers Only, Never Pre-Save Hooks
**Date:** May 2026 | **Status:** PERMANENT

**Decision:** bcryptjs password hashing is done explicitly in `userController.js` at the point of saving. No Mongoose `pre('save')` middleware is ever added to `User.js`.

**Why:** The bcryptjs UMD build conflicts with Mongoose middleware parameter naming conventions, causing unpredictable bugs when hashing is done in a pre-save hook. Explicit hashing in the controller gives full, visible control over when and how hashing happens. It was confirmed that pre-save hooks cause real failures during testing.

**Alternatives rejected:** Pre-save hook on `User.js` — rejected because it caused real bugs in testing. A separate hash utility module — rejected because it added unnecessary abstraction without solving the root conflict.

**Implications:** Every place where a password is set or changed, the hash must be done explicitly in the controller function. There are currently two places: `registerUser` and `updateUserProfile` (when a new password is provided, which was later removed from ProfilePage for security reasons — see DEC-019). Password reset in Step 24 must also hash in the controller.

---

## DEC-003 — VAT Is Inclusive in All Prices
**Date:** May 2026 | **Status:** PERMANENT

**Decision:** All displayed prices on ShopZone are VAT-inclusive. When VAT needs to be shown separately (invoices, receipts), it is extracted as `price * 16 / 116`. VAT is never added on top of a displayed price.

**Why:** Kenya's standard VAT rate is 16%. Kenyan wholesale suppliers quote prices as VAT-inclusive. Adding VAT on top of the displayed price would misrepresent supplier pricing, mislead buyers who are used to seeing inclusive prices, and create a discrepancy between what the product page shows and what the buyer pays at checkout.

**Alternatives rejected:** VAT-exclusive pricing with VAT added at checkout — rejected because it would confuse buyers and is inconsistent with how Kenyan wholesale markets operate. Zero-rating all products (non-VAT) — rejected because ShopZone must comply with KRA requirements as it scales.

**Implications:** Invoice generation in Step 25 must extract the VAT component as `price * 16 / 116`, not add it. All price displays use the inclusive price. The receipt modal built in Session 010 already implements this correctly. When Step 25 is built, the same formula is used.

---

## DEC-004 — Cart Items Use `item.product` as MongoDB ID Field
**Date:** May 2026 | **Status:** PERMANENT — cannot be changed

**Decision:** The cart item structure uses `item.product` to hold the MongoDB product ObjectId. This field name is the canonical product identifier throughout the entire codebase.

**Why:** This was established in the earliest phase of the build. Every cart handler, order creation function, price verification check, and order item lookup depends on this field name. The verified purchase check in `createProductReview` uses `order.orderItems.some((item) => item.product?.toString() === id)` — this would silently break if the field were renamed.

**Alternatives rejected:** `item._id` — rejected because `_id` is the ObjectId of the cart item document itself, not the product. `item.productId` — rejected because it would require rewriting every cart and order handler across the codebase.

**Implications:** Every new cart-related feature must use `item.product` as the product ID field. The `addToCart` action is dispatched with `{ id: product._id, qty: 1 }` — never spread the whole product object. `updateCartQty` with `qty: 0` does NOT remove — always use `removeFromCart` when qty reaches 0.

---

## DEC-005 — Tier 2 Delivery System for Heavy/Bulk Goods
**Date:** May 2026 | **Status:** FINAL

**Decision:** Hardware & Tools, Agriculture & Garden, and Fabric & Textiles categories require a delivery quote rather than a flat county rate. The flow is: order placed → delivery fee marked as "Quote Required" → admin contacts courier → obtains real quote → sends to buyer via ShopZone dashboard → buyer approves or rejects → if rejected, order is cancelled and stock is restored.

**Why:** These categories involve heavy, large, or fragile goods where a flat KES 300–1,500 county rate is wildly inaccurate. A 50kg bag of cement and a carton of soap cannot be priced the same for delivery. The courier cost for these items depends on weight, dimensions, and the specific courier — variables that require a real quote.

**Alternatives rejected:** Flat rate for all goods including heavy items — rejected because it would be financially inaccurate and would either cause significant losses on heavy orders or overcharge buyers on small ones. Buyer arranges own courier — rejected because it would expose seller location and break the golden rule. Weight-based algorithm — rejected as premature without real courier API data. Phase 3 will replace admin manual quotes with live Sendy/Fargo API quotes.

**Implications:** Products in the three Tier 2 categories must have realistic `weightPerUnit` values set. The `shippingRates.js` file defines the tier mapping by category name — the category field on products must exactly match these strings (case-sensitive). AdminOrderListPage has a Pending Quotes tab showing all orders awaiting a Tier 2 quote. This is the critical thing that was not tested until Session 010.

---

## DEC-006 — Sellers Are Buyer Account Upgrades, Not Separate Accounts
**Date:** June 2026 | **Status:** FINAL

**Decision:** Sellers register a buyer account first, then apply via BecomeSellerPage. Admin approves their application. The same user account gains seller permissions. There is no separate seller registration flow and no separate seller account.

**Why:** A unified account means admin sees everything about a person in one place — orders placed as a buyer, products listed as a seller, all enquiries submitted, all notifications received, all support tickets. When a seller calls support, admin can pull up their entire history instantly via AdminUserDetailPage. Two separate accounts would create two identity silos and make it impossible to build the AdminUserDetailPage aggregation cleanly.

**Alternatives rejected:** Separate seller account with separate login — rejected because it creates two silos. Sellers registering directly as sellers — rejected because it bypasses the vetting process and admin approval gate.

**Implications:** The User model has `isSeller`, `sellerStatus` (none/pending/approved/suspended/rejected), `sellerProfile` (businessName, businessAddress, description, kraPin, mpesaNumber), `sellerApprovedAt`, `sellerSuspendedAt`. All four user controller responses (login, register, getProfile, updateProfile) must include `isSeller` and `sellerStatus`. Admin changes seller status via `PUT /api/users/:id/seller-status`.

---

## DEC-007 — Anonymous Enquiry Submissions Rejected at Backend
**Date:** June 2026 | **Status:** FINAL

**Decision:** `POST /api/enquiries` requires the `protect` middleware. No anonymous form submissions are accepted. Logged-out users are redirected to `/login` before they can submit any form.

**Why:** Anonymous submissions would populate the database with `userId: null` records that are orphaned — they appear nowhere on AdminUserDetailPage and cannot be linked to any user account. This makes them impossible to act on in support contexts. They also open the platform to trivial DOS attacks through repeated dummy form submissions. The foreign key chain that makes AdminUserDetailPage work depends on `userId` being set on every enquiry.

**Alternatives rejected:** `optionalAuth` middleware allowing anonymous submissions — this was actually tried initially. The result was that `userId` was always `null` because the frontend forms never sent an Authorization header even when the user was logged in. This was discovered in Session 007 when all enquiry sections on AdminUserDetailPage were empty.

**Implications:** Every frontend form that posts to `/api/enquiries` must include the Authorization header: `{ headers: { Authorization: 'Bearer ${userInfo.token}' } }`. Every form must also check `if (!userInfo)` at the start of the submit handler and redirect to `/login` with `state: { from: location.pathname }` before doing anything else. Both the frontend gate and the backend protect middleware must exist.

---

## DEC-008 — BecomeSellerPage Submission Upserts User Document Immediately
**Date:** June 2026 | **Status:** FINAL

**Decision:** When a seller application is submitted, `enquiryController.createEnquiry` immediately upserts the User document with all seller profile fields from the form payload — `isSeller: true`, `sellerStatus: 'pending'`, `businessType: 'business'`, `businessName`, `phone`, `county`, `sellerProfile.businessName`, `sellerProfile.description`, `sellerProfile.kraPin`, `sellerProfile.mpesaNumber`. The Enquiry document is still created as the audit trail.

**Why:** Without the upsert, all seller data (KRA PIN, M-Pesa number, business description, county) lived only in the Enquiry's `data` field and was never reconciled onto the User document. When admin approved the seller, the `sellerProfile` sub-document got created but the main User document (phone, county, businessName) still reflected whatever the user had typed on ProfilePage, potentially months earlier with different information. Two conflicting sets of data for the same person.

**Alternatives rejected:** Reconcile fields only when admin approves — rejected because it creates a gap where seller data is inconsistent between the enquiry and the user document. Require seller to first update ProfilePage and then apply — rejected because it's poor UX and creates a two-step process with no enforcement.

**Implications:** The User document is the single source of truth for all seller profile data. The Enquiry document is the audit trail and admin review queue entry only. AdminUserDetailPage reads from the User document — so seller info appears correctly as soon as the application is submitted.

---

## DEC-009 — Payment Model Is Single Source of Truth for All Payment Activity
**Date:** June 2026 | **Status:** FINAL

**Decision:** One Payment document is created per order, regardless of method. STK Push, manual M-Pesa, bank transfer, and cash all create and update the same Payment document. The `confirmPayment` function in `paymentController.js` is the canonical payment confirmation function — all payment paths call it.

**Why:** Having separate payment code paths for different methods (STK Push vs manual vs bank) would diverge over time and create inconsistencies in how `Order.isPaid` gets set, how notifications are triggered, and how payouts are calculated. The five-step confirmation sequence (update Payment → mark Order.isPaid → set Order.paidAt → link Order.paymentId → advance Order.status → create Notification) must always run together as one atomic operation.

**Alternatives rejected:** Storing payment data directly on the Order document — rejected because it makes payment history impossible to query separately and couples payment and order data too tightly. Separate Payment models per method — rejected because it creates fragmentation and inconsistency in the confirmation flow.

**Implications:** Step 20 (M-Pesa STK Push via Daraja) must call the existing `confirmPayment` function from the Daraja callback, not build a separate confirmation path. `Order.paymentId` is the foreign key linking every order to its Payment document. Only one Payment document per order — `createPayment` checks for an existing record and rejects duplicates.

---

## DEC-010 — New Arrivals and Featured Are Dedicated Pages, Not Homepage States
**Date:** June 2026 | **Status:** FINAL

**Decision:** `/new-arrivals` and `/featured` are standalone pages. The "View All" links on the homepage navigate to these dedicated routes. They are not filtered states of the homepage browse mode.

**Why:** Option A was to wire `sort=newest` and `featured=true` params through the productSlice to homepage browse mode. The problem: this would land the user on a page visually identical to the homepage with no contextual heading, no clear sense of purpose, and no back navigation. A filtered homepage state would confuse users who think they're still on the homepage.

**Alternatives rejected:** Option A (wire params to homepage browse mode) — rejected because the UX destination is unclear and the page has no identity of its own.

**Implications:** Both pages use the working page design system with the eyebrow pill pattern. `NewArrivalsPage` dispatches `listProducts({ sort: 'newest' })` with no limit. `FeaturedPage` dispatches `listProducts({ featured: true })` with no limit. `productSlice.js` was updated to append `sort` and `featured` params to the query string.

---

## DEC-011 — Seller-Submitted Products Are Never Publicly Visible Until Admin Approves
**Date:** June 2026 | **Status:** FINAL

**Decision:** All seller product submissions always start with `status: 'submitted'`. Only products with `status: 'approved'` appear on the public storefront. Admin must explicitly change the status to approve a product.

**Why:** Allowing seller products to go live without admin review would let unvetted listings appear publicly. This creates risks for buyers: misleading product descriptions, inappropriate images, contact details embedded in descriptions (which would violate the golden rule), AI-generated renders without real stock backing, and TikTok screenshots with watermarks showing competitor contact information.

**Alternatives rejected:** Auto-approve after a time delay — rejected because any delay still creates a window where unreviewed products are live. Manual review only for flagged products — rejected because there is no way to know a product needs review without seeing it first.

**Implications:** `getProducts` filters to `{ status: 'approved' }` by default. The `optionalAuth` middleware on `GET /api/products` passes the request through even without a token but sets `req.user` if a token is present — this lets the backend check `req.user?.isAdmin` and skip the status filter for admin users. All 66 existing products were backfilled to `status: 'approved'` on June 12, 2026 using: `db.products.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } })`. This will never need to be run again.

---

## DEC-012 — Reviews Are for Verified Purchasers Only
**Date:** June 2026 | **Status:** FINAL

**Decision:** A user can only review a product if they have a delivered order containing that product. The backend queries the Order collection before saving any review. The frontend shows "Verified purchases only" to users without a qualifying order.

**Why:** Without this gate, competitors could create accounts purely to leave bad reviews on rival seller products. A seller could also leave bad reviews on competitors' listings. Review credibility depends entirely on reviews coming from genuine buyers who have actually received the product. "Delivered" status (not just "paid") is required because a buyer should have received the goods before reviewing.

**Alternatives rejected:** No restriction on reviews — rejected because it is trivially gameable and destroys credibility. Email verification only — rejected because it confirms the email address, not that someone bought the product. Rating-only reviews without text — rejected as too limited for meaningful buyer feedback.

**Implications:** `createProductReview` in `productController.js` runs `Order.findOne({ user: req.user._id, status: 'delivered', 'orderItems.product': product._id })` before allowing a review. The frontend `useEffect` in `ProductPage.jsx` checks `GET /api/orders/myorders` on mount and sets `verifiedPurchase` state. Both checks are independent — the backend check is the real enforcement. `item.product?.toString() === id` is used to handle both string and ObjectId returns safely.

---

## DEC-013 — County Field Is Always a Dropdown, Never Free Text
**Date:** June 2026 | **Status:** PERMANENT

**Decision:** Every county field across the entire platform uses a `<select>` element populated with the `COUNTIES` array (47 Kenyan counties). Free text input is never accepted for county.

**Why:** Free text county inputs produce spelling variants (Nairobi vs Nairobi County vs nairobi vs NAIROBI) that break county-based shipping calculations. The `getShippingRate` function in `shippingRates.js` does exact string matching against county names — even a single space difference would cause it to fall through to the default rate. The county field directly drives delivery pricing, so data inconsistency has a direct financial impact.

**Alternatives rejected:** Free text with autocomplete — rejected because it still allows variants that bypass the lookup. Normalising text on the backend — rejected because it adds complexity and still misses unexpected edge cases.

**Implications:** The `COUNTIES` array currently lives in `BecomeSellerPage.jsx` and `BulkOrdersPage.jsx`. When a third usage appears, extract to a shared constants file at `frontend/src/constants/counties.js`. Every form that collects county information must use a select element.

---

## DEC-014 — Admin Pages Break Out of Bootstrap Container with Negative Margins
**Date:** June 2026 | **Status:** FINAL

**Decision:** Admin pages use `margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); width: 100vw` to break out of the App.jsx Bootstrap Container and achieve full-width layout.

**Why:** Admin pages need full-width layout for their data tables, tab bars, and count pill headers. The App.jsx Bootstrap Container constrains the max-width. Removing the Container from App.jsx would require checking every non-admin page to ensure they still render correctly — a large and risky change. The negative margin technique is self-contained within each admin page and requires no changes to App.jsx.

**Alternatives rejected:** Remove Container from App.jsx entirely — rejected because it would require auditing every page for layout breakage. Conditionally render Container per route in App.jsx — rejected as complex and fragile. Route-specific Container wrapping inside each page — considered but the negative margin pattern is simpler and already working.

**Implications:** Every admin page must use this breakout pattern. It is the gold standard. The Container stays in App.jsx untouched. `AdminUserDetailPage` uses the `.aud-page` class which applies this breakout via CSS.

---

## DEC-015 — Notification Type Enum Has Exactly Two Values
**Date:** June 2026 | **Status:** FINAL

**Decision:** The `Notification` model `type` field only accepts `'transactional'` or `'promotional'`. No other type values are used in notification creation calls without first adding them to the enum in `backend/models/Notification.js`.

**Why:** This decision was made after a real bug: `paymentController.js` was initially written with `type: 'payment'` which is not in the enum. Mongoose validation fails silently — the notification is simply not saved, no error is thrown in the calling code, and the buyer receives no notification. This bug was discovered only when testing payment confirmation and checking the notification bell.

**Alternatives rejected:** Granular types like `payment`, `order`, `seller`, `system` — rejected because each new type requires updating the enum, and any mismatch causes a silent failure that is difficult to debug.

**Implications:** All notification creation in `orderController.js`, `paymentController.js`, `productController.js`, and future controllers must use `type: 'transactional'` for operational events and `type: 'promotional'` for marketing. Before adding any new notification type, the model enum must be updated first.

---

## DEC-016 — Splash Screen Inline CSS Is the One Documented Exception
**Date:** June 2026 | **Status:** FINAL

**Decision:** The pre-React splash screen in `index.html` uses inline styles and a `<style>` block. This is the only permitted use of inline CSS in the entire project.

**Why:** No CSS files exist when `index.html` first renders. Component CSS files load only after React mounts and Vite processes the module graph. There is no way to link an external stylesheet to content that renders before React initialises. The inline CSS in the `<style>` block at the bottom of `index.html` keeps the keyframe animations clean and readable. The inline styles on the individual `<div>` elements within the splash are unavoidable.

**Alternatives rejected:** No splash screen — rejected because the blank white flash during JavaScript initialisation is poor UX. Component-based splash rendered by React — rejected because it still creates a white flash before React mounts.

**Implications:** The splash in `index.html` disappears the moment React mounts. It is removed from the DOM on first render and will never interact with component CSS. The inline CSS exception applies only to this file. Every other file in the codebase follows the zero inline styles rule.

---

## DEC-017 — Product Analytics Deferred to Step 17
**Date:** June 2026 | **Status:** FINAL

**Decision:** Product analytics (search impressions, click-through rates, add-to-cart rates, conversion rates, sponsored impression tracking, seller exposure distribution) are deferred to Step 17 and will not be built before the ranking and filtering system exists.

**Why:** Building analytics in isolation creates orphaned data — fields are populated in the database but there is no UI to read them, no ranking system to act on them, and no admin dashboard to surface insights. Analytics only become useful when the system that consumes them (the hybrid ranking model in Step 17) exists alongside them.

**Alternatives rejected:** Build analytics on product creation and submission immediately — rejected because data would accumulate with no consumer. Build a lightweight analytics dashboard first — rejected because it creates scope creep and delays higher-priority features.

**Implications:** Step 17 covers filtering, sorting, ranking, pagination, and analytics together as one complete system. The ranking model agreed in chat: relevance first, availability second, trust/reliability third, fair visibility rotation for new sellers, sponsored placement (clearly labelled, capped, category-relevant). First 10 results mix: 6 strong organic, 2 rotating eligible sellers, 1 new seller discovery slot, 1 clearly labelled sponsored result.

---

## DEC-018 — One Payment Per Order, Two-Payment Scenario Not Built
**Date:** June 2026 | **Status:** FINAL

**Decision:** ShopZone enforces exactly one payment per order. `createPayment` checks for an existing Payment document for the order before creating a new one and rejects duplicates. Split payments across two methods or two M-Pesa transactions are not supported.

**Why:** Multiple payments on one order create a reconciliation problem — how much of each payment applies to which part of the order? How do partial payments interact with the escrow hold and payout release? These questions add significant complexity that is not warranted at the current scale. STK Push in Step 20 solves the accuracy problem by pushing the exact order amount to the buyer's phone — no partial payment scenario arises.

**Alternatives rejected:** Allow two payments summing to order total — rejected because the reconciliation logic is too complex and error-prone at this stage. Allow deposit plus balance (partial payment model) — this is Step 21 scope and will be built properly then with explicit deposit amount fields and balance tracking.

**Implications:** All buyer-facing copy should discourage partial payments. If a buyer accidentally pays the wrong amount, admin edits the payment record amount before confirming (the edit payment flow built in Session 010) and then confirms at the correct amount.

---

## DEC-019 — Password Change Removed from ProfilePage Inline Form
**Date:** June 2026 | **Status:** FINAL

**Decision:** Inline password change has been removed from the ProfilePage account settings form. Password changes require email verification via the `/forgot-password` reset flow (Step 24). A placeholder link to `/forgot-password` exists in the Security section of ProfilePage.

**Why:** Allowing inline password change on an already-logged-in session creates a security risk: anyone with access to an unlocked device could silently change the account owner's password and lock them out of their business account, losing access to their order history, procurement data, and saved delivery addresses. Wholesale buyers' accounts contain significant business value — this risk is unacceptable.

**Alternatives rejected:** Require current password confirmation before change — considered but rejected because it still allows the attack if the attacker knows the current password (common in shared device scenarios). Require email confirmation only — this is the chosen path in Step 24.

**Implications:** The `updateUserProfile` function in `userController.js` no longer handles `req.body.password`. Password state variables were removed from `ProfilePage.jsx`. Step 24 must build: `/forgot-password` page, reset token fields on User model, reset token expiry, email send via Nodemailer or SendGrid, and a separate `/reset-password/:token` page.

---

## DEC-020 — Seller Product Image Is Required at Submission
**Date:** June 2026 | **Status:** FINAL

**Decision:** Sellers must upload a product image before they can submit a product for review. The submit button is disabled until an image has been successfully uploaded and the stock confirmation checkbox is ticked. Products cannot be submitted with the `/images/sample.jpg` placeholder.

**Why:** Admin cannot meaningfully review a product submission without seeing what the product looks like. The approval workflow exists specifically so admin can check product images for phone numbers, watermarks, TikTok screenshots, AI-generated renders, and inappropriate content before anything goes public. Reviewing an empty placeholder defeats the entire purpose.

**Alternatives rejected:** Allow submission with placeholder and upload image separately — rejected because it splits the review into two stages and admin cannot see both together. Make image optional — rejected because it would allow products to go live with no visual representation.

**Implications:** The photography policy is enforced via admin review, not automated detection. Automated detection (phone numbers in images, AI render detection, explicit content) requires Cloudinary's moderation add-on — planned in Step 22. Until then, admin manually checks images during product approval. The submission form includes a clear tip panel explaining the photography policy: no watermarks, no phone numbers, no TikTok screenshots, no AI renders.

---

## DEC-021 — Admin Communication Layer Is a Dedicated Step
**Date:** June 2026 | **Status:** PLANNED

**Decision:** The admin-to-user communication system (composer with prefilled To field, branded ShopZone email template, simultaneous in-app notification + email send) is a dedicated roadmap step positioned between Step 15 (support tickets) and Step 24 (email infrastructure).

**Why:** Admin needs to contact users for multiple reasons: reply to support tickets, send RFQ quotes, send Tier 2 shipping estimates, send seller approval decisions. These all follow the same pattern: admin opens a composer, writes a message, and sending creates both an in-app Notification document (picked up by the bell immediately) and sends a branded email. For RFQ and Tier 2 quotes specifically, the quote amount is structured data and the email has approve/reject buttons that update order/RFQ status directly.

**Implications:** This step depends on Step 24 (email infrastructure) for the actual email sending. The Notification model already supports the in-app component. When this step is built, it connects the existing notification system to an outbound email provider.

---

## DEC-022 — Payout Automation Is B2C M-Pesa Daraja (Step 20)
**Date:** June 2026 | **Status:** PLANNED

**Decision:** Seller payout automation uses Safaricom Daraja B2C API. When admin clicks "Release Payout," the system automatically transfers the seller's earnings to their `sellerProfile.mpesaNumber`. For the MVP (before Step 20), admin releases payout manually — the system records the release but admin physically sends the money.

**Why:** Daraja has two APIs: STK Push (customer pays in to ShopZone) and B2C (ShopZone pays out to a number). B2C is the correct tool for seller payouts. Bank transfer automation would require a banking API partner, which is significantly more complex and regulated.

**Alternatives rejected:** Manual bank transfer only — valid for MVP but cannot scale. Third-party payout aggregator — considered but adds a layer of cost and complexity. Seller wallet within ShopZone — rejected because it would require a payment service provider licence.

**Implications:** Step 20 covers both STK Push (buyer payment) and B2C (seller payout). The seller's M-Pesa number is already collected in `sellerProfile.mpesaNumber`. The payout release flow in `orderController.js` (the `releaseSellerPayout` function) will be updated in Step 20 to trigger a Daraja B2C transfer automatically.

---

## Template for New Decisions

```markdown
## DEC-XXX — [Short Descriptive Title]
**Date:** [DATE] | **Status:** FINAL / PLANNED / REVISIT

**Decision:** [What was decided — one or two clear sentences]

**Why:** [The reasoning. What problem does this solve? What would happen if we didn't make this decision?]

**Alternatives rejected:** [What else was considered and why it was rejected]

**Implications:** [What this means for the codebase, for future decisions, for the team]
```
