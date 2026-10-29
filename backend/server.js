const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');

dotenv.config();

const app = express();

// ── Security hardening (ISS-093) ─────────────────────────────
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { sanitizeInput } = require('./middleware/sanitizeMiddleware');

// Standard security headers. crossOriginResourcePolicy is relaxed so the
// product images served from /uploads still load on the frontend origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors());

// Cap request bodies so nobody can post a huge JSON payload.
app.use(express.json({ limit: '1mb' }));

// Remove "$" operator keys from req.body / req.params (NoSQL injection).
app.use(sanitizeInput);

// Brute-force protection on login: 20 attempts per 15 minutes per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});
// Slower limit on account creation: 20 per hour per IP.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-ups from this connection. Please try again later.' },
});
app.use('/api/users/login', loginLimiter);
app.post('/api/users', registerLimiter); // only POST to exactly /api/users

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

const userRoutes    = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const uploadRoutes  = require('./routes/uploadRoutes');
// Enquiry routes — handles all form submissions site-wide
// (bulk orders, seller applications, contact, support)
const enquiryRoutes = require('./routes/enquiryRoutes');
// Payment routes — handles payment records, confirmations, and listing for admins
const paymentRoutes = require('./routes/paymentRoutes'); 
// Notification routes — all private, no public POST since notifications are system-generated 
const notificationRoutes = require('./routes/notificationRoutes');
const sellerRoutes       = require('./routes/sellerRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use('/api/users',     userRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/upload',    uploadRoutes);
// Enquiry endpoint — catch-all for all forms until dedicated
// models exist in Steps 6, 8, and 15
app.use('/api/enquiries', enquiryRoutes);
//payment routes - handles creation of payment records when orders are placed, as well as manual confirmation by admin. 
// This is separate from the STK push flow which is handled by the M-Pesa webhook and
app.use('/api/payments', paymentRoutes);

// Notification endpoints — all private, no public POST since notifications are system-generated
app.use('/api/notifications', notificationRoutes);
// Seller dashboard — all routes protected by protect + seller middleware
app.use('/api/seller', sellerRoutes);

// Convenience alias — /api/stats maps to the same handler as
// /api/products/stats so frontend components can call it cleanly
// without knowing it lives in the products controller
app.get('/api/stats', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Order   = require('./models/Order');
    const User    = require('./models/User');
    const Enquiry = require('./models/Enquiry');

    const [
      totalProducts,
      totalOrdersFulfilled,
      totalApprovedSellers,
      totalBulkEnquiries,
      categoriesResult,
    ] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({ status: 'delivered', isPaid: true }),
      User.countDocuments({ isSeller: true, sellerStatus: 'approved' }),
      Enquiry.countDocuments({ type: 'bulk_order' }),
      Product.distinct('category'),
    ]);

    res.json({
      totalProducts,
      totalOrdersFulfilled,
      totalApprovedSellers,
      countiesServed: 47,
      totalBulkEnquiries,
      totalCategories: categoriesResult.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('ShopZone API is running');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});