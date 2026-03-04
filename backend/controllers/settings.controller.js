const db = require('../config/db');

/**
 * GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);

    if (rows.length === 0) {
      return res.json({
        warehouse_name: 'My Warehouse',
        warehouse_address: '',
        warehouse_phone: '',
        warehouse_email: '',
        low_stock_alert_days: 0,
        expiry_alert_days: 30,
      });
    }

    const s = rows[0];
    res.json({
      id: s.id,
      warehouse_name: s.warehouse_name,
      address: s.warehouse_address,
      warehouse_address: s.warehouse_address,
      phone: s.warehouse_phone,
      warehouse_phone: s.warehouse_phone,
      email: s.warehouse_email,
      warehouse_email: s.warehouse_email,
      low_stock_threshold: s.low_stock_alert_days,
      low_stock_alert_days: s.low_stock_alert_days,
      expiry_alert_days: s.expiry_alert_days,
      updated_at: s.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const {
      warehouse_name, address, warehouse_address,
      phone, warehouse_phone,
      email, warehouse_email,
      low_stock_threshold, low_stock_alert_days,
      expiry_alert_days,
    } = req.body;

    const finalAddress = warehouse_address || address;
    const finalPhone = warehouse_phone || phone;
    const finalEmail = warehouse_email || email;
    const finalLowStock = low_stock_alert_days ?? low_stock_threshold ?? 0;
    const finalExpiryDays = expiry_alert_days ?? 30;

    // Check if settings row exists for this user
    const [existing] = await db.execute('SELECT id FROM settings WHERE user_id = ?', [req.user.id]);

    if (existing.length === 0) {
      await db.execute(
        'INSERT INTO settings (warehouse_name, warehouse_address, warehouse_phone, warehouse_email, low_stock_alert_days, expiry_alert_days, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [warehouse_name || 'My Warehouse', finalAddress, finalPhone, finalEmail, finalLowStock, finalExpiryDays, req.user.id]
      );
    } else {
      await db.execute(
        `UPDATE settings SET
          warehouse_name = COALESCE(?, warehouse_name),
          warehouse_address = COALESCE(?, warehouse_address),
          warehouse_phone = COALESCE(?, warehouse_phone),
          warehouse_email = COALESCE(?, warehouse_email),
          low_stock_alert_days = COALESCE(?, low_stock_alert_days),
          expiry_alert_days = COALESCE(?, expiry_alert_days)
         WHERE user_id = ?`,
        [warehouse_name, finalAddress, finalPhone, finalEmail, finalLowStock, finalExpiryDays, req.user.id]
      );
    }

    // Return updated settings
    const [updated] = await db.execute('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
    const s = updated[0];
    res.json({
      message: 'Settings updated successfully.',
      warehouse_name: s.warehouse_name,
      address: s.warehouse_address,
      phone: s.warehouse_phone,
      email: s.warehouse_email,
      low_stock_threshold: s.low_stock_alert_days,
      expiry_alert_days: s.expiry_alert_days,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/settings/activity-log
 */
const getActivityLog = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const logLimit = parseInt(limit) || 50;

    const [rows] = await db.execute(
      `SELECT al.*, u.name AS user_name, u.email AS user_email
       FROM activity_log al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [logLimit]
    );

    res.json({ logs: rows });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// CATEGORIES CRUD (also accessible via /api/categories)
// ============================================================

/**
 * GET /api/settings/categories  (or /api/categories)
 */
const getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.created_by = ?) AS products_count
       FROM categories c
       WHERE c.created_by = ?
       ORDER BY c.name ASC`,
      [req.user.id, req.user.id]
    );
    res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/settings/categories (or /api/categories)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: true, message: 'Category name is required.' });
    }

    const [result] = await db.execute(
      'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || null, req.user.id]
    );

    res.status(201).json({
      category: { id: result.insertId, name, description, created_by: req.user.id },
      message: 'Category created successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/settings/categories/:id (or /api/categories/:id)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;

    const [existing] = await db.execute('SELECT id FROM categories WHERE id = ? AND created_by = ?', [categoryId, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Category not found or access denied.' });
    }

    await db.execute(
      'UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ? AND created_by = ?',
      [name, description, categoryId, req.user.id]
    );

    const [updated] = await db.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
    res.json({ category: updated[0], message: 'Category updated.' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/settings/categories/:id (or /api/categories/:id)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id, name FROM categories WHERE id = ? AND created_by = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Category not found or access denied.' });
    }

    await db.execute('DELETE FROM categories WHERE id = ? AND created_by = ?', [req.params.id, req.user.id]);
    res.json({ message: `Category "${existing[0].name}" deleted.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings, updateSettings, getActivityLog,
  getCategories, createCategory, updateCategory, deleteCategory,
};
