const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
// Notification routes — all private, no public POST since notifications are system-generated 
const notificationRoutes = require('./routes/notificationRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use('/api/users',     userRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/upload',    uploadRoutes);
// Enquiry endpoint — catch-all for all forms until dedicated
// models exist in Steps 6, 8, and 15
app.use('/api/enquiries', enquiryRoutes);
// Notification endpoints — all private, no public POST since notifications are system-generated
app.use('/api/notifications', notificationRoutes);

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