const db = require('../config/db');

/**
 * GET /api/alerts
 */
const getAlerts = async (req, res, next) => {
  try {
    const { type } = req.query;

    let query = `
      SELECT a.*, p.name AS product_name, p.sku AS product_sku,
             p.current_quantity, p.unit,
             o.order_number
      FROM alerts a
      LEFT JOIN products p ON a.product_id = p.id
      LEFT JOIN orders o ON a.order_id = o.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (type) {
      query += ' AND a.type = ?';
      params.push(type);
    }

    query += ' ORDER BY a.is_read ASC, a.created_at DESC';

    const [rows] = await db.execute(query, params);

    const alerts = rows.map(a => ({
      id: a.id,
      type: a.type,
      message: a.message,
      product: a.product_name,
      product_id: a.product_id,
      product_sku: a.product_sku,
      quantity: a.current_quantity ? parseFloat(a.current_quantity) : null,
      unit: a.unit,
      order_number: a.order_number,
      read: a.is_read ? true : false,
      is_read: a.is_read ? true : false,
      created_at: a.created_at,
    }));

    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/alerts/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id FROM alerts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Alert not found or access denied.' });
    }

    await db.execute('UPDATE alerts SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Alert marked as read.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/alerts/mark-all-read
 */
const markAllRead = async (req, res, next) => {
  try {
    await db.execute('UPDATE alerts SET is_read = TRUE WHERE is_read = FALSE AND user_id = ?', [req.user.id]);
    res.json({ message: 'All alerts marked as read.' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/alerts/:id (Admin only)
 */
const deleteAlert = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id FROM alerts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Alert not found or access denied.' });
    }

    await db.execute('DELETE FROM alerts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Alert deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/alerts/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM alerts WHERE is_read = FALSE AND user_id = ?', [req.user.id]);
    res.json({ count: rows[0].count });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, markAsRead, markAllRead, deleteAlert, getUnreadCount };
