const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireManager } = require('../middleware/role');
const {
  inventoryReport, transactionReport, lowStockReport,
  supplierReport, orderReport,
} = require('../controllers/reports.controller');

router.use(authenticate);
router.use(requireManager);

router.get('/inventory', inventoryReport);
router.get('/transactions', transactionReport);
router.get('/low-stock', lowStockReport);
router.get('/suppliers', supplierReport);
router.get('/orders', orderReport);

module.exports = router;
