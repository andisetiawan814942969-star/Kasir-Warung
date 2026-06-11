const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's transactions
    const todayTransactions = await Transaction.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const todayCount = todayTransactions.length;

    // Total products
    const totalProducts = await Product.countDocuments();

    // Low stock products (stock <= 5)
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    // Total users
    const totalUsers = await User.countDocuments();

    // Total all-time sales
    const allTransactions = await Transaction.find();
    const totalSales = allTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalTransactions = allTransactions.length;

    res.json({
      todaySales,
      todayCount,
      totalProducts,
      lowStockProducts,
      totalUsers,
      totalSales,
      totalTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get sales data for chart (last 7 days)
// @route   GET /api/dashboard/chart
exports.getChartData = async (req, res) => {
  try {
    const days = 7;
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const transactions = await Transaction.find({
        createdAt: { $gte: date, $lt: nextDate }
      });

      const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalCount = transactions.length;

      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      
      chartData.push({
        date: date.toISOString().slice(0, 10),
        day: dayNames[date.getDay()],
        sales: totalSales,
        count: totalCount
      });
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
exports.getTopProducts = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          totalQty: { $sum: '$items.qty' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
