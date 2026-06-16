const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk harus diisi'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori harus dipilih']
  },
  price: {
    type: Number,
    required: [true, 'Harga harus diisi'],
    min: [0, 'Harga tidak boleh negatif']
  },
  stock: {
    type: Number,
    required: [true, 'Stok harus diisi'],
    min: [0, 'Stok tidak boleh negatif'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Satuan harus diisi'],
    trim: true,
    default: 'pcs'
  },
  barcode: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
