const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getStats, getStockMovement, getTopProducts,
  getRecentTransactions, getDashboardAlerts, getStockOverview,
  getCategoryStock, getTopSuppliers, getExpiringSoon,
} = require('../controllers/dashboard.controller');

router.use(authenticate);

router.get('/stats', getStats);
router.get('/stock-movement', getStockMovement);
router.get('/top-products', getTopProducts);
router.get('/recent-transactions', getRecentTransactions);
router.get('/alerts', getDashboardAlerts);
router.get('/stock-overview', getStockOverview);
router.get('/category-stock', getCategoryStock);
router.get('/top-suppliers', getTopSuppliers);
router.get('/expiring-soon', getExpiringSoon);

module.exports = router;
