const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const activityLogger = require('../middleware/logger');
const {
  getCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/settings.controller');

router.use(authenticate);
router.use(activityLogger('categories'));

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
