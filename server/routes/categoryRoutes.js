const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getCategories);
router.post('/', protect, roleCheck('admin'), createCategory);
router.put('/:id', protect, roleCheck('admin'), updateCategory);
router.delete('/:id', protect, roleCheck('admin'), deleteCategory);

module.exports = router;
