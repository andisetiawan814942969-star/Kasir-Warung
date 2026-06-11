const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, getTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTransaction);
router.get('/', protect, getTransactions);
router.get('/:id', protect, getTransaction);

module.exports = router;
