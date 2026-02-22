const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: 'Name, email, and password are required.' });
    }

    // Check email uniqueness
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: true, message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'staff';

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({
      user: { id: result.insertId, name, email, role: userRole, is_active: true },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, is_active } = req.body;
    const userId = req.params.id;

    // Check user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    // Check email uniqueness if changed
    if (email) {
      const [emailCheck] = await db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: true, message: 'Email already in use.' });
      }
    }

    await db.execute(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), is_active = COALESCE(?, is_active) WHERE id = ?',
      [name, email, role, is_active !== undefined ? is_active : null, userId]
    );

    const [updated] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ user: updated[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Cannot delete own account
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: true, message: 'You cannot delete your own account.' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id/toggle-status
 */
const toggleStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Cannot toggle own status
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: true, message: 'You cannot change your own status.' });
    }

    const [rows] = await db.execute('SELECT id, is_active FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    const newStatus = !rows[0].is_active;
    await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, userId]);

    res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'}.`, is_active: newStatus });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, createUser, getUserById, updateUser, deleteUser, toggleStatus };
