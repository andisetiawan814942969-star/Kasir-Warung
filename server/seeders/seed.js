require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@warung.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin created: admin@warung.com / admin123');

    // Create kasir user
    const kasir = await User.create({
      name: 'Kasir Demo',
      email: 'kasir@warung.com',
      password: 'kasir123',
      role: 'kasir'
    });
    console.log('✅ Kasir created: kasir@warung.com / kasir123');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Beras' },
      { name: 'Minyak Goreng' },
      { name: 'Gula' },
      { name: 'Tepung' },
      { name: 'Minuman' },
      { name: 'Bumbu Dapur' },
      { name: 'Snack' },
      { name: 'Sabun & Deterjen' },
      { name: 'Rokok' },
      { name: 'Lainnya' }
    ]);
    console.log('✅ Categories created');

    // Create sample products
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.name] = c._id);

    await Product.insertMany([
      { name: 'Beras Premium 5kg', category: categoryMap['Beras'], price: 65000, stock: 50, unit: 'karung' },
      { name: 'Beras Medium 5kg', category: categoryMap['Beras'], price: 55000, stock: 40, unit: 'karung' },
      { name: 'Beras IR64 1kg', category: categoryMap['Beras'], price: 12000, stock: 100, unit: 'kg' },
      { name: 'Minyak Goreng Bimoli 1L', category: categoryMap['Minyak Goreng'], price: 18000, stock: 60, unit: 'botol' },
      { name: 'Minyak Goreng Tropical 2L', category: categoryMap['Minyak Goreng'], price: 32000, stock: 30, unit: 'pouch' },
      { name: 'Minyak Goreng Curah 1L', category: categoryMap['Minyak Goreng'], price: 14000, stock: 80, unit: 'liter' },
      { name: 'Gula Pasir 1kg', category: categoryMap['Gula'], price: 14500, stock: 75, unit: 'kg' },
      { name: 'Gula Merah 500g', category: categoryMap['Gula'], price: 12000, stock: 40, unit: 'pcs' },
      { name: 'Tepung Terigu Segitiga Biru 1kg', category: categoryMap['Tepung'], price: 11000, stock: 45, unit: 'kg' },
      { name: 'Tepung Beras Rose Brand 500g', category: categoryMap['Tepung'], price: 8500, stock: 30, unit: 'pcs' },
      { name: 'Teh Botol Sosro 450ml', category: categoryMap['Minuman'], price: 4000, stock: 120, unit: 'botol' },
      { name: 'Aqua 600ml', category: categoryMap['Minuman'], price: 3500, stock: 200, unit: 'botol' },
      { name: 'Kopi Kapal Api Sachet', category: categoryMap['Minuman'], price: 1500, stock: 300, unit: 'sachet' },
      { name: 'Indomie Goreng', category: categoryMap['Lainnya'], price: 3500, stock: 150, unit: 'pcs' },
      { name: 'Indomie Kuah Soto', category: categoryMap['Lainnya'], price: 3200, stock: 120, unit: 'pcs' },
      { name: 'Bawang Merah', category: categoryMap['Bumbu Dapur'], price: 35000, stock: 20, unit: 'kg' },
      { name: 'Bawang Putih', category: categoryMap['Bumbu Dapur'], price: 30000, stock: 25, unit: 'kg' },
      { name: 'Kecap Manis ABC 275ml', category: categoryMap['Bumbu Dapur'], price: 12000, stock: 40, unit: 'botol' },
      { name: 'Chitato 68g', category: categoryMap['Snack'], price: 10000, stock: 60, unit: 'pcs' },
      { name: 'Taro 65g', category: categoryMap['Snack'], price: 8000, stock: 50, unit: 'pcs' },
      { name: 'Rinso Cair 800ml', category: categoryMap['Sabun & Deterjen'], price: 18000, stock: 35, unit: 'pouch' },
      { name: 'Sabun Lifebuoy', category: categoryMap['Sabun & Deterjen'], price: 4000, stock: 80, unit: 'pcs' },
      { name: 'Sunlight 755ml', category: categoryMap['Sabun & Deterjen'], price: 12500, stock: 40, unit: 'botol' },
      { name: 'Telur Ayam 1kg', category: categoryMap['Lainnya'], price: 28000, stock: 30, unit: 'kg' },
      { name: 'Susu Ultra 1L', category: categoryMap['Minuman'], price: 16000, stock: 25, unit: 'kotak' },
    ]);
    console.log('✅ Sample products created');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('================================');
    console.log('Admin Login: admin@warung.com / admin123');
    console.log('Kasir Login: kasir@warung.com / kasir123');
    console.log('================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
