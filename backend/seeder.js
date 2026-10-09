const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const SELLER_SEEDS = [
  { email: 'seller1@shopzone.test', name: 'Nairobi TechHub Distributors', businessName: 'Nairobi TechHub Distributors', businessAddress: 'Luthuli Avenue, Nairobi', kraPin: 'P051234567A', mpesaNumber: '254712000001' },
  { email: 'seller2@shopzone.test', name: 'Eastleigh Textile Traders', businessName: 'Eastleigh Textile Traders', businessAddress: 'Eastleigh 1st Avenue, Nairobi', kraPin: 'P051234567B', mpesaNumber: '254712000002' },
  { email: 'seller3@shopzone.test', name: 'Mombasa Wholesale Foods Ltd', businessName: 'Mombasa Wholesale Foods Ltd', businessAddress: 'Changamwe, Mombasa', kraPin: 'P051234567C', mpesaNumber: '254712000003' },
  { email: 'seller4@shopzone.test', name: 'Karibu Home Essentials', businessName: 'Karibu Home Essentials', businessAddress: 'Kamukunji, Nairobi', kraPin: 'P051234567D', mpesaNumber: '254712000004' },
  { email: 'seller5@shopzone.test', name: 'Pure Glow Distributors', businessName: 'Pure Glow Distributors', businessAddress: 'Tom Mboya Street, Nairobi', kraPin: 'P051234567E', mpesaNumber: '254712000005' },
  { email: 'seller6@shopzone.test', name: 'Jua Kali Hardware Supplies', businessName: 'Jua Kali Hardware Supplies', businessAddress: 'Kamukunji Jua Kali, Nairobi', kraPin: 'P051234567F', mpesaNumber: '254712000006' },
  { email: 'seller7@shopzone.test', name: 'Little Stars Wholesale', businessName: 'Little Stars Wholesale', businessAddress: 'River Road, Nairobi', kraPin: 'P051234567G', mpesaNumber: '254712000007' },
  { email: 'seller8@shopzone.test', name: 'Highland Sports Distributors', businessName: 'Highland Sports Distributors', businessAddress: 'Kimathi Street, Nairobi', kraPin: 'P051234567H', mpesaNumber: '254712000008' },
];

const importData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    // Users are never touched here.

    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      throw new Error(
        'No user found with email admin@example.com — refusing to guess an admin account. Create it first, then rerun.'
      );
    }

    const sellerIdByEmail = {};
    for (const seed of SELLER_SEEDS) {
      let seller = await User.findOne({ email: seed.email });
      if (!seller) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        seller = await User.create({
          name: seed.name,
          email: seed.email,
          password: hashedPassword,
          isSeller: true,
          sellerStatus: 'approved',
          sellerApprovedAt: new Date(),
          sellerProfile: {
            businessName: seed.businessName,
            businessAddress: seed.businessAddress,
            description: `Wholesale supplier — ${seed.businessName}`,
            kraPin: seed.kraPin,
            mpesaNumber: seed.mpesaNumber,
          },
        });
        console.log(`Created seller: ${seed.email}`);
      }
      sellerIdByEmail[seed.email] = seller._id;
    }

    const resolvedProducts = products.map((product) => ({
      ...product,
      user: admin._id,
      seller: product.seller ? sellerIdByEmail[product.seller] : null,
    }));

    await Product.insertMany(resolvedProducts);

    console.log(`--- Imported ${resolvedProducts.length} products across ${SELLER_SEEDS.length} sellers + admin ---`);
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
    console.log('--- Product & Order data destroyed (Users untouched) ---');
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