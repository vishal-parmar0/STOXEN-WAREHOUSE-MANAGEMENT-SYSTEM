const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const activityLogger = require('../middleware/logger');
const {
  getAllUsers, createUser, getUserById,
  updateUser, deleteUser, toggleStatus,
} = require('../controllers/users.controller');

// All user routes require authentication
router.use(authenticate);
router.use(activityLogger('users'));

router.get('/', getAllUsers);
router.post('/', requireAdmin, createUser);
router.get('/:id', getUserById);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.put('/:id/toggle-status', requireAdmin, toggleStatus);

module.exports = router;
