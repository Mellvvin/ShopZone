const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// 1. Tell dotenv where your .env file is (since it's in the same folder)
dotenv.config({ path: path.join(__dirname, '.env') });

// 2. The connection logic (since you don't have db.js)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB(); // Connect first!

    // Clear everything out
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Import Users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Link products to the Admin user
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    // Import Products
    await Product.insertMany(sampleProducts);

    console.log('--- Data Imported Successfully! ---');
    process.exit();
  } catch (error) {
    console.error(`Import Failed: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('--- Data Destroyed! ---');
    process.exit();
  } catch (error) {
    console.error(`Destruction Failed: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}