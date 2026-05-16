const Product = require('../models/Product');

// @desc    Fetch all products with optional filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // ── Build filter object from query params ──────────────
    // Start with an empty filter — we add conditions based on
    // what query params were sent with the request.
    const filter = {};

    // Keyword search — matches against product name (case-insensitive)
    // Example: GET /api/products?keyword=samsung
    if (req.query.keyword) {
      filter.name = {
        $regex: req.query.keyword,
        $options: 'i',           // i = case insensitive
      };
    }

    // Category filter — exact match on category field
    // Example: GET /api/products?category=Electronics
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Featured filter — only products where isFeatured is true
    // Example: GET /api/products?featured=true
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // Deals filter — only products where isOnSale is true
    // Example: GET /api/products?deals=true
    if (req.query.deals === 'true') {
      filter.isOnSale = true;
    }

    // Clearance filter — only products where isClearance is true
    // Example: GET /api/products?clearance=true
    if (req.query.clearance === 'true') {
      filter.isClearance = true;
    }

    // Tag filter — matches any product that has this tag in its tags array
    // Example: GET /api/products?tag=bulk
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag.toLowerCase()] };
    }

    // ── Fetch products matching the filter ─────────────────
    const products = await Product.find(filter);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    // Create a placeholder product with all fields so the admin
    // can immediately see and edit every field in the edit form
    const product = new Product({
      name: 'Sample Product Name',
      price: 0,
      salePrice: null,           // no discount by default
      user: req.user._id,
      image: '/images/sample.jpg',
      category: 'General Merchandise',
      countInStock: 0,
      unit: 'Per Unit',
      numReviews: 0,
      description: 'Sample description',
      tags: [],             // no tags by default
      isFeatured: false,          // not featured by default
      isOnSale: false,          // not on sale by default
      isClearance: false,          // not clearance by default
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
      name, price, salePrice,
      description, image, category,
      countInStock, unit,
      tags, isFeatured, isOnSale, isClearance,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ── Update all fields ──────────────────────────────────
    product.name = name;
    product.price = price;
    // salePrice can be null (no discount) or a number
    product.salePrice = salePrice ?? null;
    product.description = description;
    product.image = image;
    product.category = category;
    product.countInStock = countInStock;
    product.unit = unit;
    // tags — store as lowercase for consistent matching
    product.tags = tags
      ? tags.map((t) => t.toLowerCase().trim())
      : [];
    product.isFeatured = isFeatured ?? false;
    product.isOnSale = isOnSale ?? false;
    product.isClearance = isClearance ?? false;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const createProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        user:    req.user._id,
        name:    req.user.name,
        rating:  Number(req.body.rating),
        comment: req.body.comment,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};