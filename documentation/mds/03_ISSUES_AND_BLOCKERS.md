# ShopZone — Issues & Blockers

> Every open issue, bug, and blocker on the ShopZone build — active and resolved.
> Updated through: SESSION-012 + documentation sync (June 23, 2026)
>
> **Rules for this document:**
> - When a new issue is found mid-session, add it here immediately before the session ends
> - When an issue is resolved, move it to the Resolved section at the bottom with the resolution date and exactly what was done
> - Every issue must have a Next Action — not just a description. "Fix it" is not a next action
> - Issues without next actions are useless

---

## Priority Key

| Priority | Meaning |
|----------|---------|
| 🔴 CRITICAL | Blocks revenue, data integrity, or core user flows |
| 🟠 HIGH | Significant UX or admin functionality gap — users are affected right now |
| 🟡 MEDIUM | Quality or completeness issue — does not block core flows |
| 🟢 LOW | Technical debt or minor polish — nothing breaks without it |

---

## Build Order (do issues in this exact sequence)

1. ISS-011 (wire ScrollableTabBar into AdminProductListPage)
2. ISS-012 (inspect AdminUserDetailPage for possible ScrollableTabBar use)
3. ISS-013 / Step 11 (snapshot wholesale unit fields and build unit sanity-check displays)
4. ISS-014 (rewrite ReturnsPolicyPage around buyer-fault vs seller-fault returns)
5. ISS-006 (low stock notifications)
6. Step 7 (admin product approval full workflow with audit history)
7. Step 15 (support tickets + returns/dispute flow)
8. Step 16 (escrow and payout hold UI)
9. Step 20 (M-Pesa STK Push + B2C payouts/refunds via Daraja)
10. Step 23 (backend request validation)
11. Step 24 (forgot password + email infrastructure)
12. Step 35 (logistics-only pickup and consolidation service)
13. Step 22 (Cloudinary image storage)

---

---

## 🟠 ISS-004 — Screenshot Upload Missing from All Enquiry Forms

**Opened:** Session 007 (June 9, 2026)
**Priority:** HIGH
**Linked step:** Step 15
**Status:** RESOLVED in SESSION-012

### Resolution note

SESSION-012 closed this issue without adding Multer directly to `POST /api/enquiries`. The direction taken was the pre-uploaded URL/path approach through the already protected `/api/upload` endpoint. The Enquiry model gained an `attachments` array of string paths/URLs, and `enquiryController.createEnquiry` saves `attachments` defensively only when the request body value is an array.

ContactPage, BulkOrdersPage, and BecomeSellerPage now each support up to three optional uploaded images, preview/removal before submit, and form reset after successful submission. The same screenshot capability was also added to the OrderPage Report Issue form because that is the most natural evidence path for damaged, wrong-item, payment, or delivery problems.

AdminEnquiriesPage now displays attachments as clickable thumbnails in the detail panel. The issue remains here for historical context, but no further ISS-004 work is active.

### What the problem is

ContactPage, BulkOrdersPage, and BecomeSellerPage all have text form fields but no file upload field. When a buyer or seller applicant wants to describe a problem — a wrong item received, a payment discrepancy, a damaged product, a technical issue on the platform — they have no way to attach a screenshot showing what they are seeing. They are forced to describe the problem in words, which is often impossible when the issue is visual.

The Enquiry model currently has no `attachments` array. Even if a user somehow uploaded a file, there is nowhere to store the reference. Admin cannot see any attachments in AdminEnquiriesPage or in the AdminUserDetailPage expanded enquiry rows.

This is specifically a user-facing upload — not admin uploading screenshots. The user submits the form and attaches supporting evidence. Admin sees it during review.

### Why it matters

Support quality is degraded because admin cannot see what the user is seeing. Users resort to vague descriptions like "the order was wrong" without being able to show the invoice or the photo of the damaged goods. Resolving support tickets takes longer than it should. Sellers who have billing questions cannot easily show a screenshot of what they're looking at.

### Files that need to change

- `backend/models/Enquiry.js` — add `attachments` array field: `[{ url: String, uploadedAt: Date }]`
- `backend/controllers/enquiryController.js` — save `req.body.attachments` array when creating enquiry
- `backend/routes/enquiryRoutes.js` — add Multer middleware to the POST route to handle file uploads, OR accept pre-uploaded URLs from the `uploadRoutes.js` endpoint
- `frontend/src/pages/ContactPage.jsx` — add file upload input, upload to `/api/upload` first, store returned URL, include in enquiry payload
- `frontend/src/pages/BulkOrdersPage.jsx` — same as ContactPage
- `frontend/src/pages/BecomeSellerPage.jsx` — same as ContactPage
- `frontend/src/pages/AdminEnquiriesPage.jsx` — show attachments in the side detail panel
- `frontend/src/pages/AdminUserDetailPage.jsx` — show attachments in the expanded enquiry row

### Next action

None. Resolved. Future attachment work belongs under Step 15 support/dispute evidence handling or Step 22 Cloudinary storage, not ISS-004.

---

## 🟠 ISS-005 — AdminEnquiriesPage Missing Support Tab

**Opened:** Session 010 (June 13, 2026)
**Priority:** HIGH
**Linked step:** Step 15
**Status:** RESOLVED in SESSION-012

### Resolution note

SESSION-012 added a Support tab to AdminEnquiriesPage, inserted directly after Unread so order-linked support reports are visible early. The detail panel now renders a Related Order card when `enquiry.orderId` exists, including a short order reference, order total, status, and direct View Order link. The UI handles both populated order objects and raw ObjectId values defensively.

AdminEnquiriesPage also gained list-row badges for "Order linked" and attachment counts, plus an Attachments section for screenshot thumbnails. Support reports created from OrderPage/ProfilePage now have a dedicated admin path and visible order context.

### What the problem is

AdminEnquiriesPage currently has type tabs for: All, Unread, Bulk Orders, Seller Applications, Contact, General. There is no Support tab.

Support-type enquiries are created by the Report Issue form on OrderPage — when a buyer clicks "Report an Issue with this Order", a `type: 'support'` enquiry is created with the `orderId` field set. These enquiries have no dedicated view. They are mixed in with general contact forms and bulk order requests in the All tab. Admin has no efficient way to filter to active support cases.

The `orderId` field exists on the Enquiry model (added in Session 009) and is populated in `getEnquiries` and `getEnquiryById`. But it is not displayed in the AdminEnquiriesPage detail panel, and there is no way to navigate from the enquiry to the related order.

Buyers who submit a Report Issue form also receive no confirmation that their report reached admin. There is no notification sent when a support enquiry is created.

### Why it matters

Admin cannot efficiently manage support tickets. Without a dedicated tab, support cases are lost in the noise of seller applications and general contact forms. The `orderId` link — which is the most useful piece of information on a support enquiry — is never shown to admin. Admin has to ask the buyer for their order ID even though it is already stored on the enquiry document.

### Files that need to change

- `frontend/src/pages/AdminEnquiriesPage.jsx` — add Support tab to the type filter tab bar, display `orderId` prominently in the detail panel with a direct link to `/order/:id`, add Support count badge in the header count pills strip
- `frontend/src/pages/AdminEnquiriesPage.css` — any new styles for the orderId display and link

### Next action

None. Resolved. Full ticket lifecycle work continues later under Step 15; this issue only covered the Support tab and related order visibility.

---

## 🟡 ISS-006 — Low Stock Notifications Not Wired in createOrder

**Opened:** Session 010 (June 13, 2026)
**Priority:** MEDIUM
**Linked step:** Step 11
**Status:** OPEN

### What the problem is

When an order is placed and `createOrder` in `orderController.js` runs the atomic stock decrement loop, it decrements `countInStock` on each product. If a product's `countInStock` drops below a threshold (suggested: 5 units), the seller is not notified. Sellers discover stockouts only when they next visit their dashboard, or when orders start failing because stock has hit zero.

The notification infrastructure is already in place — `orderController.js` imports `Notification` and creates notifications for other order events. The low stock notification is purely missing — it just was never built.

The seller's `_id` is available via `product.seller` on the Product document. The notification should link to `/seller/dashboard` so the seller can update their stock.

### Why it matters

Sellers cannot proactively restock. A product going out of stock without warning means buyers see "Out of Stock" on the product page and cannot order, which directly costs revenue. Sellers who manage multiple products cannot reasonably check each product's stock level every day — they need a push notification.

### Files that need to change

- `backend/controllers/orderController.js` — inside `createOrder`, after the stock decrement loop that runs `await product.save()` for each item, add a check: `if (product.seller && product.countInStock <= 5 && product.countInStock > 0)` → create a `Notification` to `product.seller`. Wrap in try/catch. If stock hits exactly 0, use a different message: "Out of Stock Warning" rather than "Low Stock Warning".

### Next action

Paste the current `backend/controllers/orderController.js` before writing any code — the file has changed significantly since it was last read and the exact location of the decrement loop needs to be confirmed before inserting notification code.

---

## 🟡 ISS-007 — Payment Amount Validation: No Check Before Confirmation

**Opened:** Session 010 (June 13, 2026)
**Priority:** MEDIUM
**Linked step:** Before Step 20
**Status:** OPEN

### What the problem is

Admin can currently confirm a payment where the amount recorded on the Payment document is materially different from the order total. There is no check in `confirmPayment` that prevents a KES 9 payment amount from being confirmed against a KES 100,000 order.

The scenario: Admin creates a payment record, mistakenly types KES 9 as the amount when setting up the record, then pastes the wrong M-Pesa SMS in the confirmation form. The backend currently accepts this and marks the order as `isPaid: true`.

The `Edit Amount` functionality was built in Session 010 to correct the amount before confirming. But there is nothing preventing admin from clicking Confirm Payment anyway even when the amount is wrong.

The fix should be a backend validation in `confirmPayment` in `paymentController.js` that rejects confirmation if `payment.amount < order.totalPrice * 0.95`. The 5% tolerance handles rounding differences that can occur across payment methods.

### Why it matters

A data entry error when pasting or typing a payment amount could mark a large wholesale order as paid when only a tiny fraction was actually received. On wholesale orders of KES 50,000–200,000, this would be a significant financial loss. The admin UI already shows the order total and the payment amount side by side — this validation closes the gap where a human error slips through.

### Files that need to change

- `backend/controllers/paymentController.js` — in `confirmPayment`, after fetching the order, add: `const minimumAcceptable = order.totalPrice * 0.95; if (payment.amount < minimumAcceptable) { return res.status(400).json({ message: '...' }); }`. The error message should tell admin what the minimum acceptable amount is and what the current recorded amount is.
- `frontend/src/pages/OrderPage.jsx` — the admin payment attachment panel already shows the order total and payment amount, and flags amounts below 95% with an orange warning. Confirm this warning is visible and prominent before confirming.

### Next action

Paste `backend/controllers/paymentController.js` before writing any code — the function has been modified multiple times and the exact position of the order fetch and status update blocks needs to be confirmed.

---

## 🟡 ISS-008 — Corrupted Characters in Multiple Files (Step 1)

**Opened:** Session 001/002 (May 2026)
**Priority:** MEDIUM
**Linked step:** Step 1
**Status:** OPEN — Not yet actioned

### What the problem is

Several files contain mojibake (corrupted UTF-8 characters) from copy-paste operations. These appear as broken box-drawing characters, broken dashes, broken check/cross/info symbols, broken footer arrows, and broken copyright text. They are present in both component files (visible in rendered UI potentially) and in code comments (making files harder to read and maintain).

Known affected files:
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

productController.js and orderController.js were confirmed clean in Session 003. The other files have not been checked.

### Why it matters

Currently non-blocking — the app works. But corrupted characters in comment dividers make files hard to grep and maintain. If any corrupted characters appear in visible UI strings (error messages, labels, footer text), buyers or sellers would see garbage characters. Running a frontend build after cleanup is the only way to confirm nothing is rendered incorrectly.

### Next action

Do a global search in the project for non-ASCII characters. Use VS Code's search with regex: `[^\x00-\x7F]` to find all files with non-ASCII content. Check each file and replace corrupted comment dividers with plain ASCII (`// ─────────────────────` or `// ===================`). Replace any corrupted visible UI symbols with React Icons from `react-icons/fa`. Run `npm run build` in the frontend folder after cleanup to confirm no rendering issues.

---

## 🟡 ISS-009 — No Dedicated Admin Order Detail Page

**Opened:** Session 004 (June 7, 2026)
**Priority:** MEDIUM
**Linked step:** Post Step 15
**Status:** OPEN — Deliberately deferred

### What the problem is

When admin clicks "View" on any order in AdminOrderListPage, they are taken to the same `/order/:id` page that the customer sees. Admin sees the same view as the buyer — order items, delivery status, payment status, and the Report Issue form. Admin does not see a complete operational picture of the order.

What admin needs to see but currently cannot:
- Full buyer contact details (name, email, phone, county)
- The full payment record including raw M-Pesa SMS and internal notes
- Delivery quote history (who sent the quote, when, at what amount)
- Seller quote submission history
- Platform commission amount
- Link to AdminUserDetailPage for this buyer
- All enquiries and support tickets linked to this order
- Order status change log

### Why it matters

Admin currently has to cross-reference between the customer-facing OrderPage, the AdminUserDetailPage, and AdminEnquiriesPage to get a complete picture of any single order. This is inefficient and means admin may miss connections between a support ticket and an order.

### Next action

Defer until after Step 15 (support tickets). The admin order detail page will need to show support tickets linked to the order, so building it before the ticket system exists would require rebuilding it immediately. Plan: new route `/admin/orders/:id`, new `AdminOrderDetailPage.jsx`, new backend endpoint `GET /api/orders/:id/admin` (admin only) that returns the full order with all populated fields including payment, buyer, and enquiries.

---

## 🟢 ISS-010 — MobileDrawer Mounts When Closed (Accessibility, Step 2)

**Opened:** Session 002 (May 2026)
**Priority:** LOW
**Linked step:** Step 2
**Status:** OPEN — Deliberately deferred until Step 2

### What the problem is

The MobileDrawer component mounts in the DOM even when it is visually closed. It uses CSS to hide the drawer (typically `transform: translateX(-100%)` or similar). This means assistive technologies — screen readers, keyboard navigation — can reach the drawer content even when a sighted user cannot see it. A screen reader user tabbing through the page would encounter all the drawer nav links unexpectedly.

The Lighthouse accessibility audit from May 25, 2026 flagged this. Score was 95 — this issue was part of what kept it from being higher.

### Why it matters

Screen reader users would hear or navigate into navigation links that appear to be invisible to them. This is a WCAG 2.1 violation (SC 4.1.2). The drawer has a `role="dialog"` and `aria-modal` but these only help when the dialog is actually open.

### Next action

In `MobileDrawer.jsx`, add `aria-hidden={!isOpen}` to the root wrapper element. Alternatively, conditionally render the drawer only when open using a state gate, while keeping the CSS exit animation using a separate mounted/unmounted state pattern. Confirm focus trap still works correctly when open and focus is restored to the hamburger button when closed (this was already partially implemented).

---

## 🟢 ISS-011 — ShopZoneLogo Uses Inline Styles (Step 2)

**Opened:** Session 002 (May 2026)
**Priority:** LOW
**Linked step:** Step 2
**Status:** OPEN — Deliberately deferred until Step 2

### What the problem is

`ShopZoneLogo.jsx` uses inline `style={{}}` props for size variants, gap, font size, and colour adjustments. This violates the zero inline styles rule and makes it harder to maintain consistent logo sizing across the app. It also makes debugging visual issues harder since the styles are not in a CSS file where they can be inspected with DevTools in the normal way.

### Why it matters

Minor code quality and maintainability issue. The logo appears in the Header, on admin pages, and in the splash screen. Any change to logo sizing requires hunting through the JSX rather than editing a CSS class.

### Next action

In `ShopZoneLogo.jsx`, remove all `style={{}}` props. Move size and colour variant logic to CSS classes in `ShopZoneLogo.css` using BEM modifiers: `.shopzone-logo--sm`, `.shopzone-logo--lg`, `.shopzone-logo--dark`, etc. Update any component that passes size/colour props to pass className modifiers instead.

---

---

## ✅ Resolved Issues

---

### ✅ ISS-R01 — Frontend Forms Not Sending Auth Token (userId Always Null on Enquiries)

**Opened:** Session 007 (June 9, 2026)
**Resolved:** Session 008 (June 11, 2026)
**Priority was:** CRITICAL

**What the problem was:** BecomeSellerPage, ContactPage, and BulkOrdersPage all posted to `POST /api/enquiries` using plain `axios.post()` with no `Authorization` header — even when the user was fully logged in. The enquiry route was using `optionalAuth` middleware which only set `req.user` if a Bearer token was present in the request. Since no token was sent, `req.user` was always `undefined`, and `userId` on every enquiry was always saved as `null`. This meant that every enquiry submitted through any form had `userId: null`, making it impossible to link enquiries to user accounts. AdminUserDetailPage's enquiries section was always empty even for users who had submitted forms.

**How it was discovered:** When AdminUserDetailPage was built in Session 007, the enquiries section showed empty for every user. The aggregation query was correct (`Enquiry.find({ userId: req.params.id })`), but the data was missing because `userId` was never saved.

**How it was fixed:**
1. `backend/routes/enquiryRoutes.js` — POST route changed from `optionalAuth` to `protect` middleware. `optionalAuth` helper function removed entirely from the file. Anonymous submissions now receive a 401 and nothing is saved.
2. `backend/controllers/enquiryController.js` — `userId` assignment changed from `req.user?._id` (optional chaining that could produce null) to `req.user._id` (unconditional, since `protect` now guarantees `req.user` is set).
3. `frontend/src/pages/ContactPage.jsx` — `useNavigate`, `useLocation`, `useSelector` added to imports. `handleSubmit` checks `if (!userInfo)` at the start and redirects to `/login` with `state: { from: location.pathname }`. `axios.post` call now includes `{ headers: { Authorization: 'Bearer ${userInfo.token}' } }`.
4. `frontend/src/pages/BulkOrdersPage.jsx` — same pattern as ContactPage.
5. `frontend/src/pages/CartPage.jsx` — `checkoutHandler` redirect updated from `navigate('/login?redirect=shipping')` to `navigate('/login', { state: { from: '/shipping' } })` so LoginPage can read `location.state.from`.
6. `frontend/src/pages/ProductPage.jsx` — `submitReviewHandler` checks `userInfo` before dispatching. If null, navigates to `/login` with `state.from` set to `/product/:id`.

---

### ✅ ISS-R02 — orderController Never Created Notification Documents

**Opened:** Session 007 (June 9, 2026)
**Resolved:** Session 009 (June 12, 2026)
**Priority was:** CRITICAL

**What the problem was:** `orderController.js` had zero `Notification` imports and zero `new Notification()` calls anywhere in the file. Every significant order event — order placed, delivery quote sent, quote approved by buyer, order delivered, seller payout released — happened without any notification being created. The `Notification` collection in MongoDB was effectively empty for all order events. The notification bell always showed empty even when real things were happening to orders.

**How it was fixed:** `Notification` was imported at the top of `orderController.js`. Five notification creation blocks were added, all wrapped in try/catch so a notification failure never crashes the order operation:

| Event | Function | What the notification says |
|-------|----------|---------------------------|
| Order placed | `createOrder` | "Your order #XXXXXXXX has been placed successfully. [Total or 'quote required for delivery']" |
| Delivery quote sent | `sendDeliveryQuote` | "A delivery quote of KES X has been sent for order #XXXXXXXX. Please review and approve or reject it." |
| Quote rejected (order cancelled) | `rejectDeliveryQuote` | "You rejected the delivery quote for order #XXXXXXXX. The order has been cancelled and stock restored." |
| Order delivered | `updateOrderToDelivered` | "Your order #XXXXXXXX has been marked as delivered. If you have any issues, please report from your order page." |
| Payout released | `releaseSellerPayout` | "The seller payout for order #XXXXXXXX has been released. KES X sent to supplier." (goes to buyer as placeholder — will go to seller in Step 5) |

All five use `type: 'transactional'`, set `relatedOrderId`, and set `link: '/order/${order._id}'`.

The `Notification` model also gained a `link` field (String, default null) in this session so every notification carries its own navigation destination. `NotificationBell.jsx` was updated to use `notif.link` first, falling back to `relatedOrderId` for older notifications without the link field.

---

### ✅ ISS-R03 — Seller Product Submission Architecture Did Not Exist

**Opened:** Session 007 (June 9, 2026)
**Resolved:** Session 009 (partially) + Session 010 (fully) (June 12–13, 2026)
**Priority was:** CRITICAL

**What the problem was:** The SellerDashboardPage My Products tab showed a placeholder message telling sellers to "Contact ShopZone to submit products." There was no product creation form, no backend route for seller product submission, and no code path that ever set `seller: req.user._id` on a Product document. Every Product in the database either had no `seller` field (seeded products, admin-created products) or had the placeholder `/images/sample.jpg` image. The AdminUserDetailPage products section returned empty for every seller because no product had a `seller` field pointing to any user.

**How it was fixed (Session 009 — form and backend route):**
- `backend/controllers/sellerController.js` — `createSellerProduct` function added. Validates required fields (name, description, category, price). Creates a Product with `status: 'submitted'`, `seller: req.user._id`, `user: req.user._id`. Product never appears publicly until admin approves.
- `backend/routes/sellerRoutes.js` — `POST /api/seller/products` route added using `protect + seller` middleware. `createSellerProduct` imported and registered.
- `frontend/src/pages/SellerDashboardPage.jsx` — My Products tab replaced with: "Submit New Product" toggle button, full submission form with fields for name, description, category, price, stock, brand, unitType, MOQ, itemsPerUnit, weightPerUnit, leadTimeDays, dimensions, tags, isBulkOnly. Review Status badges showing Awaiting Review / Changes Requested / Live / Rejected per product. Admin feedback shown under Changes Requested badge.

**How it was fixed (Session 010 — image upload):**
- `backend/routes/uploadRoutes.js` — `protect` middleware added to `POST /` route. Sellers (and admin) can now upload images. Previously the route had no auth at all — anonymous uploads were possible.
- `frontend/src/pages/SellerDashboardPage.jsx` — image upload field added to the submission form with: file input (JPG/PNG only), upload handler that posts to `/api/upload` with auth header, image preview shown after upload, photography tip panel explaining policy (no watermarks, no phone numbers, no TikTok screenshots, no AI renders), stock confirmation checkbox ("I confirm this image shows my actual stock").
- `submitNewProduct` updated: rejects submission if `!newProduct.image` (image not uploaded yet) or if stock confirmation checkbox not ticked. Both are required before the Submit button becomes active.
- `backend/controllers/sellerController.js` `createSellerProduct` — changed from hardcoded `/images/sample.jpg` to `req.body.image || '/images/sample.jpg'` fallback.

---

### ✅ ISS-R04 — Login Gate Missing on All Transactional Entry Points

**Opened:** Session 006 (June 7, 2026)
**Resolved:** Session 008 (June 11, 2026)
**Priority was:** HIGH

**What the problem was:** Six pages and actions allowed logged-out users to attempt transactional actions: BecomeSellerPage form submission, ContactPage form submission, BulkOrdersPage form submission, CartPage Proceed to Checkout button, ProductPage review form submission, LoginPage did not redirect back to the originating page after login. The redirect after login used the legacy `?redirect=` query param pattern which was inconsistent.

**How it was fixed:**
- `ContactPage.jsx`, `BulkOrdersPage.jsx`, `BecomeSellerPage.jsx` — login gate added at top of submit handler: `if (!userInfo) { navigate('/login', { state: { from: location.pathname } }); return; }`. Auth header added to axios calls.
- `CartPage.jsx` — `checkoutHandler` changed from `navigate('/login?redirect=shipping')` to `navigate('/login', { state: { from: '/shipping' } })`.
- `ProductPage.jsx` — `submitReviewHandler` checks `userInfo` before dispatching. Redirects to `/login` with `state: { from: '/product/${id}' }` if not logged in.
- `LoginPage.jsx` — redirect logic updated to read `location.state?.from` first, then fall back to `?redirect=` query param, then fall back to `/`. Forgot password placeholder link added inline with the password label, linking to `/forgot-password`, styled with Tan colour.

---

### ✅ ISS-R05 — Payment Model Did Not Exist

**Opened:** Session 007 (June 9, 2026)
**Resolved:** Session 008 (June 11, 2026)
**Priority was:** CRITICAL

**What the problem was:** No Payment document was created when an order was placed. There was no link between any payment and an orderId or userId. Admin had no way to manually record or confirm a payment. The "Mark as Paid" button on OrderPage directly called `PUT /api/orders/:id/pay` and set `isPaid: true` with no payment evidence recorded — no amount, no receipt number, no confirmation audit trail. STK Push in Step 20 had no data structure to write into.

**How it was fixed:**
- `backend/models/Payment.js` — new model created with fields: `orderId` (ref Order, required), `userId` (ref User, required), `method` (enum: mpesa_stk/mpesa_manual/bank_transfer/cash/other, default mpesa_manual), `status` (enum: pending/confirmed/failed/disputed/refunded, default pending), `amount` (Number, required), `mpesaReceiptNumber` (String), `rawMessage` (String — full pasted M-Pesa SMS verbatim), `reference` (String — for bank transfers), `confirmedBy` (ref User — admin who confirmed), `confirmedAt` (Date), `stkCheckoutRequestId` (String — for Daraja), `stkResultCode` (Number), `stkResultDesc` (String), `notes` (String). Indexes on orderId, userId+createdAt, status, mpesaReceiptNumber.
- `backend/models/Order.js` — `paymentId` field added (ref Payment) so every order links back to its Payment document.
- `backend/controllers/paymentController.js` — new controller with: `createPayment` (creates pending Payment linked to order, checks for existing payment first to prevent duplicates, links `paymentId` back onto Order), `confirmPayment` (five-step sequence: update Payment to confirmed → mark Order.isPaid true + set Order.paidAt → link Order.paymentId → advance Order.status from pending to processing → create transactional Notification to buyer), `getPaymentByOrder` (fetches Payment for an order, owner or admin only), `getPayments` (admin only, list all with filters), `updatePayment` (admin only, edit amount/method on pending payment before confirming).
- `backend/routes/paymentRoutes.js` — new routes file registered at `/api/payments` in server.js. Order-scoped routes (`POST /order/:orderId`, `GET /order/:orderId`) registered before `/:id`.
- `frontend/src/pages/OrderPage.jsx` — admin payment attachment panel added with: "Create Payment Record" button when no payment exists, payment record status and amount display when payment exists, Edit Amount form (corrects amount before confirming), Confirm Payment form (method select, M-Pesa SMS paste textarea, receipt number override, reference field, notes field), confirmation shows order total and minimum acceptable amount (95%). "Mark as Paid" legacy button removed — payment can only be confirmed through the payment attachment panel.

---

### ✅ ISS-R06 — BecomeSellerPage Missing Seller-Specific Fields

**Opened:** Session 007 (June 9, 2026)
**Resolved:** Session 008 (June 11, 2026)
**Priority was:** HIGH

**What the problem was:** BecomeSellerPage had fields for: business name, contact name, email, phone, products you sell, county (free text), and general message. It was missing three critical seller-specific fields: KRA PIN, M-Pesa payout number, and business description. These fields exist in `sellerProfile` on the User model but there was no way to collect them during the application process. County was also a free text field instead of the required 47-county dropdown. The data that `enquiryController` would need to upsert onto the User document was simply not being collected.

**How it was fixed:**
- `frontend/src/pages/BecomeSellerPage.jsx` — three fields added: Business Description (textarea, required, stores in `sellerProfile.description`), KRA PIN (text input, optional but recommended, stores in `sellerProfile.kraPin`), M-Pesa Payout Number (tel input, optional, stores in `sellerProfile.mpesaNumber`). County changed from free text `<input>` to `<select>` with the `COUNTIES` array (47 Kenyan counties). Submit button disabled condition updated to include `!formData.description`. Form reset updated to include all three new fields. Login gate added. Auth header added to axios call.
- `backend/controllers/enquiryController.js` — when `type === 'seller_application'` and `req.user` is set, builds a `userUpdate` object and calls `User.findByIdAndUpdate` with `{ $set: userUpdate }`. Fields set: `isSeller: true`, `sellerStatus: 'pending'`, `businessType: 'business'`, `businessName`, `phone`, `county` (from `data.county`), `sellerProfile.businessName`, `sellerProfile.description`, `sellerProfile.kraPin`, `sellerProfile.mpesaNumber`. Uses `$set` with dot notation so only provided fields are written.

---

### ✅ ISS-R07 — BecomeSellerPage Two Sets of User Data Problem

**Opened:** Session 007 (June 9, 2026) — from i_got_problems.docx conversation
**Resolved:** Session 008 (June 11, 2026) as part of ISS-R06
**Priority was:** HIGH

**What the problem was:** A user who filled in ProfilePage first (setting their phone, businessName, county) and then later applied via BecomeSellerPage would end up with two sets of data. ProfilePage data lived on the User document. BecomeSellerPage data lived only in the Enquiry's `data` field — never reconciled onto the User document. When admin approved the seller, the `sellerProfile` sub-document was created but the main user fields still reflected the ProfilePage data, which might be months old or completely different. The same person had two conflicting versions of their own information.

**How it was fixed:** Covered by the same fix as ISS-R06 — `enquiryController.createEnquiry` now immediately upserts the User document when a seller application is submitted. The User document becomes the single source of truth.

---

### ✅ ISS-R08 — Product Status Field Missing — Submitted Products Appeared Publicly

**Opened:** Session 009 (June 12, 2026)
**Resolved:** Session 009 (June 12, 2026) + backfill on June 12, 2026
**Priority was:** CRITICAL

**What the problem was:** The Product model had no `status` field. When the seller product submission form was built, submitted products had no way to be differentiated from approved products. `getProducts` returned all products regardless of who created them or whether they had been reviewed. A seller submitting a product would cause it to appear on the public storefront immediately without any admin review.

**How it was fixed:**
- `backend/models/Product.js` — `status` field added: enum `['draft', 'submitted', 'needs_changes', 'approved', 'rejected', 'archived']`, default `'approved'` (so admin-created products are live immediately). `adminFeedback` field added (String, default empty) to hold feedback text when status is `needs_changes` or `rejected`.
- `backend/controllers/productController.js` `getProducts` — filter changed from `const filter = {}` to `const filter = isAdmin ? {} : { status: 'approved' }`. `isAdmin` is derived from `req.user?.isAdmin` which is only set when `optionalAuth` passes through a valid token.
- `backend/routes/productRoutes.js` — `optionalAuth` middleware added to `GET /` route. Defined inline in the routes file.
- **MongoDB backfill** — run on June 12, 2026 in MongoDB Compass MongoSH: `db.products.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } })` — result: `{ acknowledged: true, matchedCount: 66, modifiedCount: 66 }`. This will never need to be run again.
- `backend/controllers/sellerController.js` `createSellerProduct` — hardcoded `status: 'submitted'` so all seller submissions start in the review queue.

---

### ✅ ISS-R09 — Image Upload Not Wired in Seller Product Submission

**Opened:** Session 009 (June 12, 2026) — identified as critical at end of session
**Resolved:** Session 010 (June 13, 2026)
**Priority was:** CRITICAL

**What the problem was:** The seller product submission form built in Session 009 had no image upload field. All submitted products used `/images/sample.jpg` as a placeholder. Admin would receive product submissions with no actual product image to review. The photography policy and image quality checks that were central to the approval workflow were completely unenforceable. The upload route `POST /api/upload` required admin-level middleware, blocking approved sellers from uploading at all.

**How it was fixed:**
- `backend/routes/uploadRoutes.js` — `protect` middleware added to the `POST /` route. Sellers (approved or not — protect only checks login, not seller status) can now upload images. The backend still only uses the image if it is attached to an approved product.
- `frontend/src/pages/SellerDashboardPage.jsx` — `imageUploading`, `imagePreview`, `stockConfirmed` state variables added. `handleImageUpload` function added: posts to `/api/upload` with `multipart/form-data` and auth header, stores returned URL in `newProduct.image`, sets `imagePreview`. Image upload field added to form: file input (JPG/PNG only), photography tip panel, "Upload Image" button, preview thumbnail after upload. Stock confirmation checkbox added: "I confirm this image shows my actual stock and is not AI-generated, watermarked, or taken from another seller's listing." `submitNewProduct` updated to require both `newProduct.image` and `stockConfirmed` before proceeding.
- `backend/controllers/sellerController.js` `createSellerProduct` — image field changed from hardcoded `/images/sample.jpg` to `req.body.image || '/images/sample.jpg'` fallback.

---

### ✅ ISS-R10 — Product Status Change Notifications Not Wired

**Opened:** Session 010 (June 13, 2026) — identified as critical at start of session
**Resolved:** Session 010 (June 13, 2026)
**Priority was:** CRITICAL

**What the problem was:** When admin changed a seller product's status (approved, needs_changes, rejected, archived, submitted), the seller received no notification. Sellers found out about approval decisions only by manually checking their dashboard. A product being approved and going live, or being rejected after submission, happened silently. There was no way for a seller to know to go check their dashboard unless they happened to open it.

**How it was fixed:**
- `backend/controllers/productController.js` `updateProduct` — `Notification` imported at top of file. `previousStatus` captured before overwriting: `const previousStatus = product.status`. After `await product.save()`, checks: `if (status !== undefined && status !== previousStatus && updatedProduct.seller)` → creates Notification to `updatedProduct.seller`. Messages per status value:
  - `approved` → "Your product '[name]' has been approved and is now live on the ShopZone storefront."
  - `needs_changes` → "Your product '[name]' requires changes before it can go live. [adminFeedback if provided]"
  - `rejected` → "Your product '[name]' has been rejected. [adminFeedback reason if provided]"
  - `submitted` → "Your product '[name]' has been moved back to review. It is no longer visible on the storefront."
  - `archived` → "Your product '[name]' has been archived and removed from the storefront."
  - Default → "The status of your product '[name]' has been updated to [status]."
  - All use `type: 'transactional'`, `link: '/seller/dashboard'`, wrapped in try/catch.

---

### ✅ ISS-R11 — AdminProductListPage Had No Approval Queue or Status Tabs

**Opened:** Session 010 (June 13, 2026)
**Resolved:** Session 010 (June 13, 2026)
**Priority was:** HIGH

**What the problem was:** AdminProductListPage showed all products in a flat table with no way to prioritise seller submissions waiting for review. Admin had no visual indication that submitted products were sitting in a queue. The submitted iPhone 16 test product was buried in the full product list. There was no Status column — admin could not see at a glance which products were approved, which were submitted, and which needed changes.

**How it was fixed:**
- `frontend/src/pages/AdminProductListPage.jsx` — three new `useMemo` counts added: `awaitingReviewCount` (products with `status === 'submitted'`), `needsChangesCount` (products with `status === 'needs_changes'`), `rejectedCount` (products with `status === 'rejected'`). Three new tab filter conditions added in `filteredProducts`: `awaitingreview`, `needschanges`, `rejected`. `TABS` array updated with three new tabs inserted before Featured: Awaiting Review (amber), Needs Changes (amber), Rejected (red). Amber "Awaiting Review" count pill added to the header next to Out of Stock and On Sale pills. Status column added to the table header. Status badge cell added to each table row using an IIFE that maps status to CSS class and display label. Table now shows: Image, Name, Price, Category, Brand, Unit, Stock, **Status**, Flags, Actions.
- `frontend/src/pages/AdminProductListPage.css` — six status badge classes added: `.apl-status--approved` (green), `.apl-status--submitted` (amber), `.apl-status--changes` (orange), `.apl-status--rejected` (red), `.apl-status--archived` (grey), `.apl-status--draft` (grey).

---

## Template for New Issues

```markdown
## 🔴/🟠/🟡/🟢 ISS-XXX — [Title]

**Opened:** Session XXX (date)
**Priority:** CRITICAL / HIGH / MEDIUM / LOW
**Linked step:** Step XX or "no linked step"
**Status:** OPEN

### What the problem is
[Describe exactly what is broken or missing. Be specific — what happens, what should happen instead, what files are involved.]

### Why it matters
[What is the real-world impact? Who is affected? What cannot be done because of this issue?]

### Files that need to change
[List every file. If you don't know yet, say so.]

### Next action
[What specific thing needs to happen to start fixing this. What files need to be pasted. What information is needed.]
```
