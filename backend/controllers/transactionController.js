const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// @desc    Create transaction
// @route   POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { items, paymentAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items tidak boleh kosong' });
    }

    // Validate stock and calculate totals
    let totalAmount = 0;
    const transactionItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Produk ${item.product} tidak ditemukan` });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({ 
          message: `Stok ${product.name} tidak cukup. Tersedia: ${product.stock}` 
        });
      }

      const subtotal = product.price * item.qty;
      totalAmount += subtotal;

      transactionItems.push({
        product: product._id,
        productName: product.name,
        price: product.price,
        qty: item.qty,
        subtotal
      });
    }

    if (paymentAmount < totalAmount) {
      return res.status(400).json({ message: 'Pembayaran kurang' });
    }

    const change = paymentAmount - totalAmount;

    // Generate invoice number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Transaction.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    });
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Create transaction
    const transaction = await Transaction.create({
      invoiceNumber,
      items: transactionItems,
      totalAmount,
      paymentAmount,
      change,
      cashier: req.user._id
    });

    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty }
      });
    }

    const populated = await transaction.populate('cashier', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all transactions (admin) or own transactions (kasir)
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const query = {};

    // Kasir only sees own transactions
    if (req.user.role === 'kasir') {
      query.cashier = req.user._id;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    const transactions = await Transaction.find(query)
      .populate('cashier', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('cashier', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Kasir can only view own transactions
    if (req.user.role === 'kasir' && transaction.cashier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
