const db = require('../config/db');

/**
 * GET /api/reports/inventory
 */
const inventoryReport = async (req, res, next) => {
  try {
    const { category, status } = req.query;

    let query = `
      SELECT p.*, c.name AS category_name, s.name AS supplier_name,
        CASE
          WHEN p.current_quantity = 0 THEN 'out_of_stock'
          WHEN p.current_quantity <= p.minimum_threshold THEN 'low_stock'
          ELSE 'in_stock'
        END AS stock_status,
        (p.current_quantity * p.purchase_price) AS stock_value
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }
    if (status === 'low_stock') {
      query += ' AND p.current_quantity > 0 AND p.current_quantity <= p.minimum_threshold';
    } else if (status === 'out_of_stock') {
      query += ' AND p.current_quantity = 0';
    } else if (status === 'in_stock') {
      query += ' AND p.current_quantity > p.minimum_threshold';
    }

    query += ' ORDER BY p.name ASC';

    const [rows] = await db.execute(query, params);

    // Summary stats
    const totalProducts = rows.length;
    const totalValue = rows.reduce((s, p) => s + parseFloat(p.stock_value || 0), 0);
    const lowStockCount = rows.filter(p => p.stock_status === 'low_stock').length;
    const outOfStockCount = rows.filter(p => p.stock_status === 'out_of_stock').length;

    res.json({
      report: rows,
      summary: { totalProducts, totalValue, lowStockCount, outOfStockCount },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/transactions
 */
const transactionReport = async (req, res, next) => {
  try {
    const { from, to, type } = req.query;

    let query = `
      SELECT t.*, p.name AS product_name, p.sku, u.name AS user_name, s.name AS supplier_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users u ON t.performed_by = u.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (from) {
      query += ' AND t.transaction_date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND t.transaction_date <= ?';
      params.push(to + ' 23:59:59');
    }
    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    query += ' ORDER BY t.transaction_date DESC';

    const [rows] = await db.execute(query, params);

    const totalStockIn = rows.filter(t => t.type === 'stock_in').reduce((s, t) => s + parseFloat(t.quantity), 0);
    const totalStockOut = rows.filter(t => t.type === 'stock_out').reduce((s, t) => s + parseFloat(t.quantity), 0);

    res.json({
      report: rows,
      summary: { totalTransactions: rows.length, totalStockIn, totalStockOut },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/low-stock
 */
const lowStockReport = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name,
              (p.minimum_threshold - p.current_quantity) AS deficit
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.current_quantity <= p.minimum_threshold
       ORDER BY deficit DESC`
    );

    res.json({
      report: rows,
      summary: { totalItems: rows.length, outOfStock: rows.filter(p => parseFloat(p.current_quantity) === 0).length },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/suppliers
 */
const supplierReport = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*,
        COUNT(DISTINCT p.id) AS products_count,
        COALESCE(SUM(CASE WHEN t.type = 'stock_in' THEN t.quantity * COALESCE(t.purchase_price, 0) ELSE 0 END), 0) AS total_purchase_value,
        COALESCE(SUM(CASE WHEN t.type = 'stock_in' THEN t.quantity ELSE 0 END), 0) AS total_units_supplied
       FROM suppliers s
       LEFT JOIN products p ON p.supplier_id = s.id
       LEFT JOIN transactions t ON t.supplier_id = s.id
       GROUP BY s.id
       ORDER BY total_purchase_value DESC`
    );

    res.json({
      report: rows,
      summary: { totalSuppliers: rows.length, totalPurchaseValue: rows.reduce((s, r) => s + parseFloat(r.total_purchase_value), 0) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/orders
 */
const orderReport = async (req, res, next) => {
  try {
    const { from, to, type, status } = req.query;

    let query = `
      SELECT o.*, s.name AS supplier_name, u.name AS created_by_name,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items_count
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (from) { query += ' AND o.created_at >= ?'; params.push(from); }
    if (to) { query += ' AND o.created_at <= ?'; params.push(to + ' 23:59:59'); }
    if (type) { query += ' AND o.type = ?'; params.push(type); }
    if (status) { query += ' AND o.status = ?'; params.push(status); }

    query += ' ORDER BY o.created_at DESC';

    const [rows] = await db.execute(query, params);

    const totalValue = rows.reduce((s, o) => s + parseFloat(o.total_value || 0), 0);

    res.json({
      report: rows,
      summary: {
        totalOrders: rows.length,
        totalValue,
        completed: rows.filter(o => o.status === 'completed').length,
        pending: rows.filter(o => o.status === 'pending').length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  inventoryReport, transactionReport, lowStockReport,
  supplierReport, orderReport,
};
