# ShopZone — Session Log

> A chronological record of every Claude build session.
> **Append-only — never edit old entries.**
> Each entry is a permanent snapshot of what happened, what was decided, and what was left for next time.
>
> **At the end of every session, add a new entry using the template at the bottom.**

---

## SESSION-001 & SESSION-002 — May 2026

**Goal:** Scaffold the project, build backend models, controllers, middleware, and get a working API running. Run the first accessibility audit.

### What Got Done

**Project scaffolded:**
- Folder structure created: `backend/` and `frontend/` from `ecommerce-platform/` root
- `npm init -y` run in backend folder
- Dependencies installed: `express mongoose dotenv bcryptjs jsonwebtoken cors`
- Nodemon installed as dev dependency
- `concurrently` added to root for running both servers with `npm run dev`
- PowerShell execution policy fixed: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

**Backend models built:**
- `backend/models/User.js` — fields: `name`, `email` (unique, lowercase), `password` (bcrypt hashed), `isAdmin` (default false), timestamps. `mongoose.model('User', userSchema)` exported.
- `backend/models/Product.js` — two schemas: `reviewSchema` (user ref, name, rating 1–5, comment, timestamps) embedded as array in `productSchema`. Product fields: `user` (admin ref), `name`, `image`, `category`, `description`, `reviews[]`, `rating` (average, recalculated on review), `numReviews`, `price`, `countInStock`, timestamps. Rating recalculation uses `reduce()` on reviews array: sum of ratings / count.
- `backend/models/Order.js` — two schemas: `orderItemSchema` (name, qty, image, price, product ref) embedded in `orderSchema`. Order fields: `user` (buyer ref), `orderItems[]`, `shippingAddress` (address, city, postalCode, country), `paymentMethod`, `paymentResult` (id, status, update_time, email_address), `itemsPrice`, `shippingPrice`, `taxPrice`, `totalPrice`, `isPaid` (default false), `paidAt`, `isDelivered` (default false), `deliveredAt`, timestamps.

**Backend middleware built:**
- `backend/middleware/authMiddleware.js` — `protect` function: reads Bearer token from `Authorization` header, verifies with `jwt.verify` using `JWT_SECRET`, fetches user from DB excluding password, attaches to `req.user`, calls `next()`. `admin` function: checks `req.user.isAdmin`, returns 401 if false. Both exported.
- `backend/middleware/errorMiddleware.js` — central error handler registered as last middleware in server.js. Returns JSON with message and stack trace (stack hidden in production).

**Backend controllers built:**
- `backend/controllers/userController.js` — `registerUser` (checks duplicate email, `bcrypt.genSalt(10)` + `bcrypt.hash`, saves user, returns user data + JWT token), `loginUser` (finds by email, `bcrypt.compare`, returns user data + JWT), `getUserProfile` (uses `req.user._id` from protect middleware), `updateUserProfile` (updates name/email/password with `||` pattern, rehashes only if new password sent). `generateToken` helper: `jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' })`.
- `backend/controllers/productController.js` — `getProducts` (all, no filter initially), `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`, `createProductReview` (duplicate check, push review, recalculate rating with `reduce()`).
- `backend/controllers/orderController.js` — `createOrder` (validates cart not empty, creates order), `getOrderById` (populate user name+email), `updateOrderToPaid`, `updateOrderToDelivered`, `getMyOrders` (filter by `req.user._id`), `getAllOrders` (admin, populate user id+name).

**Server configured:**
- `backend/server.js` — Express app, CORS, `express.json()`, Mongoose connect, root health check route, port 5000.
- `.env` — `PORT=5000`, `MONGO_URI=mongodb://localhost:27017/shopzone`, `JWT_SECRET=melvin_shopzone_secret_key_2025`
- `.gitignore` — `node_modules`, `.env`

**Accessibility audit:**
- Lighthouse run May 25, 2026 at 3:47 PM GMT+3, Lighthouse 13.0.2, Chromium 148.0.0.0, emulated desktop
- Score: **95**
- Remaining issues logged: contrast warnings, footer heading order (h6 skips levels), MobileDrawer mounts when closed, ShopZoneLogo inline styles, App.jsx Bootstrap Container squeezing full-width pages

### Decisions Made
- DEC-001: Golden rule — all transactions through ShopZone exclusively, supplier identity never exposed
- DEC-002: Password hashing in controllers only, no pre-save hooks on User.js
- DEC-003: VAT is inclusive, extract as price * 16 / 116, never add on top

### Issues Surfaced
- ISS-008: Corrupted characters in Header, Footer, Toast, MobileDrawer, HomePage.css, SpecialOffersPage.css, productController, orderController, Product.js, Order.js, orderRoutes.js (Step 1 — not yet actioned)
- ISS-010: MobileDrawer mounts when closed — accessibility issue, hides from AT (Step 2 — deferred)
- ISS-011: ShopZoneLogo uses inline styles (Step 2 — deferred)

### Next Session Goal
Build routes folder, test all API endpoints in Postman, begin React frontend

---

## SESSION-003 — June 6, 2026

**Goal:** Add wholesale fields to Product model, build Enquiry catch-all model, seed database with real wholesale products, wire stats strips on content pages.

### What Got Done

**Database seeded with 63 wholesale products:**
- `updateExistingProducts.js` (one-time script, deleted after) — patched all 13 original seed products with wholesale fields using `findOneAndUpdate` + `$set`. Confirmed: 13 PATCHED, 0 not found. Mongoose deprecation warning about "new" option was cosmetic only — patch executed correctly.
- `addProducts.js` (one-time script, deleted after) — inserted 33 new wholesale products linked to admin user. Products spread across all 13 ShopZone categories.
- `addProductsTopup.js` (one-time script, deleted after) — inserted 17 additional products: Electronics (2), Fashion (2), Food (2), Home & Kitchen (2), Beauty (2), Agriculture (2), General Merchandise (2), Office (1), Health (1), Baby & Kids (1).
- **Total: 63 products** — 13 original patched + 50 new. All 63 have brand, unitType, MOQ, itemsPerUnit, weightPerUnit, dimensions, isBulkOnly, leadTimeDays populated.

**Wholesale fields added to Product model (retrospective patch):**
- `brand` (String) — product brand name, empty string if no brand
- `unitType` (Enum) — full buyer-facing unit: Carton, Bale, Sack, Roll, Pallet, Pack, Litre, Per Unit, Dozen, Kg, Box, Piece
- `minimumOrderQuantity` (Number, default 1) — minimum units a buyer must order
- `itemsPerUnit` (Number) — individual pieces inside one unit (e.g. 24 bars per carton)
- `weightPerUnit` (Number, kg) — used by Tier 2 delivery quote system
- `dimensions` (String) — physical size as readable string (e.g. "40 x 30 x 20 cm")
- `isBulkOnly` (Boolean) — if true, cannot be bought as single pieces
- `leadTimeDays` (Number) — days from confirmed order to dispatch

**Critical lesson on legacy unit field:**
The legacy `unit` field on Product only accepts 7 values: Per Unit, Bale, Carton, Dozen, Kg, Box, Sack. Any product with a `unitType` outside these 7 must use `unit: 'Per Unit'` as the fallback. The `unitType` field is what gets displayed to buyers.

**Stats strips wired:**
- BecomeSellerPage, FAQPage, ContactPage stats strips confirmed to read from `/api/stats` with no hardcoded fallbacks.

**Notification bell — decided to build:**
- Scope confirmed: order status changes (paid, dispatched, delivered, quote required, quote approved, quote rejected), seller approval changes, payout confirmations, contact form replies, RFQ responses, marketing/promotional
- Model spec agreed: userId, type (transactional/promotional), title, message, isRead, relatedOrderId (optional), relatedEnquiryId (optional), createdAt
- Positioned as a step after Step 15 on the roadmap

**Decisions confirmed this session:**
- New Arrivals on homepage calls `/api/products?sort=newest&limit=4` — genuine freshness signal, not an ad space
- Deals and Clearance strip agreed for HomePage: shows `isOnSale: true` or `isClearance: true` products, links to /offers

### Decisions Made
- DEC-004: Cart items use `item.product` as MongoDB ID field — never item._id
- Legacy unit field enum confirmed as immutable: Per Unit, Bale, Carton, Dozen, Kg, Box, Sack

### Issues Surfaced
- BrandsPage needs full rebuild as real brand directory — old version showed categories as brands

### Next Session Goal
Redesign ProfilePage, add Deals strip to HomePage, rebuild BrandsPage as real brand directory with live data

---

## SESSION-004 — June 7, 2026

**Goal:** Redesign ProfilePage, build Deals strip on HomePage, rebuild BrandsPage, build NotificationBell, style all admin pages to gold standard.

### What Got Done

**ProfilePage fully rebuilt (ProfilePage.jsx + ProfilePage.css):**
- Two-column layout: left column = avatar zone + form, right column = order history (untouched)
- Left column avatar zone: Oxford Blue background, Tan circle with user initials, account type pill badge, member since date, three-stat row (Orders, Fulfilled, Total Spent in KES)
- Form split into three collapsible sections: Personal Info (name, email, phone), Delivery Info (account type, business name/type, street address, apartment, town/city, county select, country read-only), Security (static message linking to /forgot-password — inline password change removed)
- `ConfirmModal` fires before every profile save
- Password state variables removed entirely
- `showDelivery` boolean added for collapsible Delivery Info section
- `confirmSave` async function runs the actual API call on modal confirmation
- Redux profile save pattern fixed: `dispatch(setCredentials(data))` replaces the incorrect `dispatch(login.fulfilled(data, '', {}))`

**User.js updated:**
- `shippingAddress` sub-document added with fields: `address`, `apartment`, `city`, `county`, `country` (defaults to Kenya). All optional so existing users unaffected.

**userController updated:**
- All four responses (loginUser, getUserProfile, updateUserProfile, registerUser) now include `shippingAddress` and `createdAt`
- `updateUserProfile` saves `shippingAddress` sub-fields independently using dot notation to prevent partial overwrites
- `updateUserProfile` syncs `user.county` from `user.shippingAddress.county`
- Password change removed from `updateUserProfile`

**ShippingPage updated:**
- `apartment` state field added
- Pre-fill priority: Redux shippingAddress first → userInfo.shippingAddress from saved profile → empty
- All five address fields pre-fill on checkout so buyers never retype their address

**Deals and Clearance strip on HomePage:**
- `listDealsProducts` thunk added to `productSlice.js` — hits `/api/products?deals=true&limit=8`
- State fields `dealsProducts`, `loadingDeals`, `errorDeals` added
- New Deals and Clearance section renders between DealsBanner and New Arrivals using `OfferCard` components

**productSlice duplicate thunk bug fixed:**
- Duplicate `listNewArrivals` export and ghost reference to `listFeaturedProducts` in extraReducers were locking the app on the loading screen
- Fixed by removing duplicate thunk block and restoring `listFeaturedProducts` as a proper export

**BrandsPage fully rebuilt:**
- Fetches from `/api/products/brands` via `listProductBrands` thunk
- Brands grouped alphabetically into letter sections
- Sticky A-Z navigation strip with smooth-scroll to letter groups
- Each brand card: initials circle (Oxford Blue, Tan text), brand name, product count
- Clicking brand navigates to `/?brand=BrandName`
- Live search filters all letter groups simultaneously, hides A-Z nav when active
- Skeleton loading cards while brands load

**Brand filter wired through:**
- `productSlice.js` `listProducts` appends `brand` to query string when present
- HomePage reads `brand` URL param, passes to `listProducts` dispatch, includes in `isBrowsingMode` and `getBrowseHeading`
- ProductPage: clickable brand link styled with Tan underline, navigates to `/?brand=BrandName`

**NotificationBell built:**
- `backend/models/Notification.js` — userId (ref User, indexed), type (transactional/promotional), title, message, isRead (default false), relatedOrderId (optional ref Order), relatedEnquiryId (optional ref Enquiry), timestamps
- `backend/controllers/notificationController.js` — `getNotifications` (newest 50 + unreadCount), `markOneRead` (verifies ownership), `markAllRead`
- `backend/routes/notificationRoutes.js` — `read-all` route registered BEFORE `/:id/read` (critical: prevents Express matching "read-all" as ObjectId)
- `frontend/src/components/NotificationBell/NotificationBell.jsx` — renders null when logged out, fetches on mount + polls every 60 seconds, Tan badge on Oxford Blue showing unread count, dropdown panel with mark all read, notification list with type icons, unread dot, title, message (2 lines clamped), relative timestamps, clicking marks read + navigates to order page when relatedOrderId set, outside click closes

**All admin pages styled to gold standard:**
- AdminProductListPage: full admin design system, tabs (All/Featured/On Sale/Clearance/Out of Stock), search, count pills, clicking row goes to edit page
- AdminProductEditPage: full admin header, back button moved to header right side with FaArrowLeft icon
- AdminOrderListPage: search bar added between tab bar and table, filters across order ID, buyer name, and buyer email using useMemo
- AdminUserListPage: full admin design system, tabs (All/Customers/Admins), count pills (Total Users, New Today amber, Admins Oxford Blue), search, clicking row navigates to /admin/users/:id
- AdminSellersPage: full admin design system, tabs (Pending/Approved/Suspended/Rejected), count pills (Pending amber, Approved green, Suspended red), search, Approve/Reject/Suspend/Reinstate buttons with ConfirmModal, clicking row to /admin/users/:id
- AdminEnquiriesPage: Unread tab added between All and Bulk Orders, powered by backend `?status=new` rather than client-side filtering. `typeFilter === all` AND `statusFilter === new` is what activates Unread. All other tabs reset statusFilter to all on click.

**DesktopDropdownMenu fixed:**
- Logout button was being pushed off screen when admin section grew beyond viewport height
- Fixed with `max-height: calc(100vh - 90px)` and flex column on outer panel
- Inner `.desktop-dropdown-scroll` div handles `overflow-y: auto`
- Arrow pointer sits outside scroll wrapper
- Custom scrollbar: thin tan thumb on transparent track

### Decisions Made
- DEC-006: Sellers are buyer account upgrades, not separate accounts
- Redux profile save pattern: always `setCredentials(data)`, never `dispatch(login.fulfilled(...))`
- `read-all` route must always be before `/:id/read` in notificationRoutes.js
- Notifications are system-generated only — no public POST endpoint

### Issues Surfaced
- ISS-R04 identified (login gate missing on all forms) — planned for next session
- ISS-R06 identified (BecomeSellerPage missing seller-specific fields) — planned for next session
- Admin User Detail page needed — flagged as next major build after login gates

### Next Session Goal
Fix all login gates on forms and transactional pages, add Become a Seller prominence to navigation, start AdminUserDetailPage

---

## SESSION-005 — June 7, 2026

**Goal:** Complete seller application flow end-to-end, improve seller dashboard, add seller navigation prominence.

### What Got Done

**Seller application flow completed end-to-end:**
- BecomeSellerPage form POSTs to `/api/enquiries` with `type: seller_application`
- `enquiryController.createEnquiry` sets `user.sellerStatus = 'pending'` when type is seller_application and req.user exists
- User appears on AdminSellersPage Pending tab immediately
- Admin approves via `PUT /api/users/:id/seller-status` → sets `isSeller: true`, `sellerStatus: 'approved'`, `sellerApprovedAt: now`
- Seller logs out and back in → token now includes `isSeller: true`, `sellerStatus: 'approved'`
- Seller Dashboard link appears in navigation
- `/seller/dashboard` becomes accessible

**Known gap identified:** If seller submits form while logged out, `enquiryController` receives no req.user, sellerStatus never updates. Enquiry appears in AdminEnquiriesPage but seller does NOT appear on AdminSellersPage Pending tab. Needs a button on the enquiry detail panel to manually set pending for linked users.

**SellerDashboardPage improved:**
- My Orders tab: inline Tier 2 quote submission form added with structured fields (amount, courier dropdown, estimated days). Amount is capped at 3x zone base rate server-side in `submitSellerQuote` to prevent inflation. `sellerController.getSellerOrders` strips customer identity — only `deliveryCounty` exposed, never full address or contact details.

**Seller navigation:**
- CategoryBar: Become a Seller added as direct highlighted link (`catbar-link--seller` class, Tan coloured), removed from More dropdown. View All Categories: navigates to /brands until /categories is built.
- MobileDrawer: Seller Dashboard link added at top of Browse section for approved sellers only. Become a Seller shown in Browse section for non-sellers. Admin Sellers link added to admin section.
- DesktopDropdownMenu: Seller Dashboard section appears for approved sellers only with FaChartBar icon and Tan left border styling. Admin Sellers link added to admin links array.

### Decisions Made
- `sellerController.getSellerOrders` deliberately strips customer identity — only `deliveryCounty` exposed to seller, never full address, name, or phone. This enforces the golden rule from the seller side.

### Issues Surfaced
- Login gate still missing on all forms (carried forward to Session 008)
- AdminUserDetailPage still missing (carried forward)
- Gap: seller submitting BecomeSellerPage while logged out does not set sellerStatus pending

### Next Session Goal
Fix all login gates, fix dead links (View All Categories, New Arrivals View All), build AdminUserDetailPage aggregation

---

## SESSION-006 — June 7, 2026

**Goal:** Fix login gates on all forms and transactional pages. Fix dead navigation links.

### What Got Done

**Login gates added (ISS-R04 — partially resolved frontend, backend pending):**
- ContactPage: `useNavigate`, `useLocation`, `useSelector` added. `handleSubmit` checks `if (!userInfo)` and redirects to `/login` with `state: { from: location.pathname }`. Auth header added to axios call.
- BulkOrdersPage: same pattern.
- CartPage: `checkoutHandler` redirect updated from `navigate('/login?redirect=shipping')` to `navigate('/login', { state: { from: '/shipping' } })`.
- ProductPage: `submitReviewHandler` checks `userInfo` before dispatching. Redirects to `/login` with `state.from` if not logged in.
- BecomeSellerPage: login gate added.
- LoginPage: reads `location.state?.from` first, falls back to `?redirect=` query param, then falls back to `/`. Forgot password placeholder link added inline with password label, linking to `/forgot-password`.

Note: Backend was still using `optionalAuth` on enquiries route at this point — frontend gates were in place but backend could still accept anonymous POSTs if someone bypassed the frontend. Full backend enforcement came in Session 008.

**Dead links fixed:**
- CategoryBar View All Categories: now navigates to `/brands` until `/categories` is built
- Become a Seller: already prominent from Session 005 work

**AdminUserListPage and AdminSellersPage:**
- Row clicks now navigate to `/admin/users/:id` — but the page does not exist yet. Clicking a row navigates but shows NotFoundPage until Session 007.

### Decisions Made
- All login redirects use `state: { from: location.pathname }` pattern — not query params. LoginPage must read `location.state?.from` first.

### Issues Surfaced
- Backend still using optionalAuth on enquiries — userId still sometimes null (full fix in Session 008)
- AdminUserDetailPage does not exist yet — clicking users goes nowhere useful

### Next Session Goal
Build AdminUserDetailPage with full user aggregation from all five collections

---

## SESSION-007 — June 9, 2026

**Goal:** Build AdminUserDetailPage with full user aggregation. Conduct full architecture review.

### What Got Done

**getUserFullProfile backend function:**
- Added to `backend/controllers/userController.js`
- Runs five `Promise.all` queries: user document (password excluded), all orders where `user` matches, all products where `seller` matches, all enquiries where `userId` matches, 50 most recent notifications where `userId` matches
- Route `GET /api/users/:id/full-profile` registered in `userRoutes.js` BEFORE the `/:id` route to prevent Express treating "full-profile" as a MongoDB ObjectId

**AdminUserDetailPage built (`AdminUserDetailPage.jsx` + `AdminUserDetailPage.css`):**
- White header bar with back button, large initials avatar, user name, joined date, admin/seller badge pills
- Account Information card: email, phone, county, account type, delivery address, registered date
- Seller Profile card (only when `sellerStatus !== 'none'`): businessName, businessAddress, KRA PIN, M-Pesa number, approved/suspended dates, approve/reject/suspend/reinstate action buttons wired to `PUT /api/users/:id/seller-status` with ConfirmModal
- Orders as Buyer table: order ID, date, total, status badge, paid yes/no, delivered yes/no, View link to `/order/:id`
- Products as Seller table: thumbnail, name, category, brand, price, stock count, flag badges, Edit link to `/admin/product/:id/edit`
- Enquiries Submitted table: clickable rows expand inline to show full message, business name, admin notes with Internal badge, link to `/admin/enquiries`
- Notifications list: title + message, View Order link when `relatedOrderId` present
- `expandedEnquiry` state tracks which enquiry row is open, toggling on click with rotating chevron

**App.jsx:**
- Route `/admin/users/:id` added pointing to AdminUserDetailPage
- Admin pages use negative margin breakout: `margin-left: calc(-50vw + 50%); width: 100vw` — Container NOT removed from App.jsx

**Full architecture review conducted — six structural problems identified:**
1. Frontend forms not sending auth token → userId always null on enquiries (ISS-R01)
2. BecomeSellerPage not upsetting User document with seller fields (ISS-R06)
3. BecomeSellerPage missing KRA PIN, M-Pesa, description fields (ISS-R06)
4. orderController has zero Notification imports → bell always empty (ISS-R02)
5. Seller product submission architecture does not exist (ISS-R03)
6. Payment model does not exist (ISS-R05)

**Foreign key chain fully mapped:**
- `User._id` → `Orders.user`, `Enquiries.userId`, `Notifications.userId`, `Products.seller`
- `Order._id` → `Notifications.relatedOrderId`, `Payments.orderId` (when Payment model built)
- `Payment._id` → links back to Order and User

### Decisions Made
- DEC-014: Admin pages break out of Bootstrap Container with negative margins — Container stays in App.jsx untouched
- `GET /api/users/:id/full-profile` must always be registered before `GET /api/users/:id` — documented as permanent rule

### Issues Surfaced
- ISS-R01: Auth token never sent from frontend forms — userId always null
- ISS-R02: orderController has zero Notification creation
- ISS-R03: Seller product submission architecture missing
- ISS-R05: Payment model does not exist
- ISS-R06: BecomeSellerPage missing fields and not upserting User document

### Next Session Goal
Fix auth token on all frontend forms, build Payment model, wire order event notifications

---

## SESSION-008 — June 11, 2026

**Goal:** Fix all auth/data linking issues. Build Payment model and admin confirmation UI. Build New Arrivals and Featured pages.

### What Got Done

**Login gates fully resolved (ISS-R04 closed):**
- `POST /api/enquiries` changed from `optionalAuth` to `protect` middleware — anonymous submissions now receive 401
- `optionalAuth` helper removed from `enquiryRoutes.js` entirely
- `enquiryController.createEnquiry` — `userId` changed from `req.user?._id` to `req.user._id` (unconditional, since protect guarantees req.user)
- ContactPage, BulkOrdersPage: auth header added to axios calls
- CartPage checkout: redirect updated to use `location.state.from` pattern
- ProductPage review: login check added before dispatch
- LoginPage: reads `location.state?.from`, forgot password link added

**New Arrivals page (ISS-R11 resolved — New Arrivals dead link fixed):**
- Decision: dedicated page, not filtered homepage state (DEC-010)
- `productSlice.js` — `if (filters.sort) params.append('sort', filters.sort)` added
- `NewArrivalsPage.jsx` + `NewArrivalsPage.css` — Oxford Blue hero with "Just Landed" eyebrow pill (FaClock icon), H1 "New Arrivals", grey subtitle, Back to Shop ghost button. Dispatches `listProducts({ sort: 'newest' })` with no limit. Loading spinner, empty state with Browse All Products button, error state with Bootstrap Alert.
- HomePage: New Arrivals `viewAllHref` changed from `/?sort=newest` to `/new-arrivals`

**Featured Products page:**
- `FeaturedPage.jsx` + `FeaturedPage.css` — Oxford Blue hero with "Curated Selection" eyebrow pill (FaStar icon). Dispatches `listProducts({ featured: true })` with no limit.
- HomePage: Featured Products `viewAllHref` changed from `/?featured=true` to `/featured`

**BecomeSellerPage fields added and User document upsert built (ISS-R06 closed):**
- Business Description (textarea, required) — stores in `sellerProfile.description`
- KRA PIN (text input, optional) — stores in `sellerProfile.kraPin`
- M-Pesa Payout Number (tel input, optional) — stores in `sellerProfile.mpesaNumber`
- County changed from free text to 47-county `<select>` with COUNTIES array
- Submit handler: login gate added, auth header added, three new fields in payload, submit button disabled when `!formData.description`
- `enquiryController.createEnquiry` — when `type === 'seller_application'` and `req.user` set, runs `User.findByIdAndUpdate` with `{ $set: userUpdate }` using dot notation for sellerProfile sub-fields

**Payment model and infrastructure (ISS-R05 closed):**
- `backend/models/Payment.js` created — all fields including `stkCheckoutRequestId`, `stkResultCode`, `stkResultDesc` for future Daraja integration. Indexes on orderId, userId+createdAt, status, mpesaReceiptNumber.
- `backend/models/Order.js` — `paymentId` field added (ref Payment)
- `backend/controllers/paymentController.js` created — `createPayment`, `confirmPayment` (five-step sequence including notification), `getPaymentByOrder`, `getPayments`, `updatePayment`
- `backend/routes/paymentRoutes.js` — order-scoped routes before `/:id`
- `backend/server.js` — `/api/payments` registered
- `frontend/src/pages/OrderPage.jsx` — admin payment attachment panel: create record button, payment record status + amount display, Edit Amount form (corrects amount before confirming), Confirm Payment form (method select, M-Pesa SMS paste, receipt number, reference, notes). "Mark as Paid" legacy button removed — payment only through payment panel.
- `paymentController` initially used `type: 'payment'` in notification — corrected to `type: 'transactional'` after Mongoose validation error discovered

### Decisions Made
- DEC-007: Anonymous enquiry submissions rejected at backend — protect middleware is the real wall
- DEC-008: BecomeSellerPage upserts User document immediately on submission
- DEC-009: Payment model is single source of truth for all payment activity
- DEC-010: New Arrivals and Featured are dedicated pages, not filtered homepage states
- DEC-015: Notification type enum has exactly two values — transactional and promotional
- DEC-018: One payment per order — two-payment scenario not built
- DEC-013: County is always a dropdown — never free text

### Issues Resolved
- ISS-R01: Auth token — FULLY RESOLVED
- ISS-R04: Login gate — FULLY RESOLVED (backend + frontend)
- ISS-R05: Payment model — FULLY RESOLVED
- ISS-R06: BecomeSellerPage fields and upsert — FULLY RESOLVED

### Next Session Goal
Wire all five order event notifications in orderController, build verified purchase review gate, build seller product submission form

---

## SESSION-009 — June 12, 2026

**Goal:** Wire order notifications, build seller product submission form, add verified purchase reviews, add product status workflow.

### What Got Done

**Order notifications wired (ISS-R02 closed):**
- `Notification` imported at top of `orderController.js`
- `Notification` link field added to `backend/models/Notification.js` (String, default null)
- Five events wired, all wrapped in try/catch, all use `type: 'transactional'`, all set `relatedOrderId` and `link: '/order/${order._id}'`:
  1. `createOrder` → buyer notification: "Your order #XXXXXXXX has been placed successfully."
  2. `sendDeliveryQuote` → buyer notification: "A delivery quote of KES X has been sent for order #XXXXXXXX. Please review and approve or reject it."
  3. `rejectDeliveryQuote` → buyer notification: "You rejected the delivery quote for order #XXXXXXXX. The order has been cancelled and stock restored."
  4. `updateOrderToDelivered` → buyer notification: "Your order #XXXXXXXX has been marked as delivered. If you have any issues, please report from your order page."
  5. `releaseSellerPayout` → buyer notification (placeholder — will go to seller in Step 5): "The seller payout for order #XXXXXXXX has been released. KES X sent to supplier."
- `paymentController.js` payment confirmation notification updated to include `link: '/order/${order._id}'`
- `NotificationBell.jsx` updated to use `notif.link` for navigation, with `relatedOrderId` fallback for older notifications

**View Receipt panel on OrderPage:**
- Toggleable "View Receipt" button appears when payment is confirmed
- Buyer sees: method, M-Pesa receipt number, reference, amount paid, confirmed-on date
- Admin additionally sees: raw M-Pesa SMS, admin notes, who confirmed it
- "Payment under review" badge added — shown when payment record exists but not yet confirmed (replaces generic "Awaiting Payment")
- `showReceipt` state variable added

**Report Issue form on OrderPage and ProfilePage:**
- OrderPage: collapsible "Report an Issue with this Order" section (hidden for cancelled orders). Pre-fills order ID read-only. Textarea for describing the problem. Posts to `POST /api/enquiries` with `type: 'support'` and `orderId`. `submitIssueHandler` function added.
- `OrderPage`: `useEffect` reads `window.location.hash` and auto-expands form when hash is `#report`. `id="order-report-section"` added to the report div for scroll target.
- `ProfilePage My Orders` tab: "Report Issue" link added beside every Details button for non-cancelled orders, navigating to `/order/:id#report`
- `backend/models/Enquiry.js`: `orderId` field added (ObjectId ref Order, default null)
- `enquiryController.createEnquiry`: saves `orderId` from `req.body.orderId`
- `getEnquiries` and `getEnquiryById`: populate `orderId` with `_id totalPrice status createdAt`
- `getEnquiries`: accepts `?orderId=` query param as filter

**Profanity filter:**
- `leo-profanity` installed on backend
- Runs in `createProductReview` and `createEnquiry` before saving
- Returns 400 with polite message that does not name the specific word
- English dictionary loaded on startup via `leoProfanity.loadDictionary('en')`

**Verified purchase reviews (DEC-012):**
- `createProductReview` — queries `Order.findOne({ user: req.user._id, status: 'delivered', 'orderItems.product': product._id })` before allowing review. If none found, returns 400.
- Seller self-review block added: `if (req.user.isSeller && product.seller && product.seller.toString() === req.user._id.toString())` → 400
- Minimum 10-character comment required
- `ProductPage.jsx` — `verifiedPurchase` and `purchaseChecked` state added. useEffect on mount fetches `/api/orders/myorders`, checks for delivered order containing this product. Shows "Verified purchases only" message instead of review form if no qualifying order. `item.product?.toString() === id` used for safe comparison.
- `axios` imported in ProductPage for the orders check
- `ProductPage.jsx` fix: `product?.reviews` optional chaining to prevent crash on empty product state during loading

**Product status field and public filter (ISS-R08 closed):**
- `backend/models/Product.js` — `status` enum added (draft/submitted/needs_changes/approved/rejected/archived, default 'approved'), `adminFeedback` String field added
- MongoDB backfill run June 12, 2026: `db.products.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } })` → `{ matchedCount: 66, modifiedCount: 66 }` — one-time, complete, will not be run again
- `productController.js` `getProducts` — filter changed to `const isAdmin = req.user?.isAdmin; const filter = isAdmin ? {} : { status: 'approved' }`
- `productRoutes.js` — `optionalAuth` middleware defined inline and added to `GET /`

**Seller product submission form (ISS-R03 partially closed):**
- `backend/controllers/sellerController.js` — `createSellerProduct` function added with full validation (name min 3 chars, description min 20 chars, price >= 0). Creates Product with `status: 'submitted'`, `seller: req.user._id`, `image: '/images/sample.jpg'` (placeholder — image upload deferred to Session 010)
- `backend/routes/sellerRoutes.js` — `POST /api/seller/products` added using `protect + seller` middleware
- `frontend/src/pages/SellerDashboardPage.jsx` — My Products tab rebuilt with: product count + "Submit New Product" button, toggle form with all wholesale fields (name, description, category, price, stock, brand, unitType, MOQ, itemsPerUnit, weightPerUnit, leadTimeDays, dimensions, tags, isBulkOnly), success banner, review status badges per product (Awaiting Review / Changes Requested / Live / Rejected), admin feedback shown under Changes Requested badge

**Admin product status + seller assignment (ISS-R11 partially closed):**
- `AdminProductEditPage.jsx` — Seller Assignment section added in right column: seller dropdown fetching from `/api/users?isSeller=true`, Product Status dropdown, "Feedback to Seller" textarea (appears only when status is needs_changes or rejected)
- `productController.js` `updateProduct` — now saves `seller`, `status`, `adminFeedback` fields

**formatKES utility:**
- `frontend/src/utils/formatKES.js` created: `export const formatKES = (amount) => 'KES ${Number(amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}'`
- Duplicate declaration bug in AdminOrderListPage fixed — `formatKES` had been declared both locally and via import causing JS syntax error

**Branded splash screen:**
- `frontend/index.html` — Oxford Blue background, orb animations, floating particles, S logo mark tile in Tan, ShopZone wordmark, "Wholesale Marketplace" eyebrow, shimmer loading bar
- Documented as the one exception to the no-inline-styles rule

### Decisions Made
- DEC-011: Seller-submitted products never public until admin approves
- DEC-012: Verified purchase reviews only
- DEC-016: Splash screen inline CSS is the one documented exception
- DEC-017: Product analytics deferred to Step 17

### Issues Resolved
- ISS-R02: Order notifications — FULLY RESOLVED
- ISS-R03: Seller submission architecture — PARTIALLY RESOLVED (image upload missing)
- ISS-R08: Product status field — FULLY RESOLVED (including MongoDB backfill)

### Issues Surfaced
- ISS-001: Image upload still needed in seller submission form (became ISS-R09)
- ISS-002: Product status change notifications still needed (became ISS-R10)
- ISS-003: AdminProductListPage status tabs still needed (became ISS-R11)

### Next Session Goal
Wire seller image upload, product status change notifications to sellers, AdminProductListPage approval queue tabs

---

## SESSION-010 — June 13, 2026

**Goal:** Wire seller image upload, product status notifications, AdminProductListPage approval queue, show password toggle on LoginPage, enquiry page pills and badge counter fix, seller profile tab enrichment.

### What Got Done

**Seller image upload wired (ISS-R09 closed):**
- `backend/routes/uploadRoutes.js` — `protect` middleware added to `POST /` route. Route previously had no auth at all — anonymous uploads were possible. Now requires login.
- `frontend/src/pages/SellerDashboardPage.jsx` — `imageUploading`, `imagePreview`, `stockConfirmed` state variables added. `handleImageUpload` async function added: posts to `/api/upload` with `Content-Type: multipart/form-data` and auth header, sets `newProduct.image` and `imagePreview`. Image upload field added to submission form: photography tip panel explaining policy (no watermarks, phone numbers, TikTok screenshots, AI renders), "Upload Image" button (label wrapping hidden file input), preview thumbnail after upload, stock confirmation checkbox ("I confirm this image shows my actual stock and is not AI-generated, watermarked, or taken from another seller's listing"). `submitNewProduct` updated to require both `newProduct.image` and `stockConfirmed` before proceeding — submit button disabled if either is missing. Form reset updated to include `image: ''` and `stockConfirmed: false` on success.
- `backend/controllers/sellerController.js` `createSellerProduct` — image changed from hardcoded `/images/sample.jpg` to `req.body.image || '/images/sample.jpg'`

**Product status change notifications wired (ISS-R10 closed):**
- `backend/controllers/productController.js` `updateProduct` — `Notification` imported at top. `previousStatus` captured before overwriting: `const previousStatus = product.status`. After `await product.save()`, checks `if (status !== undefined && status !== previousStatus && updatedProduct.seller)` → creates Notification to `updatedProduct.seller` with appropriate message per status (approved/needs_changes/rejected/submitted/archived/draft). All use `type: 'transactional'`, `link: '/seller/dashboard'`. Wrapped in try/catch — notification failure never crashes the product update.

**AdminProductListPage approval queue (ISS-R11 closed):**
- `frontend/src/pages/AdminProductListPage.jsx` — `awaitingReviewCount`, `needsChangesCount`, `rejectedCount` useMemo values added. Three new tab filter conditions added for `awaitingreview`, `needschanges`, `rejected`. `TABS` array updated with three new tabs before Featured: Awaiting Review (amber, FaExclamationCircle), Needs Changes (amber, FaExclamationTriangle), Rejected (red, FaExclamationTriangle). Amber "Awaiting Review" count pill added to header. Status column added to table header and body — IIFE maps status to CSS class + label.
- `frontend/src/pages/AdminProductListPage.css` — six `.apl-status--*` classes added.

**Show password toggle on LoginPage:**
- `frontend/src/pages/LoginPage.jsx` — `FaEye`, `FaEyeSlash` imported from `react-icons/fa`. `showPassword` state added. Password `<Form.Control>` `type` changes to `{showPassword ? 'text' : 'password'}`. Eye toggle `<button>` added inside `.login-password-wrap` wrapper div with `aria-label`.
- `frontend/src/pages/LoginPage.css` — `.login-password-wrap` (position relative), `.login-input--password` (padding-right 44px to avoid text under toggle), `.login-eye-btn` (position absolute, right 12px, vertically centred, focus-visible ring).

**AdminEnquiriesPage header pills and tab badge counter fix:**
- Root cause of badge counter dropping to zero on tab click: `countByType` was computing counts from the filtered `enquiries` array (which changes when a type tab is clicked). When you click "General", only general enquiries are in the array, so all other tab badges show 0.
- Fix: `allEnquiries` state added. A separate `useEffect` fetches all enquiries once on mount without filters and stores them. `countByType`, `newCount`, `totalCount`, `actionedCount`, `closedCount` all now compute from `allEnquiries` instead of `enquiries`. Tab badges now stay stable regardless of which filter is active.
- Header count pills added: Total (neutral), Unread (red, only shown when > 0), Actioned (blue, only shown when > 0), Closed (green, only shown when > 0).
- New CSS classes: `.enq-page__pills`, `.enq-pill`, `.enq-pill--red`, `.enq-pill--blue`, `.enq-pill--green`.

**Seller Dashboard profile tab enriched:**
- Account summary grid added above the editable form: four stat cards (My Products, Total Orders, Pending Orders, Payouts Released) using `stats` data already fetched for the Overview tab
- Payout info strip added: M-Pesa number status (shows orange "Not set" warning if missing), KRA PIN status, Seller Status (shows "Approved")
- Payout policy note added: explains ShopZone releases payouts to M-Pesa number after delivery confirmation
- Editable form fields unchanged — still shows businessName, businessAddress, description, kraPin, mpesaNumber
- CSS classes added: `.sp-earnings`, `.sp-earnings__grid`, `.sp-earnings__card--amber`, `.sp-earnings__card--green`, `.sp-payout-info`, `.sp-payout-info__missing`

**Payment architecture discussed and documented:**
- ReceiptModal component discussed for future — printable receipt modal replacing the window.open approach
- Admin delivery fee edit discussed — admin should be able to correct the flat fee on unpaid orders
- Payment amount validation discussed — amount must be at least 95% of order total before confirmation (ISS-007)
- Payout automation: Daraja B2C API confirmed as the planned mechanism (DEC-022)

**Photography and image policy established (DEC-020):**
- Policy enforced via admin review, not automated detection
- Cloudinary moderation add-on planned in Step 22 for automated detection (phone numbers in images, AI renders, explicit content)
- Submission form tip panel communicates policy clearly to sellers

### Decisions Made
- DEC-019: Password change removed from ProfilePage — requires email verification via /forgot-password (Step 24)
- DEC-020: Seller product image is required at submission — no placeholder allowed
- DEC-021: Admin Communication Layer is a dedicated step between Step 15 and Step 24
- DEC-022: Payout automation uses Daraja B2C API in Step 20

### Issues Resolved
- ISS-R09: Seller image upload — FULLY RESOLVED
- ISS-R10: Product status change notifications — FULLY RESOLVED
- ISS-R11: AdminProductListPage approval queue — FULLY RESOLVED

### Issues Surfaced
- ISS-004: Screenshot upload on enquiry forms (ContactPage, BulkOrdersPage, BecomeSellerPage) — HIGH, linked to Step 15
- ISS-005: AdminEnquiriesPage Support tab with orderId display — HIGH, linked to Step 15
- ISS-006: Low stock notifications in createOrder — MEDIUM, linked to Step 11
- ISS-007: Payment amount validation before confirmation — MEDIUM, before Step 20

### Next Session Goal
ISS-004 + ISS-005 together (screenshot upload on enquiry forms + AdminEnquiriesPage Support tab), then ISS-006 (low stock notifications), then ISS-007 (payment amount validation)

---

## Template for New Sessions

```markdown
## SESSION-0XX — [Date]

**Goal:** [What you set out to do — be specific]

### What Got Done

[List every meaningful thing that changed. Include:]
- [File changed: what specifically changed in that file]
- [New file created: what it does]
- [Bug fixed: what the bug was and what the exact fix was]
- [Decision made: short reference — full entry goes in Decision Log]

### Decisions Made
- [Short references to decisions — full detail goes in 02_DECISION_LOG.md]

### Issues Resolved
- [ISS-XXX: short title — RESOLVED. What was done.]

### Issues Surfaced
- [ISS-XXX: short title — priority. What was found.]

### Next Session Goal
[The single most important thing to pick up next session. Be specific — not "continue building" but "paste AdminProductListPage.jsx and AdminProductListPage.css, add Awaiting Review and Rejected tabs"]
```
