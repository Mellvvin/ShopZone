# ShopZone Active Roadmap (SESSION-019 Update)

Working roadmap for everything discussed up to the end of the SESSION-019 build. It keeps unfinished work in execution order, records decisions already made, and gives each deferred item an ISS number and a reason. Issue numbers continue from ISS-058 (SESSION-018).

## Product Direction

ShopZone is a B2B wholesale platform in Nairobi, Kenya. Customers buy from ShopZone. Sellers sell through ShopZone. Supplier identity, contact details and location are never shown to customers, and sellers never contact customers directly.

Seller autonomy is the default for low-risk, seller-owned actions (price, stock, clearance). Admin steps in only when a seller asks for help, or when an automatic flag fires. Nothing a seller does is blocked behind manual admin approval except brand-new public listings.

## Non-Negotiable Rules (carried forward, plus new ones)

- All transactions and communication go through ShopZone.
- `Product.price` is the FULL UNIT price (a carton). Per-piece = price / itemsPerUnit, computed at render time only.
- The legacy `unit` field accepts only: Per Unit, Bale, Carton, Dozen, Kg, Box, Sack. `unitType` accepts more.
- The 13 category strings must match exactly. Product.js has no category enum.
- Price rule must be identical in `orderController.createOrder`, `cartSlice.effectivePricing` and `ProductPage.jsx`: a sale price applies only when `isOnSale` is true and `0 < salePrice < price`.
- Server is the price authority at checkout. The cart re-checks live prices on open (`refreshCartPrices`).
- Mongoose silently drops fields missing from the schema, so verify every schema change on the live Model file.
- Cart items use `item.product`, never `item._id`.
- CSS in dedicated files, no inline styles. Icons from `react-icons/fa` only.
- Header and CategoryBar never hide on scroll (condensing only).
- Avatars are initials-only. No photo uploads.
- Code is only written against a file supplied in the current session.
- Credentials: rotate the Atlas password that was pasted in an earlier chat and delete the plaintext `databse.txt`.

## Current Baseline (confirmed working)

- Header alignment fixed on desktop and mobile; greeting varies per page load (including Swahili variants).
- AnnouncementBar, BottomNav (shown at 991px and below: Home, Categories, Cart, Profile, More), BackRow (universal Back button), CategoriesPage at `/categories`, shared `frontend/src/data/categories.jsx`.
- Mobile top row is search and bell only, with 44px tap targets. MobileDrawer has a Home link.
- Chat widget responsive and reappears on every route change.
- Login redirect fixed (Register reads `?redirect=` or `state.from`). Duplicate login toast fixed.
- Sale price shown and charged consistently; cart and product page show regular price struck through.
- Mobile toast compact and above the bottom bar; "Go to Cart" link works.
- Applied and confirmed: clearance reverted to isOnSale-only (three files), BottomNav opaque gradient, header spacing and iOS 16px input zoom fix, Go Back removed from ProductPage, categories phase 1, Browse Deals pill override, CategoryBar glass fix.
- Database on MongoDB Atlas. 100 seeded products, 8 test sellers. Seeder clears Products and Orders only.

## Step 1: Mobile Drawer Fixes (IN PROGRESS, this pass)

Priority: High

Problems reported: drawer stays open when a bottom bar tab is tapped; scrolling the drawer scrolls the page behind it; Sign Out cannot be reached.

Diagnosed causes:
- The drawer renders inside the sticky header, which is its own stacking context (z-index 999), so its overlay can never rise above the bottom bar (z-index 1050).
- The panel is full height, so its bottom (Sign Out) sits underneath the bottom bar.
- Background scroll lock is only `body { overflow: hidden }`, which iOS Safari does not fully honour.

Fix: render the drawer through a portal on `document.body`, drop its layers just below the bottom bar, stop the panel above the bar, add scroll containment, and close on route change and on bottom bar taps.

## Step 2: Leftover Back-Button Sweep (ISS-070 / ISS-076)

Priority: Medium. BackRow is now the only Back control.

- Check HomePage toolbar ("Back to Home") and PlaceOrderPage (Back) were actually removed.
- Remove duplicates: FeaturedPage and NewArrivalsPage ("Back to Shop"), PaymentPage, AdminUserDetailPage (three), NotFoundPage.
- KEEP the guarded Back in AdminProductEditPage (it checks unsaved changes).

## Step 3: Search Filters and Sort (ISS-074)

Priority: High

- Sort: price low to high, high to low, newest, top rated.
- Filters: price range, brand, in stock, on sale. Mobile gets a filter sheet.
- State lives in the URL so Back restores it.
- Backend support needed in `productController.getProducts` (sort and price/brand/stock filters), plus `productSlice.listProducts` params.
- Files: productController.js, productRoutes.js, productSlice.js, ProductCard.jsx, HomePage.jsx.

## Step 4: Clearance Mechanics (ISS-071)

Priority: High. Decisions made:

- Clearance is its own concept, not Sale. New `clearancePrice` field (verify on live Product.js).
- Clearance takes precedence over sale when both are set.
- Once set, the clearance price can only go down.
- Clearance items are final sale: only wrong or damaged items are returnable.
- When stock reaches zero the product auto-archives and can never be restocked.
- Setting clearance is the seller's own choice. No admin approval.
- A clearance flag does not need a price change to be valid.
- Order lines snapshot `finalSale`.
- Proposed, awaiting approval: a "Final sale" label on product page, cart and order review, plus a checkout acknowledgement checkbox.
- ReturnsPolicyPage must state the clearance terms.

## Step 5: Seller Pricing Control (ISS-077 / ISS-078)

Priority: High

- Admin assist (ISS-077): admin may edit a seller's price or anything the seller is stuck on, with a required reason, logged, and the seller notified. Proposed: an Undo option on the seller's notification.
- Seller price edits (ISS-078), recommended and awaiting approval: go live immediately, with automatic flags feeding a "Flagged price changes" admin list. Flag triggers: single change over about 40 percent, far below category norms, sale discount over about 60 percent, price raised then put on sale. Review before live only for brand-new sellers until they have a few completed orders.
- Reuse the existing `priceDropFlag` pattern (read how productController uses it first).
- Every change is logged and the seller is notified.

## Step 6: Seller Product Management Overhaul (ISS-072)

Priority: High, three passes.

1. Product list like the admin's: status chips, price, category, brand, unit, stock, with filter tabs and search (absorbs ISS-037 and ISS-038).
2. Same full edit form as admin minus admin-only controls: real image upload, sale and clearance controls, wholesale fields, confirm-on-save modal. On its own page, not an inline form. Featured stays admin-only (it will later tie into an ad service).
3. Charts and graphs seller dashboard (absorbs ISS-039 and ISS-040). Re-upload the chart screenshots, they did not come through.

Also: ISS-023 (re-review only on image or category change, verify in sellerController) and ISS-041 (SellerOrderDetailPage with a seller-safe single-order endpoint).

## Step 7: Mobile Redesign of Cart and Profile (ISS-073)

Priority: Medium

- Cart: horizontal item cards, compact stepper, small remove icon, summary bar above the bottom nav.
- Profile: purpose-built mobile layout, My Orders as stacked cards (done at 768px and below), left-tab redesign (ISS-042). No photo upload field.

## Step 8: Buyer Experience Features

- ISS-046: buyer "Confirm Received" button on OrderPage (backend `PUT /:id/confirm-delivery` already live).
- ISS-044: wishlist heart on ProductPage and 15-item carousels for Recently Viewed on Cart and Home (backend complete).
- ISS-045: first-name-only reviewer display.
- ISS-054: related products (same-category query).
- ISS-052: seller-set sale countdown timer (`saleEndsAt`, lazy expiry on fetch, no cron).
- ISS-055: low stock indicator, sharing the existing 5-unit threshold constant.
- ISS-053: alternating savings/countdown text animation (CSS crossfade), after ISS-052.
- ISS-056: best-seller badge on a rolling 30-day window, with a mirrored price-increase flag.
- ISS-064 (optional): "Buy Again" block.

## Step 9: Catalogue and Data Housekeeping

- ISS-063: re-price the seeded catalogue realistically (per-piece price times itemsPerUnit).
- ISS-066 phase 2: finish category consolidation (CategoryCards, SearchBar, Footer, ShippingPage and PlaceOrderPage tier-2 lists, backend shippingRates tier 2, hard-coded "13" in BrandsPage and HeroBanner, admin CATEGORY_TAGS map). Do this only when a category is actually added or renamed.
- ISS-075 (image storage): uploaded product photos live in `backend/uploads` on local disk and would be lost in another OS wipe. Move to Cloudinary or equivalent (ties to Step 22).
- ISS-080: rename the ChatWidget CSS import to fix a filename-case mismatch.

## Step 10: Header and Chat Follow-Ups

- ISS-081: notification bell and greeting cutoff under some Chrome-mobile viewports (Chrome on iPhone and Responsively show neither when logged out, which is expected). Real iPhone Safari is the source of truth.
- ISS-051: greeting variety (done in part). Birthday greeting needs a separate explicit decision on collecting date of birth.
- ISS-033: ChatWidget timing polish. ISS-034: expand chatBrain.js topics.
- Mobile responsive pass on iPad: bottom bar shows at 991px and below (portrait iPad yes, landscape no).

## Step 11: Banner, Ads and Sponsorship

- ISS-049: category poster and banner CMS with placement targeting (homepage hero or a named category page) from the start.
- ISS-035 / ISS-057: seller ad placement via the Enquiry cost-plus quote pattern, manual activation until real payment automation exists (Daraja).
- Featured ties into this ad service later.

## Step 12: Admin Improvements

- ISS-028: AdminUserDetailPage into tabs (Orders, Products, Enquiries, Notifications).
- ISS-029: shared array-of-entries notes log on Enquiry and Order.
- ISS-009: dedicated admin order detail page (after Step 15).
- ISS-031: seller My Payments integration with Payment records.
- ISS-020, ISS-021: rejected-seller archive view, suspension history.

## Step 13: Large Systems (design before code)

- ISS-024: Product variations (sizes, colours). Own design pass first. Hard prerequisite for ISS-058.
- ISS-058: self-built product Q&A chat (keyword-to-field matcher, no AI API), only after ISS-024.
- Step 7 (roadmap): admin product approval audit history.
- Step 15: support tickets and returns/dispute flow (line-item disputes, refunds to original payment method).
- ISS-025: promotional notification trigger design.
- Step 16: escrow and payout hold UI.
- Step 20: M-Pesa STK Push and B2C payouts/refunds (Daraja).
- Step 23: backend request validation.
- Step 24: forgot password and email infrastructure.
- Step 35: logistics-only pickup and consolidation service (needs scoping).
- ISS-032: SMS preferences (needs an SMS provider).

## Step 14: Cleanup and Polish (last)

- ISS-008: mojibake cleanup. ISS-010: MobileDrawer accessibility, ShopZoneLogo inline styles, App container squeeze.
- ISS-043: final general mobile responsiveness pass.
- Design-tools polish pass (Aceternity, Mobbin, Refero, Godly, 10x), reference only.

## Closed

ISS-036 (Order.js fields verified), ISS-047 (icon alignment), ISS-048 (drawer Home link, visual parity unconfirmed), ISS-059 (sale price charged at checkout), toast sizing (ISS-075 in the handoff numbering).

## Suggested Execution Order

1. Mobile drawer fixes (Step 1)
2. Back-button sweep (Step 2)
3. Search filters and sort (Step 3)
4. Clearance mechanics (Step 4)
5. Seller pricing control (Step 5)
6. Seller product management, three passes (Step 6)
7. Cart and Profile mobile redesign (Step 7)
8. Buyer experience features (Step 8)
9. Catalogue re-pricing and housekeeping (Step 9)
10. Header and chat follow-ups (Step 10)
11. Banner and ads (Step 11)
12. Admin improvements (Step 12)
13. Large systems (Step 13)
14. Cleanup and polish (Step 14)

## Working Notes

- Several fixes per pass to save tokens.
- Every code reply ends with a testing checklist and a "Files needed next" list.
- Every deferred item has an ISS number and a reason.
