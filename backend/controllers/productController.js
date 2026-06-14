// backend/controllers/productController.js
// ─────────────────────────────────────────────────────────────
// Handles all product-related logic:
//   getProducts, getProductById, createProduct,
//   updateProduct, deleteProduct, createProductReview,
//   getProductBrands, getPlatformStats
//
// Step 10 update:
//   getProducts now searches across name, category,
//   description and tags simultaneously using a single
//   MongoDB $or query instead of name-only search.
//
// Block A update:
//   Added brand filter support to getProducts.
//   Added getProductBrands endpoint for BrandsPage.
//   Added getPlatformStats endpoint for all stats strips.
// ─────────────────────────────────────────────────────────────
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const User         = require('../models/User');
const Enquiry      = require('../models/Enquiry');
const Notification = require('../models/Notification');
// Profanity filter — screens review comments and enquiry messages
// before they reach the database. Uses the leo-profanity package.
// Add custom Kenyan slang or platform-specific terms as needed.
const leoProfanity = require('leo-profanity');
// Load the full English dictionary on startup
leoProfanity.loadDictionary('en');

// @desc    Fetch all products with optional filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
  // ── Build the filter object from query params ──────────────
    // Public requests only see approved products.
    // Admin requests (valid token + isAdmin) see all statuses so
    // they can manage submitted, draft, and rejected products.
    const isAdmin = req.user?.isAdmin;
    const filter = isAdmin ? {} : { status: 'approved' };

    // ── Keyword search ────────────────────────────────────────
    // Searches across four fields simultaneously using $or.
    // Each field uses a case-insensitive regex so "samsung",
    // "Samsung" and "SAMSUNG" all return the same results.
    //
    // Fields searched:
    //   name        — product title
    //   category    — top-level category e.g. "Electronics"
    //   description — full product description
    //   tags        — array of keyword strings e.g. ["bulk","wholesale"]
    if (req.query.keyword) {
      const regex = {
        $regex:   req.query.keyword,
        $options: 'i',              // i = case insensitive
      };
      filter.$or = [
        { name:        regex },
        { category:    regex },
        { description: regex },
        { tags:        regex },     // MongoDB searches inside arrays automatically
      ];
    }

    // ── Category filter ───────────────────────────────────────
    // Exact match on the category field.
    // Example: GET /api/products?category=Electronics
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // ── Featured filter ───────────────────────────────────────
    // Returns only products where isFeatured is true.
    // Used by the homepage Featured Products section.
    // Example: GET /api/products?featured=true
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // ── Deals filter ──────────────────────────────────────────
    // Returns only products where isOnSale is true.
    // Used by the Deals page and the Deals nav link.
    // Example: GET /api/products?deals=true
    if (req.query.deals === 'true') {
      // Return products that are on sale OR clearance
      // This ensures both tabs on the Special Offers page are populated
      filter.$or = [
        { isOnSale: true },
        { isClearance: true },
      ];
    }

    // ── Clearance filter ──────────────────────────────────────
    // Returns only products where isClearance is true.
    // Used by the Clearance section on the special offers page.
    // Example: GET /api/products?clearance=true
    if (req.query.clearance === 'true') {
      filter.isClearance = true;
    }

   // ── Tag filter ────────────────────────────────────────────
    // Returns products that contain a specific tag in their
    // tags array. Stored and matched in lowercase.
    // Example: GET /api/products?tag=bulk
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag.toLowerCase()] };
    }

    // ── Brand filter ──────────────────────────────────────────
    // Returns products matching a specific brand name.
    // Case-insensitive regex so "unilever" and "Unilever" match.
    // Used by BrandsPage when a buyer clicks a brand card.
    // Example: GET /api/products?brand=Unilever
    if (req.query.brand) {
      filter.brand = {
        $regex:   req.query.brand,
        $options: 'i',
      };
    }

  // ── Sort ──────────────────────────────────────────────────
    // sort=newest returns products in reverse creation order.
    // Default sort is MongoDB natural order (insertion order).
    let sortOption = {};
    if (req.query.sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    // ── Limit ─────────────────────────────────────────────────
    // Limits results for homepage sections so only the needed
    // number of products are fetched instead of the full catalogue.
    // No limit param = return all matching products (browse mode).
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;

    // ── Fetch matching products from MongoDB ──────────────────
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(limit);

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product (admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    // Creates a placeholder product with all fields so the admin
    // can immediately see and edit every field in the edit form.
    const product = new Product({
      name: 'Draft Product',
      price: 0,
      salePrice: null,
      user: req.user._id,
      image: '',
      category: 'General Merchandise',
      countInStock: 0,
      unit: 'Per Unit',
      numReviews: 0,
      description: 'Draft — please complete all fields before saving.',
      tags: [],
      isFeatured: false,
      isOnSale: false,
      isClearance: false,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
const {
      name,
      price,
      salePrice,
      description,
      image,
      category,
      countInStock,
      unit,
      tags,
      isFeatured,
      isOnSale,
      isClearance,
      brand,
      unitType,
      minimumOrderQuantity,
      itemsPerUnit,
      weightPerUnit,
      dimensions,
      isBulkOnly,
      leadTimeDays,
      // ── Seller assignment and approval status ─────────────
      seller,
      status,
      adminFeedback,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ── Update all fields ──────────────────────────────────────
    product.name         = name;
    product.price        = price;
    // salePrice can be null (no discount) or a positive number
    product.salePrice    = salePrice ?? null;
    product.description  = description;
    product.image        = image;
    product.category     = category;
    product.countInStock = countInStock;
    product.unit         = unit;
    // Store tags in lowercase for consistent matching
   product.tags         = tags
      ? tags.map((t) => t.toLowerCase().trim())
      : [];
    product.isFeatured   = isFeatured  ?? false;
    product.isOnSale     = isOnSale    ?? false;
    product.isClearance  = isClearance ?? false;

    // ── NEW: Wholesale and brand fields ───────────────────────
    // All optional — undefined values leave the field unchanged
    if (brand             !== undefined) product.brand               = brand.trim();
    if (unitType          !== undefined) product.unitType            = unitType;
    if (minimumOrderQuantity !== undefined) product.minimumOrderQuantity = Number(minimumOrderQuantity) || 1;
    if (itemsPerUnit      !== undefined) product.itemsPerUnit        = itemsPerUnit !== null ? Number(itemsPerUnit) : null;
    if (weightPerUnit     !== undefined) product.weightPerUnit       = weightPerUnit !== null ? Number(weightPerUnit) : null;
    if (dimensions        !== undefined) product.dimensions          = dimensions.trim();
   if (isBulkOnly        !== undefined) product.isBulkOnly         = isBulkOnly ?? false;
    if (leadTimeDays      !== undefined) product.leadTimeDays        = leadTimeDays !== null ? Number(leadTimeDays) : null;

    // ── Seller assignment ─────────────────────────────────────
    // Admin can assign or reassign a product to any approved seller.
    // null means no seller — admin-managed product.
    if (seller !== undefined) product.seller = seller || null;

    // ── Approval status and feedback ──────────────────────────
    // Admin sets status to approved/rejected/needs_changes.
    // adminFeedback is shown to the seller on their dashboard
    // when status is needs_changes or rejected.
    // Capture old status before overwriting so we can detect a change
    const previousStatus = product.status;

    if (status        !== undefined) product.status        = status;
    if (adminFeedback !== undefined) product.adminFeedback = adminFeedback || '';

    const updatedProduct = await product.save();

    // ── Product status change notification to seller ──────────
    // Fires whenever admin changes the product status.
    // Sends to product.seller (the user who submitted it).
    // Skipped if there is no seller linked or status did not change.
    // All wrapped in try/catch — notification failure must never
    // crash the product save response.
    if (
      status !== undefined &&
      status !== previousStatus &&
      updatedProduct.seller
    ) {
      try {
        // Build a human-readable message per status value
        const statusMessages = {
          approved:     `Your product "${updatedProduct.name}" has been approved and is now live on the ShopZone storefront.`,
          needs_changes:`Your product "${updatedProduct.name}" requires changes before it can go live. ` +
                        (adminFeedback ? `Admin feedback: ${adminFeedback}` : 'Check your dashboard for details.'),
          rejected:     `Your product "${updatedProduct.name}" has been rejected. ` +
                        (adminFeedback ? `Reason: ${adminFeedback}` : 'Contact ShopZone for more information.'),
          submitted:    `Your product "${updatedProduct.name}" has been moved back to review. It is no longer visible on the storefront.`,
          archived:     `Your product "${updatedProduct.name}" has been archived and removed from the storefront.`,
          draft:        `Your product "${updatedProduct.name}" has been moved to draft status.`,
        };

        const message = statusMessages[status] || `The status of your product "${updatedProduct.name}" has been updated to ${status}.`;

        const notification = new Notification({
          userId:  updatedProduct.seller,  // the seller's user _id
          type:    'transactional',
          title:   status === 'approved'
            ? 'Product Approved — Now Live'
            : status === 'needs_changes'
            ? 'Product Needs Changes'
            : status === 'rejected'
            ? 'Product Rejected'
            : status === 'archived' || status === 'submitted'
            ? 'Product Removed from Storefront'
            : 'Product Status Updated',
          message,
          link:    '/seller/dashboard',
          isRead:  false,
        });

        await notification.save();
      } catch (notifErr) {
        // Log but never crash the product update
        console.error('Product status notification failed:', notifErr.message);
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // ── Basic validation ───────────────────────────────────────
    if (!rating || !comment || comment.trim().length < 10) {
      return res.status(400).json({
        message: 'Please provide a rating and a comment of at least 10 characters.',
      });
    }

    // ── Profanity check ────────────────────────────────────────
    // Blocks obscene language before it reaches the database.
    // Returns a clear message so the user knows what to fix.
    // Never shows which specific word was flagged — just asks them
    // to keep the language courteous.
    if (leoProfanity.check(comment)) {
      return res.status(400).json({
        message: 'Your review contains language that is not permitted on ShopZone. Please keep your feedback courteous and professional.',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

   // ── Verified purchase check ────────────────────────────────
    // Only buyers who have received this product can review it.
    // We check for a delivered order belonging to this user that
    // contains this product ID in its orderItems array.
    //
    // This blocks:
    //   — Sellers leaving bad reviews on competitor products
    //   — Anyone who browsed but never bought
    //   — Accounts created purely to review-bomb
    //
    // We require status 'delivered' not just isPaid, because a
    // buyer should have actually received the goods before reviewing.
    // The product ID is stored on orderItems as the 'product' field —
    // this matches the non-negotiable cart rule: item.product = MongoDB ID.
    const verifiedPurchase = await Order.findOne({
      user:              req.user._id,
      status:            'delivered',
      'orderItems.product': product._id,
    });

    if (!verifiedPurchase) {
      return res.status(400).json({
        message: 'You can only review products you have purchased and received. Once your order is delivered, you will be able to leave a review.',
      });
    }

    // ── Block sellers from reviewing their own products ────────
    // Checked after the purchase check so the purchase check fires
    // first — a seller who somehow bought their own product still
    // cannot review it.
    if (
      req.user.isSeller &&
      product.seller &&
      product.seller.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        message: 'You cannot review your own product.',
      });
    }

    // ── Block duplicate reviews ────────────────────────────────
    // Each buyer can only submit one review per product even if
    // they have ordered it multiple times.
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: 'You have already reviewed this product. Each buyer can leave one review per product.',
      });
    }

    // ── Add the new review ─────────────────────────────────────
    const review = {
      name:    req.user.name,
      rating:  Number(rating),
      comment: comment.trim(),
      user:    req.user._id,
    };

    product.reviews.push(review);

    // ── Recalculate average rating ─────────────────────────────
    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get distinct brand names with product count per brand
// @route   GET /api/products/brands
// @access  Public
//
// Returns an array of objects: [{ brand: 'Unilever', count: 12 }, ...]
// Used by BrandsPage to build the brand card grid.
// Only returns brands where the brand field is not empty.
const getProductBrands = async (req, res) => {
  try {
    const brands = await Product.aggregate([
      // Only include products that have a brand set
      { $match: { brand: { $exists: true, $ne: '' } } },
      // Group by brand name and count products per brand
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      // Sort alphabetically by brand name
      { $sort: { _id: 1 } },
      // Rename _id to brand for cleaner API response
      { $project: { _id: 0, brand: '$_id', count: 1 } },
    ]);

    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get real platform-wide stats for all stats strips
// @route   GET /api/stats
// @access  Public
//
// Returns live counts from the database so stats strips across
// the site always show accurate numbers instead of hardcoded values.
// countiesServed is static at 47 — Kenya has exactly 47 counties.
const getPlatformStats = async (req, res) => {
  try {
    // Run all queries in parallel for performance
    const [
      totalProducts,
      totalOrdersFulfilled,
      totalApprovedSellers,
      totalBulkEnquiries,
      categoriesResult,
    ] = await Promise.all([

      // Total number of products in the catalogue
      Product.countDocuments({}),

      // Orders that have been fully delivered and paid
      Order.countDocuments({ status: 'delivered', isPaid: true }),

      // Approved sellers — requires isSeller and sellerStatus fields
      // from Step 4. Until then this returns 0 which is honest.
      User.countDocuments({ isSeller: true, sellerStatus: 'approved' }),

      // Bulk order enquiries submitted through the BulkOrders form
      Enquiry.countDocuments({ type: 'bulk_order' }),

      // Distinct category count — how many unique categories exist
      Product.distinct('category'),
    ]);

    res.json({
      totalProducts,
      totalOrdersFulfilled,
      totalApprovedSellers,
      // countiesServed is always 47 — Kenya has exactly 47 counties
      countiesServed: 47,
      totalBulkEnquiries,
      totalCategories: categoriesResult.length,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Exports ───────────────────────────────────────────────────
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductBrands,
  getPlatformStats,
};