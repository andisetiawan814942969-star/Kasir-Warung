const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { upload } = require('../config/cloudinary');

router.get('/', protect, roleCheck('admin'), getUsers);
router.post('/', protect, roleCheck('admin'), upload.single('image'), createUser);
router.put('/:id', protect, roleCheck('admin'), upload.single('image'), updateUser);
router.delete('/:id', protect, roleCheck('admin'), deleteUser);

module.exports = router;
