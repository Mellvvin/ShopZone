// backend/controllers/productController.js
// ─────────────────────────────────────────────────────────────
// Handles all product-related logic:
//   getProducts, getProductById, createProduct,
//   updateProduct, deleteProduct, createProductReview
//
// Step 10 update:
//   getProducts now searches across name, category,
//   description and tags simultaneously using a single
//   MongoDB $or query instead of name-only search.
// ─────────────────────────────────────────────────────────────
const Product = require('../models/Product');

// @desc    Fetch all products with optional filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // ── Build the filter object from query params ──────────────
    // We start with an empty filter and add conditions based on
    // what was passed in the URL query string.
    // Example: GET /api/products?keyword=samsung&category=Electronics
    const filter = {};

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

    // ── Fetch matching products from MongoDB ──────────────────
    const products = await Product.find(filter);
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

    const updatedProduct = await product.save();
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ── Check if user already reviewed this product ────────────
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // ── Add the new review ─────────────────────────────────────
    const review = {
      name:    req.user.name,
      rating:  Number(rating),
      comment,
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

// ── Exports ───────────────────────────────────────────────────
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};