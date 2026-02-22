const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const activityLogger = require('../middleware/logger');
const {
  getAllSuppliers, createSupplier, getSupplierById,
  updateSupplier, deleteSupplier, getSupplierHistory,
} = require('../controllers/suppliers.controller');

router.use(authenticate);
router.use(activityLogger('suppliers'));

router.get('/', getAllSuppliers);
router.post('/', createSupplier);
router.get('/:id', getSupplierById);
router.put('/:id', updateSupplier);
router.delete('/:id', requireAdmin, deleteSupplier);
router.get('/:id/history', getSupplierHistory);

module.exports = router;
