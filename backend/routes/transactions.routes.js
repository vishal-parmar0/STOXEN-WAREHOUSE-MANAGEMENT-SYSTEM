const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const activityLogger = require('../middleware/logger');
const {
  getAllTransactions, stockIn, stockOut, adjustment, getTransactionById,
} = require('../controllers/transactions.controller');

router.use(authenticate);
router.use(activityLogger('transactions'));

// NO PUT or DELETE — transactions are IMMUTABLE (Rule R8)
router.get('/', getAllTransactions);
router.post('/stock-in', stockIn);
router.post('/stock-out', stockOut);
router.post('/adjustment', adjustment);
router.get('/:id', getTransactionById);

module.exports = router;
