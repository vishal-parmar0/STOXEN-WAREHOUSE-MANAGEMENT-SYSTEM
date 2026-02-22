const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const activityLogger = require('../middleware/logger');
const {
  getAlerts, markAsRead, markAllRead, deleteAlert, getUnreadCount,
} = require('../controllers/alerts.controller');

router.use(authenticate);
router.use(activityLogger('alerts'));

// Static routes BEFORE parameterized routes
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllRead);

router.get('/', getAlerts);
router.put('/:id/read', markAsRead);
router.delete('/:id', requireAdmin, deleteAlert);

module.exports = router;
