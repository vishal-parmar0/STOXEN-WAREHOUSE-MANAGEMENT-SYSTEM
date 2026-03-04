const db = require('../config/db');

/**
 * GET /api/transactions
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { product_id, type, from, to, user_id, limit } = req.query;

    let query = `
      SELECT t.*, p.name AS product_name, p.sku AS product_sku,
             u.name AS user_name, s.name AS supplier_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users u ON t.performed_by = u.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      WHERE t.performed_by = ?
    `;
    const params = [req.user.id];

    if (product_id) {
      query += ' AND t.product_id = ?';
      params.push(product_id);
    // Removed stray closing brace
    if (type) {
    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }
      query += ' AND t.transaction_date >= ?';
    if (from) {
      query += ' AND t.transaction_date >= ?';
      params.push(from);
    }
      params.push(to + ' 23:59:59');
    if (to) {
      query += ' AND t.transaction_date <= ?';
      params.push(to + ' 23:59:59');
    }
    }
    // No need to filter by user_id from query, always use req.user.id
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const [rows] = await db.execute(query, params);

    // Map for frontend compatibility
    const transactions = rows.map(t => ({
      id: t.id,
      product_id: t.product_id,
      product: t.product_name,
      product_name: t.product_name,
      product_sku: t.product_sku,
      type: t.type,
      quantity: parseFloat(t.quantity),
      qty: parseFloat(t.quantity),
      previous_quantity: parseFloat(t.previous_quantity),
      previous_qty: parseFloat(t.previous_quantity),
      new_quantity: parseFloat(t.new_quantity),
      prev: parseFloat(t.previous_quantity),
      after: parseFloat(t.new_quantity),
      supplier: t.supplier_name,
      supplier_id: t.supplier_id,
      order_id: t.order_id,
      purchase_price: t.purchase_price ? parseFloat(t.purchase_price) : null,
      reason: t.reason,
      notes: t.notes,
      performed_by: t.performed_by,
      user: t.user_name,
      user_name: t.user_name,
      date: t.transaction_date,
      transaction_date: t.transaction_date,
      status: t.type === 'stock_in' ? 'completed' : t.type === 'stock_out' ? 'completed' : 'completed',
    }));

    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/transactions/stock-in
 * BUSINESS RULES: R1, R3, R5, R6
 */
const stockIn = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { product_id, quantity, supplier_id, purchase_price, notes } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      conn.release();
      return res.status(400).json({ error: true, message: 'Product ID and positive quantity are required.' });
    }

    await conn.beginTransaction();

    // 1. Get current product
    const [products] = await conn.execute('SELECT * FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (products.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    const product = products[0];
    const prevQty = parseFloat(product.current_quantity);
    const newQty = prevQty + parseFloat(quantity);

    // 2. Update product quantity
    await conn.execute('UPDATE products SET current_quantity = ? WHERE id = ?', [newQty, product_id]);

    // Update purchase price if provided
    if (purchase_price) {
      await conn.execute('UPDATE products SET purchase_price = ? WHERE id = ?', [purchase_price, product_id]);
    }

    // 3. Create transaction record
    const [txResult] = await conn.execute(
      `INSERT INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, supplier_id, purchase_price, performed_by, notes)
       VALUES (?, 'stock_in', ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, quantity, prevQty, newQty, supplier_id || null, purchase_price || null, req.user.id, notes || null]
    );

    // 4. Clear low_stock alert if now above threshold
    if (newQty > parseFloat(product.minimum_threshold)) {
      await conn.execute(
        "DELETE FROM alerts WHERE product_id = ? AND type = 'low_stock'",
        [product_id]
      );
    }

    // 5. Check expiry_date — create expiry alert if needed
    if (product.expiry_date) {
      const expiryDate = new Date(product.expiry_date);
      const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30 && daysLeft > 0) {
        const [existingAlert] = await conn.execute(
          "SELECT id FROM alerts WHERE product_id = ? AND type = 'expiry'",
          [product_id]
        );
        if (existingAlert.length === 0) {
          await conn.execute(
            "INSERT INTO alerts (type, product_id, message) VALUES ('expiry', ?, ?)",
            [product_id, `${product.name} expires in ${daysLeft} days. Batch: ${product.batch_number || 'N/A'}`]
          );
        }
      }
    }

    // 6. Log activity
    await conn.execute(
      'INSERT INTO activity_log (user_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.user.id, `Stock IN: +${quantity} ${product.unit}`, 'transactions',
       JSON.stringify({ product_id, product_name: product.name, quantity, prevQty, newQty })]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      transaction: {
        id: txResult.insertId,
        product_id,
        product: product.name,
        type: 'stock_in',
        quantity: parseFloat(quantity),
        previous_quantity: prevQty,
        new_quantity: newQty,
      },
      message: `Stock IN successful. New quantity: ${newQty} ${product.unit}.`,
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
};

/**
 * POST /api/transactions/stock-out
 * BUSINESS RULES: R1, R2, R3, R5
 */
const stockOut = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { product_id, quantity, order_id, reason, notes } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      conn.release();
      return res.status(400).json({ error: true, message: 'Product ID and positive quantity are required.' });
    }

    await conn.beginTransaction();

    // 1. Get current product
    const [products] = await conn.execute('SELECT * FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (products.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    const product = products[0];
    const prevQty = parseFloat(product.current_quantity);
    const outQty = parseFloat(quantity);

    // 2. VALIDATE: sufficient stock (R1, R2)
    if (outQty > prevQty) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        error: true,
        message: `Insufficient stock. Available: ${prevQty} ${product.unit}.`,
      });
    }

    const newQty = prevQty - outQty;

    // 3. Update product quantity
    await conn.execute('UPDATE products SET current_quantity = ? WHERE id = ?', [newQty, product_id]);

    // 4. Create transaction record
    const [txResult] = await conn.execute(
      `INSERT INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, order_id, reason, performed_by, notes)
       VALUES (?, 'stock_out', ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, quantity, prevQty, newQty, order_id || null, reason || null, req.user.id, notes || null]
    );

    // 5. Create low_stock alert if below threshold (R5)
    if (newQty <= parseFloat(product.minimum_threshold)) {
      const [existingAlert] = await conn.execute(
        "SELECT id FROM alerts WHERE product_id = ? AND type = 'low_stock'",
        [product_id]
      );
      if (existingAlert.length === 0) {
        await conn.execute(
          "INSERT INTO alerts (type, product_id, message) VALUES ('low_stock', ?, ?)",
          [product_id, `${product.name} is low — ${newQty} ${product.unit} remaining (threshold: ${product.minimum_threshold})`]
        );
      }
    }

    // 6. Log activity
    await conn.execute(
      'INSERT INTO activity_log (user_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.user.id, `Stock OUT: -${quantity} ${product.unit}`, 'transactions',
       JSON.stringify({ product_id, product_name: product.name, quantity, prevQty, newQty })]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      transaction: {
        id: txResult.insertId,
        product_id,
        product: product.name,
        type: 'stock_out',
        quantity: parseFloat(quantity),
        previous_quantity: prevQty,
        new_quantity: newQty,
      },
      message: `Stock OUT successful. New quantity: ${newQty} ${product.unit}.`,
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
};

/**
 * POST /api/transactions/adjustment
 */
const adjustment = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { product_id, corrected_quantity, reason, notes } = req.body;

    if (!product_id || corrected_quantity === undefined || corrected_quantity === null) {
      conn.release();
      return res.status(400).json({ error: true, message: 'Product ID and corrected quantity are required.' });
    }

    await conn.beginTransaction();

    const [products] = await conn.execute('SELECT * FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (products.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    const product = products[0];
    const prevQty = parseFloat(product.current_quantity);
    const newQty = parseFloat(corrected_quantity);
    const adjustQty = Math.abs(newQty - prevQty);

    // Update product quantity
    await conn.execute('UPDATE products SET current_quantity = ? WHERE id = ?', [newQty, product_id]);

    // Create transaction record
    const [txResult] = await conn.execute(
      `INSERT INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, reason, performed_by, notes)
       VALUES (?, 'adjustment', ?, ?, ?, ?, ?, ?)`,
      [product_id, adjustQty, prevQty, newQty, reason || 'Stock adjustment', req.user.id, notes || null]
    );

    // Handle alerts
    if (newQty <= parseFloat(product.minimum_threshold)) {
      const [existingAlert] = await conn.execute(
        "SELECT id FROM alerts WHERE product_id = ? AND type = 'low_stock'", [product_id]
      );
      if (existingAlert.length === 0) {
        await conn.execute(
          "INSERT INTO alerts (type, product_id, message) VALUES ('low_stock', ?, ?)",
          [product_id, `${product.name} is low — ${newQty} ${product.unit} remaining`]
        );
      }
    } else {
      await conn.execute("DELETE FROM alerts WHERE product_id = ? AND type = 'low_stock'", [product_id]);
    }

    // Log
    await conn.execute(
      'INSERT INTO activity_log (user_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.user.id, `Stock Adjustment: ${prevQty} → ${newQty}`, 'transactions',
       JSON.stringify({ product_id, product_name: product.name, prevQty, newQty, reason })]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      transaction: {
        id: txResult.insertId, product_id, product: product.name,
        type: 'adjustment', quantity: adjustQty,
        previous_quantity: prevQty, new_quantity: newQty,
      },
      message: `Stock adjusted. New quantity: ${newQty} ${product.unit}.`,
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
};

/**
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.*, p.name AS product_name, u.name AS user_name, s.name AS supplier_name
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       JOIN users u ON t.performed_by = u.id
       LEFT JOIN suppliers s ON t.supplier_id = s.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Transaction not found.' });
    }

    res.json({ transaction: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTransactions, stockIn, stockOut, adjustment, getTransactionById,
};
