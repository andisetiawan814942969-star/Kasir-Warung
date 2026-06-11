const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('admin'), getUsers);
router.post('/', protect, roleCheck('admin'), createUser);
router.put('/:id', protect, roleCheck('admin'), updateUser);
router.delete('/:id', protect, roleCheck('admin'), deleteUser);

module.exports = router;
