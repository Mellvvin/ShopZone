# ShopZone Project Roadmap

Use this as a working Notion document. Each section can become a Notion heading, and each checklist item can become a task card.

## Product Direction

ShopZone is not just a normal ecommerce store. It is a structured procurement and supply-chain platform for small retailers, remote businesses, group buyers, and individuals who need bulk goods but do not have easy access to reliable suppliers.

The operating model is:

- Customers buy from ShopZone.
- Suppliers/sellers sell through ShopZone.
- ShopZone controls pricing, customer communication, delivery, quality, and support.
- Supplier identity and direct supplier contact must stay private to prevent off-platform deals.

## Current State

The project already includes:

- Customer product browsing
- Product detail pages
- Cart flow
- User registration and login
- Shipping form
- Payment method selection
- Order placement
- Customer profile page
- Customer order history
- Product reviews
- Image upload route
- Backend admin-protected APIs for users, products, and orders

The main missing pieces are supplier privacy rules, seller onboarding, seller portal, admin approval workflows, real bulk-buying logic, quote/procurement flow, delivery planning, real payments, validation, tests, and production readiness.

## Core Business Rules

- Customers should never see supplier names, supplier contacts, supplier locations, supplier cost prices, or direct seller identifiers.
- Sellers should not directly contact customers through the platform.
- Customers communicate with ShopZone.
- Sellers communicate with ShopZone.
- ShopZone decides which seller products become public listings.
- ShopZone owns the customer price, margin, delivery promise, support process, and dispute handling.
- Public listings should show ShopZone-controlled information only.

## Phase 1: Clean Up And Stabilize

Execution gate:

- This phase now covers suggested steps 1 to 6.
- Do not move past this phase until secure order access, central error handling, and the first admin pages all work cleanly.
- Existing tasks in later admin phases are still planned; this phase pulls the first usable admin screens forward so the platform has a stable operating base.

### Task: Fix Corrupted Frontend Characters

Priority: High

Some frontend files contain corrupted/mojibake characters in comments and visible UI labels/icons.

Checklist:

- Review `frontend/src/components/Header.jsx`
- Review `frontend/src/pages/ProfilePage.jsx`
- Review `frontend/src/pages/PaymentPage.jsx`
- Review `frontend/src/pages/OrderPage.jsx`
- Replace corrupted comments with normal ASCII comments
- Replace corrupted visible icons with proper text or React icon components
- Run frontend lint/build after cleanup

Acceptance criteria:

- No corrupted characters remain in visible UI
- Frontend still builds successfully
- Navigation and dropdowns still work

### Task: Secure Order Access

Priority: High

Currently, any logged-in user can request an order by ID. The backend should only allow the order owner or an admin to view an order.

Checklist:

- Update `getOrderById` in `backend/controllers/orderController.js`
- Check whether `order.user` matches `req.user._id`
- Allow access if `req.user.isAdmin` is true
- Return `401` or `403` if the user is not authorized
- Test with owner user, another user, and admin user

Acceptance criteria:

- Users cannot access other customers' orders
- Admins can access all orders
- Existing order page still works for the correct user

### Task: Add Central Error Middleware

Priority: High

The backend currently handles errors inside each controller. Centralized middleware will make responses more consistent.

Checklist:

- Add `backend/middleware/errorMiddleware.js`
- Add `notFound` middleware for unknown routes
- Add `errorHandler` middleware for server errors
- Register middleware in `backend/server.js`
- Gradually simplify controller error handling

Acceptance criteria:

- Unknown API routes return a clean `404`
- Server errors return consistent JSON
- Existing API behavior remains intact

### Task: Foundation Admin Pages

Priority: High

These are the first admin screens needed before expanding product, seller, and order workflows.

Suggested step mapping:

- Step 3: Admin Product List Page
- Step 4: Admin Product Edit Page
- Step 5: Admin Order List Page
- Step 6: Admin User List Page

Checklist:

- Build or finish admin product list page
- Allow admin to view all products
- Allow admin to create new products from the browser
- Allow admin to delete or archive products safely
- Build or finish admin product edit page
- Connect browser image upload to product create/edit
- Build admin order list page
- Allow admin to view all orders
- Allow admin to mark orders as delivered where appropriate
- Build admin user list page
- Allow admin to view all users
- Allow admin to assign roles and manage accounts
- Keep backend admin middleware as the real security layer

Acceptance criteria:

- Admin can manage products without Postman
- Admin can view and update orders from the browser
- Admin can view users and manage roles
- Non-admin users cannot access these pages or APIs

## Polish Session After Phase 1: Icons And Brand

Execution note:

- This session covers suggested steps 7 and 8.
- Do these together after the foundation admin pages work cleanly and before the product/homepage upgrade.

### Task: Replace Emojis With React Icons

Priority: Medium

Use one consistent icon system across the app instead of mixed emoji characters.

Checklist:

- Find emoji usage in visible UI
- Replace navigation, buttons, status labels, and decorative UI emoji with React Icons
- Keep text labels where icons alone would be unclear
- Check header, footer, product cards, cart, checkout, profile, admin pages, and support links
- Run frontend lint/build after replacement

Acceptance criteria:

- Visible UI no longer depends on emoji characters
- Icons render consistently across browsers and devices

### Task: Add ShopZone Logo

Priority: Medium

Create and use a proper ShopZone logo in the navbar and footer.

Checklist:

- Design or add a ShopZone logo asset
- Add logo to navbar
- Add logo to footer
- Keep logo legible on desktop and mobile
- Preserve accessible text for screen readers

Acceptance criteria:

- Navbar and footer use the same ShopZone brand mark
- Logo does not break layout on small screens

## Phase 2: Bulk Commerce Foundations

Execution note:

- This phase now covers the product and homepage upgrade path from suggested steps 9 to 13.
- Complete these in order because categories, search, homepage sections, and special offers depend on the product model fields.

### Task: Add Bulk Units And Minimum Order Quantities

Priority: High

ShopZone needs to support wholesale-style buying, not only single-item retail orders.

Suggested product fields:

- `unitType`: bale, carton, sack, dozen, kg, box, piece
- `minimumOrderQuantity`
- `itemsPerUnit`
- `weightPerUnit`
- `dimensions`
- `isBulkOnly`
- `leadTimeDays`

Checklist:

- Update product model
- Update product seed data
- Update product create/edit APIs
- Update product cards and product detail pages
- Show minimum order quantity clearly
- Prevent cart quantities below minimum order quantity

Acceptance criteria:

- Products can be sold by bale, carton, sack, dozen, kg, box, or piece
- Customers cannot checkout below the minimum order quantity
- Product pages clearly explain the buying unit

### Task: Update Product Model For Merchandising

Priority: High

Add fields needed for homepage sections, sale views, wholesale logic, and seller/admin product management.

Suggested fields:

- `tags`
- `isFeatured`
- `isOnSale`
- `isClearance`
- `salePrice`

Checklist:

- Update `backend/models/Product.js`
- Update product seed data
- Update product create/update APIs
- Update admin product forms
- Validate tags and sale fields
- Show sale and clearance pricing correctly on customer pages

Acceptance criteria:

- Products can be tagged and promoted
- Admin can mark products as featured, on sale, or clearance
- Sale price is handled consistently and never produces invalid pricing

### Task: Expand Product Categories

Priority: High

Use a broader category list that matches ShopZone's wholesale and general merchandise direction.

Categories:

- Electronics
- Fashion & Apparel
- Fabric & Textiles
- Home & Kitchen
- Food & Grocery
- Beauty & Personal Care
- Hardware & Tools
- Office & Stationery
- Agriculture & Garden
- Baby & Kids
- Sports & Outdoors
- Health & Wellness
- General Merchandise

Checklist:

- Update product model/category validation where applicable
- Update seed data categories
- Update admin product form category options
- Update customer category navigation and filters

Acceptance criteria:

- Admin can assign products to the expanded categories
- Customer category filters match the same source of truth

### Task: Update Search Across Product Fields

Priority: High

Search should match more than the product name.

Checklist:

- Search across product name
- Search across category
- Search across description
- Search across tags
- Keep search compatible with category and filter query params
- Add backend validation for search input

Acceptance criteria:

- Customers can find products by name, category, description, or tag
- Search works together with filters and pagination

### Task: Homepage Product And Category Redesign

Priority: High

The homepage should help customers quickly browse the key buying paths.

Sections:

- Hero banner
- Category cards
- Featured products
- New arrivals
- Clearance section

Checklist:

- Update homepage layout
- Add data queries for featured products
- Add data queries for new arrivals
- Add data queries for clearance products
- Keep cards consistent with product pricing, sale, stock, and MOQ display

Acceptance criteria:

- Homepage highlights current buying opportunities
- Featured, new arrival, and clearance sections are data-driven

### Task: Add Special Offers Page

Priority: Medium

Customers should have a dedicated page for sale and clearance products.

Checklist:

- Add special offers route
- Filter products where `isOnSale` or `isClearance` is true
- Show regular price and sale price clearly
- Add navigation link where appropriate
- Keep filters and search usable on the offers page

Acceptance criteria:

- Customers can browse sale and clearance products in one place
- Offers page uses the same product card rules as the rest of the shop

### Task: Add Tiered Wholesale Pricing

Priority: High

Customers should see volume discounts, while supplier cost and ShopZone margin remain private.

Example customer-facing pricing:

- 1-2 cartons: KSh 2,000 each
- 3-9 cartons: KSh 1,850 each
- 10+ cartons: request quote

Admin-only pricing:

- supplier cost
- ShopZone margin
- transport estimate
- handling cost
- final selling price

Checklist:

- Add pricing tiers to product model
- Calculate price based on quantity
- Show pricing tiers on product detail page
- Apply correct tier in cart and checkout
- Keep supplier cost hidden from customers and sellers where not needed

Acceptance criteria:

- Bulk discounts work correctly
- Customers only see ShopZone selling prices
- Internal cost and margin are visible only to admin

Suggested step mapping:

- Step 23: Tiered wholesale pricing

### Task: Add Inventory Protection

Priority: High

Orders can currently be created without reducing product stock.

Checklist:

- Check product stock before creating an order
- Prevent order creation if requested quantity exceeds stock
- Reduce `countInStock` after a successful order or payment
- Decide whether stock should reduce at order placement or payment confirmation
- Restore stock if an unpaid order is cancelled
- Prevent cancelled orders from being paid or delivered

Acceptance criteria:

- Customers cannot buy more than available stock
- Stock updates correctly after order creation/payment
- Cancelled unpaid orders restore stock if stock had been reserved

Suggested step mapping:

- Step 24: Inventory protection

### Task: Add Request Goods And Request Quote Flow

Priority: High

Many customers may need goods that are not listed publicly. ShopZone should let customers request sourcing while keeping suppliers private.

Customer submits:

- item name
- quantity
- unit type
- location
- desired delivery date
- budget range
- optional image
- notes

Admin sees:

- customer request
- internal supplier sourcing notes
- supplier offers/costs
- margin calculation
- quote draft
- quote status

Customer sees:

- ShopZone quote
- final price
- delivery estimate
- payment terms
- accept/reject action

Suggested quote statuses:

- request received
- sourcing
- quote sent
- accepted
- rejected
- expired
- cancelled

Acceptance criteria:

- Customers can request unavailable or custom bulk goods
- Admin can source privately and send a ShopZone quote
- Customers never see supplier identity or supplier pricing

Suggested step mapping:

- Step 22: Request goods flow

## Phase 3: User Profiles And Access Roles

Execution note:

- This phase includes suggested step 14 for seller role/middleware and suggested step 26 for buyer profile enrichment.
- Manual seller approval through MongoDB can be used as an early temporary workflow before the full admin seller approval UI exists.

### Task: Add Retailer And Bulk Buyer Profiles

Priority: High

ShopZone should understand whether a customer is a retailer, individual bulk buyer, institution, or group buyer.

Customer profile fields:

- buyer type
- business name, optional
- business category, optional
- location
- preferred product categories
- typical order size
- preferred delivery or pickup point
- payment preference

Admin-only fields:

- trust level
- credit eligibility
- average order value
- quote history
- dispute history
- internal notes

Acceptance criteria:

- Customers can identify their buyer type
- Admin can see operational details without exposing internal notes to customers

Suggested step mapping:

- Step 26: Buyer profile enrichment

### Task: Add Role-Based Access

Priority: High

The platform needs clear roles for customer, admin, and seller.

Suggested roles:

- customer
- seller applicant
- seller
- admin

Checklist:

- Update user model or add role fields
- Add `isSeller` field if using the current `isAdmin` style before moving to a richer roles array
- Add seller approval flag/status if needed
- Add backend middleware for role checks
- Add seller middleware
- Add frontend protected routes
- Keep admin APIs restricted to admins
- Keep seller portal restricted to approved sellers
- Support temporary manual seller approval through MongoDB until the admin approval screen exists

Acceptance criteria:

- Customers cannot access admin or seller screens
- Sellers cannot access admin-only controls
- Admin can manage both customers and sellers

Suggested step mapping:

- Step 14: Seller role and middleware

## Phase 4: Seller Portal And Approval Workflow

Execution note:

- This phase covers suggested steps 15 and 18, while preserving the larger seller privacy and approval workflow already planned.
- Seller-facing work can run in parallel with content pages after the product model upgrade is complete.

### Task: Add Seller Application Flow

Priority: High

Sellers should be able to apply to supply products through ShopZone, but they should not become visible to customers.

Seller application fields:

- seller name or business name
- contact person
- phone/email
- location
- product categories supplied
- capacity or stock range
- delivery/pickup capability
- business documents, optional
- notes

Checklist:

- Add public "Become a Seller" page
- Add seller application instructions for manual approval expectations
- Add seller application API
- Store applications separately from approved seller accounts
- Add admin application review page
- Allow admin to approve, reject, or request more information
- Create seller account only after approval

Acceptance criteria:

- Sellers can apply
- Admin can approve or reject sellers
- Customers cannot see seller applications or seller identities

Suggested step mapping:

- Step 18: Become a seller page

### Task: Add Seller Portal

Priority: High

Approved sellers need a private portal to manage what they can supply.

Seller portal features:

- seller login
- seller dashboard
- seller profile
- product upload
- product photo upload
- product photo replacement request
- product edit
- product removal request
- stock updates
- price updates
- lead time updates
- seller order/procurement requests from ShopZone
- seller payout/payment tracking
- messages between ShopZone and seller only

Important rules:

- Seller products should not go public automatically.
- Admin must review and approve public listings.
- Admin must review and approve seller-uploaded photos before public display.
- Seller cannot see customer contact details.
- Seller cannot message customers.
- Seller cannot control the final customer-facing ShopZone price unless ShopZone chooses to use it.
- Seller-submitted photos should be rejected or edited if they expose supplier identity, phone numbers, warehouse details, or direct off-platform contact information.

Acceptance criteria:

- Approved sellers can manage their private catalog
- Sellers can view and manage their own products and fulfillment requests/orders
- Seller submissions require admin approval before public display
- Seller-uploaded photos require admin approval before public display
- Seller cannot access customer identity/contact information beyond what ShopZone explicitly allows for fulfillment

Suggested step mapping:

- Step 15: Seller dashboard

### Task: Add Admin Seller Management

Priority: High

Admin needs full control over sellers and supplier privacy.

Admin seller management features:

- seller list
- seller application review
- seller profile details
- seller contact information
- seller product catalog
- seller submitted prices
- ShopZone selling price
- supplier cost
- reliability notes
- lead times
- payout/payment status
- suspend/reactivate seller

Acceptance criteria:

- Admin can manage sellers privately
- Admin can approve seller products into public ShopZone listings
- Supplier cost and seller contact data are never exposed to customers

### Task: Add Product Approval Workflow

Priority: High

Seller product uploads should go through ShopZone review.

Suggested statuses:

- draft
- submitted
- needs changes
- approved
- rejected
- archived

Checklist:

- Add seller product submission model or fields
- Let seller submit product details
- Let admin review submitted products
- Let admin set final public title, description, price, category, images, and availability
- Publish only approved products

Acceptance criteria:

- Seller submissions do not appear publicly until approved
- Admin controls customer-facing product data
- Customers see ShopZone listings, not seller-managed raw submissions

## Phase 5: Admin Dashboard And Operations

### Task: Add Admin Product Upload And Editing Portal

Priority: High

This should be one of the first practical admin features because adding products through Postman is slow and does not scale. Admin should be able to populate and maintain the public catalog from the browser.

Admin product upload features:

- create product
- upload product photos
- replace product photos
- remove product photos
- reorder product photos
- edit product title
- edit product description
- edit category
- edit unit type, for example bale, carton, sack, dozen, kg, box, or piece
- edit minimum order quantity
- edit stock
- edit regular price
- edit tiered bulk prices
- edit lead time
- publish or unpublish product
- archive product instead of permanently deleting when order history depends on it

Photo rules:

- Customer-facing photos should not reveal private supplier names, phone numbers, labels, watermarks, warehouse details, or direct supplier identity.
- Admin should be able to replace seller-submitted photos before publishing.
- Only approved photos should appear on public product pages.

Acceptance criteria:

- Admin can add products without Postman
- Admin can upload and manage product photos from the browser
- Admin can update price, stock, units, MOQ, and availability
- Customers only see published ShopZone-approved product data

### Task: Add Admin Route Protection On Frontend

Priority: High

The backend has admin APIs, but the frontend needs admin-only screens and route guards.

Checklist:

- Create an admin route wrapper/component
- Redirect non-admin users away from admin pages
- Show admin links only for admin users
- Keep backend admin middleware as the real security layer

Acceptance criteria:

- Non-admin users cannot view admin UI
- Admin users can access admin pages from navigation

### Task: Product Management UI

Priority: High

Admin users need product create/edit/delete screens that support bulk supply-chain products.

Checklist:

- Add product list admin page
- Add create product page or modal
- Add edit product page
- Add delete/archive confirmation
- Connect image upload
- Show stock, price, category, unit, MOQ, tiered pricing, lead time, and public/private status
- Link public listings to private seller submissions where applicable

Acceptance criteria:

- Admin can create and edit public ShopZone products
- Admin can hide or archive products
- Product changes appear on customer pages only after admin approval

### Task: Order And Procurement Management UI

Priority: High

Admin users need to manage both customer orders and private seller fulfillment.

Checklist:

- Add admin order list page
- Show customer, location, date, total, payment status, delivery status, and order status
- Add order detail view for admin
- Add seller/procurement assignment area
- Add internal notes
- Add mark-as-paid and mark-as-delivered actions where appropriate
- Add status update actions

Acceptance criteria:

- Admin can see all customer orders
- Admin can privately coordinate fulfillment with sellers
- Customer order history reflects ShopZone-controlled status updates

### Task: User Management UI

Priority: Medium

Backend user admin routes already exist, but roles need to support customers, sellers, and admins.

Checklist:

- Add admin user list page
- Add user detail/edit page
- Allow role management
- Add delete/deactivate user action
- Prevent accidental deletion of the current admin account

Acceptance criteria:

- Admin can view customers and sellers
- Admin can update user roles safely
- Admin can deactivate users without breaking order history

### Task: Admin Summary Dashboard

Priority: Medium

The dashboard should focus on supply-chain operations, not just store totals.

Checklist:

- Show total orders
- Show total revenue
- Show pending quotes
- Show pending seller applications
- Show pending product approvals
- Show pending procurement tasks
- Show low-stock products
- Show active delivery routes
- Show recent order issues

Acceptance criteria:

- Admin can quickly understand store and supply operations
- Dashboard data loads from backend APIs

## Phase 6: Communication, Support, And Privacy

Execution note:

- This phase includes suggested step 17 for the contact support page.
- Content pages from suggested steps 16 to 20 can be built in parallel with seller workflow once the product model upgrade is complete.

### Task: Add ShopZone-Mediated Messaging

Priority: High

All communication should go through ShopZone.

Customer-facing ticket types:

- product question
- quote request
- delivery question
- order issue
- return/replacement request
- bulk sourcing request

Seller-facing ticket types:

- product clarification
- stock confirmation
- fulfillment request
- price update discussion
- payout question

Checklist:

- Add support/ticket model
- Add customer support page
- Add contact support form
- Send support form submissions to `support@shopzone.com` or store them for admin review before email delivery is configured
- Add seller message area
- Add admin ticket inbox
- Add internal notes visible only to admin
- Prevent customer-seller direct messaging

Acceptance criteria:

- Customers communicate with ShopZone only
- Sellers communicate with ShopZone only
- Admin can manage both sides from one place

Suggested step mapping:

- Step 17: Contact support page

### Task: Add Quality Control And Dispute Handling

Priority: Medium

Because supplier identity is private, ShopZone must own customer trust.

Checklist:

- Add ShopZone verified product badge
- Add quality grade fields
- Add inspection status
- Add issue reporting
- Add replacement/refund request flow
- Add proof of dispatch
- Add proof of delivery
- Track seller performance internally

Acceptance criteria:

- Customers know ShopZone stands behind product quality
- Admin can track supplier reliability privately
- Order problems have a clear resolution workflow

## Phase 7: Delivery And Regional Supply

### Task: Add Delivery Zones And Pickup Points

Priority: High

Remote access is central to the product. Delivery cannot be treated as a small checkout detail.

Customer-facing:

- delivery available/not available
- delivery fee estimate
- pickup point options
- estimated delivery date
- next delivery window

Admin-facing:

- seller pickup location
- ShopZone consolidation point
- route planning
- driver/dispatch notes
- delivery cost breakdown

Acceptance criteria:

- Customers can see realistic delivery options
- Admin can plan fulfillment without revealing supplier locations

### Task: Add Route-Based Delivery Planning

Priority: Medium

ShopZone can reduce delivery costs by grouping remote-area orders.

Checklist:

- Add delivery route model
- Assign orders to routes
- Add route delivery dates
- Add route capacity
- Add admin route management page
- Notify customers of route delivery windows

Acceptance criteria:

- Admin can group deliveries by region
- Customers receive clear delivery estimates

## Phase 8: Group Buying And Repeat Orders

### Task: Add ShopZone-Managed Group Buying

Priority: Medium

Group buying can help remote retailers and individuals unlock bulk prices and shared delivery.

Customer-facing:

- join a ShopZone group order
- see target quantity
- see deadline
- see final group price
- see delivery or pickup point
- pay individual portion

Admin-facing:

- private seller options
- procurement notes
- group margin
- fulfillment plan
- split orders by customer

Acceptance criteria:

- Customers can join group buys without seeing suppliers
- ShopZone manages supplier sourcing privately

### Task: Add Repeat Orders And Restock Reminders

Priority: Medium

Retailers often buy the same goods repeatedly.

Checklist:

- Add reorder previous order
- Add saved frequent products
- Add weekly/monthly restock reminders
- Add suggested reorder quantities
- Add customer restock plan

Acceptance criteria:

- Customers can quickly repeat common orders
- ShopZone can forecast demand better

## Phase 9: Payments And Credit

### Task: Integrate M-Pesa STK Push

Priority: High

M-Pesa is likely the most important real payment method for this project.

Production note:

- Safaricom Daraja production access requires the correct business account setup and a reachable live domain/callback URL.

Checklist:

- Choose Safaricom Daraja sandbox first
- Add backend payment route
- Store required M-Pesa environment variables
- Initiate STK Push from order page
- Handle callback from M-Pesa
- Mark order as paid only after confirmed success
- Store payment reference/result on the order

Acceptance criteria:

- Customer can initiate M-Pesa payment
- Backend receives payment result
- Paid orders update correctly
- Failed payments do not mark orders as paid

Suggested step mapping:

- Step 27: M-Pesa payment integration

### Task: Add Deposits And Partial Payments

Priority: Medium

Large bulk orders may require deposits or staged payments.

Checklist:

- Add required deposit amount
- Add balance due amount
- Add payment status tracking
- Prevent fulfillment before required payment threshold
- Allow admin to confirm manual payments

Acceptance criteria:

- Large orders can be paid in stages
- Admin can track balance due

### Task: Add Pay-Later Controls For Verified Retailers

Priority: Low

Pay-later should be controlled carefully and only for approved buyers.

Checklist:

- Add customer credit eligibility
- Add credit limit
- Add admin approval flow
- Add outstanding balance tracking
- Block new credit orders when over limit

Acceptance criteria:

- Only approved buyers can use credit
- Admin can monitor credit risk

### Task: Add PayPal Or Card Payment

Priority: Medium

The UI already mentions PayPal or credit card.

Checklist:

- Decide whether to keep PayPal
- Add official PayPal checkout frontend integration
- Add backend confirmation route
- Store payment result on order
- Handle success and failure states

Acceptance criteria:

- PayPal/card payment can mark an order as paid
- Customer receives clear feedback after payment

### Task: Add Bank Transfer Instructions

Priority: Low

Bank transfer can be manual at first.

Checklist:

- Add ShopZone bank details or payment instructions
- Add "awaiting confirmation" state
- Let admin manually mark bank transfer orders as paid
- Never expose seller bank details to customers

Acceptance criteria:

- Bank transfer orders are clearly marked as unpaid/pending confirmation
- Admin can confirm payment manually

## Phase 10: Customer Experience

### Task: Improve Product Filtering

Priority: Medium

The category bar currently searches by keyword. Replace this with real filters.

Checklist:

- Add category filtering
- Add unit type filtering
- Add minimum order filtering
- Add price range filtering
- Add rating filtering
- Add in-stock filtering
- Add delivery-region filtering
- Add sort by newest, price, rating, and lead time
- Update backend query handling
- Update frontend state and URL query params

Acceptance criteria:

- Customers can narrow product results accurately
- Filters work together
- Search still works

### Task: Add Pagination

Priority: Medium

Product and order lists currently return all records.

Checklist:

- Add backend pagination for products
- Add backend pagination for admin orders
- Add backend pagination for users
- Add backend pagination for seller products
- Add pagination controls on frontend
- Preserve filters/search while paginating

Acceptance criteria:

- Large lists load efficiently
- Users can move between pages

### Task: Add Wishlist Or Saved Procurement List

Priority: Medium

For this platform, saved items should support repeat sourcing, not just casual shopping.

Checklist:

- Add wishlist or saved procurement list
- Add add/remove API
- Add saved items page
- Add save button on product cards/details
- Allow saved items to become quote/order requests

Acceptance criteria:

- Logged-in customers can save products
- Saved items support repeat bulk buying

Suggested step mapping:

- Step 21: Wishlist / saved items

### Task: Add FAQ And Support Pages

Priority: Low

Navigation currently mentions FAQ and contact support, but those routes are not implemented.

Checklist:

- Add FAQ page
- Answer common customer, seller, delivery, payment, return, and bulk-buying questions
- Wire FAQ navbar link to the actual route
- Add contact/support page
- Add support form that sends to `support@shopzone.com` or stores submissions for admin handling
- Add return/refund policy page
- Document 7 day return policy and how customers report issues
- Add shipping policy page
- Document rates, timelines, county coverage, delivery limits, and pickup options
- Add seller application information page
- Explain how to become a seller and how approval works
- Wire menu links to actual routes

Acceptance criteria:

- Header links do not lead nowhere
- Customers and seller applicants can find basic support information

Suggested step mapping:

- Step 16: FAQ page
- Step 17: Contact support page
- Step 18: Become a seller page
- Step 19: Shipping policy page
- Step 20: Returns policy page

## Phase 11: Backend Validation And Data Safety

Execution note:

- This phase includes suggested steps 25 and 29.
- Validation should be added before production deployment and before public seller/customer data grows.

### Task: Add Request Validation

Priority: High

Controllers currently trust incoming request body data too much.

Checklist:

- Validate registration fields
- Validate login fields
- Validate product create/update fields
- Validate seller application fields
- Validate seller product submission fields
- Validate quote request fields
- Validate order creation payload
- Validate shipping address fields
- Validate prices and quantities as positive numbers
- Validate review rating between 1 and 5
- Handle invalid MongoDB IDs cleanly

Acceptance criteria:

- Bad input returns clear `400` responses
- Invalid IDs do not crash or return confusing errors
- Product/order/seller data in the database stays consistent

Suggested step mapping:

- Step 29: Backend request validation

### Task: Improve Order And Procurement Statuses

Priority: Medium

Order status currently supports only `pending` and `cancelled`.

Suggested customer order statuses:

- pending
- awaiting payment
- paid
- sourcing
- procurement confirmed
- preparing dispatch
- in transit
- ready for pickup
- delivered
- cancelled
- refunded

Suggested seller fulfillment statuses:

- requested
- confirmed
- unavailable
- preparing
- ready for pickup
- handed over
- cancelled

Checklist:

- Update `backend/models/Order.js`
- Add procurement/fulfillment status fields
- Update order creation default status
- Update payment logic
- Update delivery/admin logic
- Update customer order pages
- Update admin order pages
- Update seller portal fulfillment pages

Acceptance criteria:

- Customer status reflects ShopZone progress
- Seller fulfillment status remains internal
- Cancel, pay, source, dispatch, and deliver actions follow valid transitions

Suggested step mapping:

- Step 25: Order status expansion

## Phase 12: Testing And Quality

Execution note:

- This phase covers suggested steps 30 and 31.
- Add backend coverage first for auth, orders, products, and seller flows, then add focused React Testing Library coverage for customer and admin flows.

### Task: Add Backend Tests

Priority: High

There are no real tests yet.

Checklist:

- Choose Jest or another test runner
- Add test database setup
- Test auth registration/login
- Test protected routes
- Test admin-only routes
- Test seller-only routes
- Test product CRUD
- Test seller application approval
- Test product approval workflow
- Test quote request flow
- Test order creation
- Test order cancellation
- Test order access authorization

Acceptance criteria:

- Backend test command runs successfully
- Critical API behavior is covered

Suggested step mapping:

- Step 30: Backend tests

### Task: Add Frontend Tests

Priority: Medium

Frontend tests can start small.

Checklist:

- Choose React Testing Library
- Test login/register forms
- Test cart behavior
- Test protected page redirect behavior
- Test admin route protection
- Test seller route protection
- Test product list loading states
- Test order page states

Acceptance criteria:

- Core customer, admin, and seller flows have basic coverage
- Components do not regress silently

Suggested step mapping:

- Step 31: Frontend tests

### Task: Add Lint And Build Checks

Priority: Medium

The frontend has lint/build scripts. The root project should make quality checks easy.

Checklist:

- Add root `build` script
- Add root `lint` script
- Add backend linting if desired
- Add root `test` script after tests exist
- Document commands in README

Acceptance criteria:

- One command can check frontend build
- One command can run lint/tests

## Phase 13: Production Readiness

Execution note:

- This phase covers suggested steps 28, 32, 33, and 34.
- Start this phase only when the platform is feature complete enough for real users, real products, and real payment configuration.

### Task: Improve Environment Configuration

Priority: High

The project should clearly document required environment variables.

Checklist:

- Add `.env.example` for backend
- Document `MONGO_URI`
- Document `JWT_SECRET`
- Document `PORT`
- Document payment provider variables
- Document storage provider variables
- Avoid committing real secrets

Acceptance criteria:

- A new developer can configure the project without guessing
- No secret values are committed

### Task: Production Image Storage

Priority: Medium

Local `backend/uploads` works in development but is risky for production.

Options:

- Cloudinary
- AWS S3
- Firebase Storage
- Supabase Storage

Checklist:

- Choose storage provider, with Cloudinary as the first suggested option
- Update upload route
- Store remote image URLs on products
- Validate image size/type
- Support customer request images
- Support seller product images
- Keep local upload only for development if useful

Acceptance criteria:

- Product and request images persist reliably in production
- Uploads are validated

Suggested step mapping:

- Step 28: Cloudinary image storage

### Task: Deployment Setup

Priority: Medium

Prepare the app for hosting.

Checklist:

- Decide hosting target for backend
- Decide hosting target for frontend
- Configure production CORS
- Configure frontend API base URL
- Add production build instructions
- Test deployed frontend against deployed backend

Acceptance criteria:

- Frontend and backend work from deployed URLs
- API calls succeed in production

Suggested step mapping:

- Step 33: Deployment

### Task: Update README

Priority: Medium

The README should explain how to run, test, seed, and deploy the project.

Checklist:

- Add project overview
- Explain ShopZone's private supplier model
- Add tech stack
- Add installation steps
- Add environment setup
- Add seed command
- Add development commands
- Add build commands
- Add test commands once available
- Add demo customer/admin/seller credentials
- Add screenshots if available

Acceptance criteria:

- Someone else can run the project from the README alone
- The business model is clear from the documentation

Suggested step mapping:

- Step 32: README

### Task: Add Frontend Documentation

Priority: Medium

Document the frontend with the same level of clarity as the backend docs.

Checklist:

- Document frontend folder structure
- Explain every page component
- Explain every reusable component
- Explain Redux store and slices
- Explain routing and protected route behavior
- Explain API call patterns
- Explain styling conventions
- Document how to run, lint, build, and test the frontend

Acceptance criteria:

- A new developer can understand what every frontend file does
- Frontend documentation matches the style and completeness of the backend docs

Suggested step mapping:

- Step 34: Frontend documentation

## Suggested Work Order

1. Fix corrupted frontend characters
2. Secure order access
3. Add admin route protection
4. Add admin product upload and editing portal so products no longer need to be added through Postman
5. Add bulk units, MOQ, and tiered pricing to admin product forms and customer pages
6. Add backend validation and central error middleware
7. Add inventory protection
8. Add role-based access for customer, seller, and admin
9. Add seller application flow
10. Add seller portal with product/photo submission
11. Add admin seller management and product approval workflow
12. Add request goods/request quote flow
13. Add admin order and procurement management
14. Add ShopZone-mediated messaging and support tickets
15. Add delivery zones and pickup points
16. Add M-Pesa payment integration
17. Add group buying and repeat orders
18. Add tests
19. Prepare environment/deployment documentation

## Suggested 34-Step Execution Order

Use this as the Notion execution checklist. Items that already exist elsewhere in the roadmap should stay where they are and be linked back to the phase/task instead of being deleted.

### Foundation: Finish Before Moving On

1. Secure order access so users cannot view other users' orders
2. Add central error middleware for consistent API error responses
3. Build/admin Product List Page to view all products, delete/archive, and create new products
4. Build/admin Product Edit Page to create and edit products with browser image upload
5. Build/admin Order List Page to view all orders and mark orders as delivered
6. Build/admin User List Page to view users, assign roles, and manage accounts

Do not move past step 6 until all admin pages work cleanly.

### Polish Session

7. Replace all emojis with React Icons for a consistent icon system
8. Design and add the ShopZone logo to the navbar and footer

Do steps 7 and 8 together in one session.

### Product And Homepage Upgrade

9. Update the Product model with `tags`, `isFeatured`, `isOnSale`, `isClearance`, and `salePrice`
10. Expand categories to Electronics, Fashion & Apparel, Fabric & Textiles, Home & Kitchen, Food & Grocery, Beauty & Personal Care, Hardware & Tools, Office & Stationery, Agriculture & Garden, Baby & Kids, Sports & Outdoors, Health & Wellness, and General Merchandise
11. Update search to query name, category, description, and tags together
12. Redesign homepage with hero banner, category cards, featured products, new arrivals, and clearance section
13. Add Special Offers page for sale and clearance products

Do steps 9 to 13 in order because each one depends on the product model upgrade.

### Seller And Content Pages

14. Add seller role and middleware using `isSeller`, seller middleware, and manual approval through MongoDB until admin approval UI exists
15. Add seller dashboard so sellers can manage their own products and orders/fulfillment requests
16. Add FAQ page and wire up the navbar link
17. Add Contact Support page with a form for `support@shopzone.com` and wire up the navbar link
18. Add Become a Seller page with information and application instructions
19. Add Shipping Policy page with rates, timelines, and county coverage
20. Add Returns Policy page with the 7 day policy and issue reporting flow

Steps 14 to 20 can run in parallel once the product model is updated.

### Advanced Commerce Features

21. Add Wishlist / Saved Items for repeat bulk buying
22. Add Request Goods flow where customers submit sourcing requests and admin quotes privately
23. Add tiered wholesale pricing for volume discounts such as 1-2 units, 3-9 units, and 10+ on request
24. Add inventory protection so stock reduces on order and restores on cancellation where appropriate
25. Expand order statuses to pending, sourcing, in transit, delivered, refunded, and related internal states
26. Enrich buyer profiles with buyer type, business name, and preferred categories

Tackle steps 21 to 26 after the platform is stable and populated with real products.

### Production Readiness

27. Integrate M-Pesa payments through Safaricom Daraja when a live domain and business account are ready
28. Move production image storage to Cloudinary or another cloud storage provider
29. Add backend request validation for all incoming data
30. Add backend tests with Jest covering auth, orders, products, and seller flows
31. Add frontend tests with React Testing Library covering key customer and admin flows
32. Update README with setup, seed, deploy, and business model documentation
33. Choose hosting and configure production CORS and environment variables
34. Add frontend documentation in the same style as backend docs, covering every file and function

Only start steps 27 to 34 when the platform is feature complete enough for production preparation.

## Notes

- Keep each task small and finish one before starting the next.
- After every backend change, test the affected API manually or with automated tests.
- After every frontend change, run lint/build and manually check the affected page.
- Do not rely on frontend route protection alone. Backend authorization remains the real security boundary.
- Supplier privacy is a core business rule, not just a UI decision.
- Customer-facing pages should present ShopZone as the seller/service provider.
- Seller-facing pages should never expose customer contact information unless ShopZone intentionally allows it for a specific fulfillment process.
