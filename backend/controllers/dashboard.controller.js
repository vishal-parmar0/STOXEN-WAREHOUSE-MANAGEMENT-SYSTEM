const db = require('../config/db');

/**
 * GET /api/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    const [totalProducts] = await db.execute('SELECT COUNT(*) AS count FROM products');
    const [stockValue] = await db.execute('SELECT COALESCE(SUM(current_quantity * purchase_price), 0) AS value FROM products');
    const [lowStock] = await db.execute('SELECT COUNT(*) AS count FROM products WHERE current_quantity <= minimum_threshold AND current_quantity > 0');
    const [outOfStock] = await db.execute('SELECT COUNT(*) AS count FROM products WHERE current_quantity = 0');
    const [pendingOrders] = await db.execute("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'");
    const [unreadAlerts] = await db.execute('SELECT COUNT(*) AS count FROM alerts WHERE is_read = FALSE');

    res.json({
      totalProducts: totalProducts[0].count,
      stockValue: parseFloat(stockValue[0].value),
      lowStockItems: lowStock[0].count,
      outOfStockItems: outOfStock[0].count,
      pendingOrders: pendingOrders[0].count,
      unreadAlerts: unreadAlerts[0].count,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/stock-movement
 */
const getStockMovement = async (req, res, next) => {
  try {
    const period = req.query.period || '7d';
    const days = period === '30d' ? 30 : 7;

    const [rows] = await db.execute(
      `SELECT
        DATE(transaction_date) AS date,
        SUM(CASE WHEN type = 'stock_in' THEN quantity ELSE 0 END) AS stock_in,
        SUM(CASE WHEN type = 'stock_out' THEN quantity ELSE 0 END) AS stock_out
       FROM transactions
       WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(transaction_date)
       ORDER BY date ASC`,
      [days]
    );

    const movement = rows.map(r => ({
      date: r.date,
      stock_in: parseFloat(r.stock_in),
      stock_out: parseFloat(r.stock_out),
    }));

    res.json({ movement });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/top-products
 */
const getTopProducts = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.id, p.name, p.sku, COUNT(t.id) AS transaction_count,
              SUM(t.quantity) AS total_quantity
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       GROUP BY p.id, p.name, p.sku
       ORDER BY transaction_count DESC
       LIMIT 5`
    );
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/recent-transactions
 */
const getRecentTransactions = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.*, p.name AS product_name, p.sku AS product_sku, u.name AS user_name
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       JOIN users u ON t.performed_by = u.id
       ORDER BY t.transaction_date DESC
       LIMIT 10`
    );

    const transactions = rows.map(t => ({
      id: t.id,
      product: t.product_name,
      product_sku: t.product_sku,
      type: t.type,
      qty: parseFloat(t.quantity),
      quantity: parseFloat(t.quantity),
      previous_qty: parseFloat(t.previous_quantity),
      new_qty: parseFloat(t.new_quantity),
      user: t.user_name,
      date: t.transaction_date,
      status: 'completed',
      notes: t.notes,
    }));

    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/alerts
 */
const getDashboardAlerts = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, p.name AS product_name, p.current_quantity, p.unit
       FROM alerts a
       LEFT JOIN products p ON a.product_id = p.id
       WHERE a.is_read = FALSE
       ORDER BY a.created_at DESC
       LIMIT 10`
    );

    const alerts = rows.map(a => ({
      id: a.id,
      type: a.type,
      message: a.message,
      product: a.product_name,
      quantity: a.current_quantity ? parseFloat(a.current_quantity) : null,
      unit: a.unit,
      created_at: a.created_at,
    }));

    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/stock-overview
 */
const getStockOverview = async (req, res, next) => {
  try {
    const [inStock] = await db.execute('SELECT COUNT(*) AS count FROM products WHERE current_quantity > minimum_threshold');
    const [lowStock] = await db.execute('SELECT COUNT(*) AS count FROM products WHERE current_quantity > 0 AND current_quantity <= minimum_threshold');
    const [outOfStock] = await db.execute('SELECT COUNT(*) AS count FROM products WHERE current_quantity = 0');
    const [total] = await db.execute('SELECT COUNT(*) AS count FROM products');

    res.json({
      in_stock: inStock[0].count,
      low_stock: lowStock[0].count,
      out_of_stock: outOfStock[0].count,
      total: total[0].count,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/category-stock
 */
const getCategoryStock = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.name, COUNT(p.id) AS product_count,
              COALESCE(SUM(p.current_quantity), 0) AS total_quantity
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY total_quantity DESC`
    );
    res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/top-suppliers
 */
const getTopSuppliers = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.id, s.name,
        COUNT(DISTINCT p.id) AS products_count,
        COALESCE(SUM(t.quantity * t.purchase_price), 0) AS total_value
       FROM suppliers s
       LEFT JOIN products p ON p.supplier_id = s.id
       LEFT JOIN transactions t ON t.supplier_id = s.id AND t.type = 'stock_in'
       GROUP BY s.id, s.name
       ORDER BY total_value DESC
       LIMIT 5`
    );
    res.json({ suppliers: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/expiring-soon
 */
const getExpiringSoon = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.id, p.name, p.sku, p.batch_number, p.expiry_date, p.current_quantity, p.unit,
              DATEDIFF(p.expiry_date, CURDATE()) AS days_left
       FROM products p
       WHERE p.expiry_date IS NOT NULL
         AND p.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
         AND p.expiry_date >= CURDATE()
       ORDER BY p.expiry_date ASC
       LIMIT 5`
    );
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats, getStockMovement, getTopProducts,
  getRecentTransactions, getDashboardAlerts, getStockOverview,
  getCategoryStock, getTopSuppliers, getExpiringSoon,
};
