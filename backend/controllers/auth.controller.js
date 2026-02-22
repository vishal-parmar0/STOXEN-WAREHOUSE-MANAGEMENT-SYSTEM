const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Validate role — default to 'staff' if not provided or invalid
    const allowedRoles = ['admin', 'manager', 'staff'];
    const userRole = allowedRoles.includes(role) ? role : 'staff';

    // Check if email already taken
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with chosen role
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role: userRole,
    };

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: true,
        message: 'Email, password, and role are required.',
      });
    }

    // Find user
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // Check role
    if (user.role !== role) {
      return res.status(401).json({
        error: true,
        message: 'Role does not match for this user.',
      });
    }

    // Check if active
    if (!user.is_active) {
      return res.status(403).json({
        error: true,
        message: 'Account is disabled. Contact administrator.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
