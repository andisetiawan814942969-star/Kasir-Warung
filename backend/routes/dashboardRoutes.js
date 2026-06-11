const express = require('express');
const router = express.Router();
const { getStats, getChartData, getTopProducts } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/stats', protect, getStats);
router.get('/chart', protect, roleCheck('admin'), getChartData);
router.get('/top-products', protect, roleCheck('admin'), getTopProducts);

module.exports = router;
