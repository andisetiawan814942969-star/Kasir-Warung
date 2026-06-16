const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { upload } = require('../config/cloudinary');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.post('/', protect, roleCheck('admin'), upload.single('image'), createProduct);
router.put('/:id', protect, roleCheck('admin'), upload.single('image'), updateProduct);
router.delete('/:id', protect, roleCheck('admin'), deleteProduct);

module.exports = router;
