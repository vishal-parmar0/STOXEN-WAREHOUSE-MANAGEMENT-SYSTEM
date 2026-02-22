const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireAdmin, requireManager } = require('../middleware/role');
const activityLogger = require('../middleware/logger');
const {
  getAllProducts, createProduct, getProductById,
  updateProduct, deleteProduct, getLowStock, getExpiring,
} = require('../controllers/products.controller');

router.use(authenticate);
router.use(activityLogger('products'));

// Special routes BEFORE :id routes
router.get('/low-stock', getLowStock);
router.get('/expiring', getExpiring);

router.get('/', getAllProducts);
router.post('/', requireManager, createProduct);
router.get('/:id', getProductById);
router.put('/:id', requireManager, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
