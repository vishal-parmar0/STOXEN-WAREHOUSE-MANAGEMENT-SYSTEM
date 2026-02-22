const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireManager, requireAdmin } = require('../middleware/role');
const activityLogger = require('../middleware/logger');
const {
  getAllOrders, createOrder, getOrderById,
  updateOrderStatus, updateOrder, deleteOrder,
} = require('../controllers/orders.controller');

router.use(authenticate);
router.use(activityLogger('orders'));

router.get('/', getAllOrders);
router.post('/', requireManager, createOrder);
router.get('/:id', getOrderById);
router.put('/:id', requireManager, updateOrder);
router.patch('/:id/status', requireManager, updateOrderStatus);
router.delete('/:id', requireAdmin, deleteOrder);

module.exports = router;
