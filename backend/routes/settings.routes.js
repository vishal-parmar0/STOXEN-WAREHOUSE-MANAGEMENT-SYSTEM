const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const activityLogger = require('../middleware/logger');
const {
  getSettings, updateSettings, getActivityLog,
  getCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/settings.controller');

router.use(authenticate);
router.use(requireAdmin);
router.use(activityLogger('settings'));

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/activity-log', getActivityLog);

// Categories under settings
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
