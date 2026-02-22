const db = require('../config/db');

/**
 * GET /api/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;

    let query = `
      SELECT o.*, s.name AS supplier_name, u.name AS created_by_name,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items_count
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND o.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (o.order_number LIKE ? OR s.name LIKE ? OR o.customer_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY o.created_at DESC';

    const [rows] = await db.execute(query, params);

    const orders = rows.map(o => ({
      id: o.id,
      order_number: o.order_number,
      type: o.type,
      supplier: o.supplier_name,
      supplier_id: o.supplier_id,
      customer: o.customer_name,
      customer_name: o.customer_name,
      status: o.status,
      expected_date: o.expected_date,
      date: o.created_at,
      total_value: parseFloat(o.total_value),
      notes: o.notes,
      items_count: o.items_count,
      created_by: o.created_by_name,
      created_at: o.created_at,
      updated_at: o.updated_at,
    }));

    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { type, supplier_id, customer_name, expected_date, notes, items } = req.body;

    if (!type || !items || items.length === 0) {
      conn.release();
      return res.status(400).json({ error: true, message: 'Order type and items are required.' });
    }

    await conn.beginTransaction();

    // Auto-generate order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = type === 'purchase' ? 'PO' : 'DO';
    const [countRows] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM orders WHERE type = ? AND DATE(created_at) = CURDATE()",
      [type]
    );
    const counter = String(countRows[0].cnt + 1).padStart(3, '0');
    const orderNumber = `${prefix}-${dateStr}-${counter}`;

    // Calculate total value
    let totalValue = 0;
    for (const item of items) {
      const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      totalValue += itemTotal;
    }

    // Create order
    const [result] = await conn.execute(
      `INSERT INTO orders (order_number, type, supplier_id, customer_name, expected_date, total_value, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, type, supplier_id || null, customer_name || null, expected_date || null, totalValue, notes || null, req.user.id]
    );

    const orderId = result.insertId;

    // Insert order items
    for (const item of items) {
      const unitPrice = parseFloat(item.unit_price) || 0;
      const qty = parseFloat(item.quantity);
      const itemTotal = qty * unitPrice;

      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, qty, unitPrice, itemTotal]
      );
    }

    // Log activity
    await conn.execute(
      'INSERT INTO activity_log (user_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.user.id, `Created ${type} order ${orderNumber}`, 'orders',
       JSON.stringify({ order_id: orderId, order_number: orderNumber, type, items_count: items.length, total_value: totalValue })]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      order: { id: orderId, order_number: orderNumber, type, status: 'pending', total_value: totalValue },
      message: `Order ${orderNumber} created successfully.`,
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
};

/**
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT o.*, s.name AS supplier_name, u.name AS created_by_name
       FROM orders o
       LEFT JOIN suppliers s ON o.supplier_id = s.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Order not found.' });
    }

    // Get order items
    const [items] = await db.execute(
      `SELECT oi.*, p.name AS product_name, p.sku AS product_sku
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ order: rows[0], items });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:id/status
 * CRITICAL: When completed, auto-create stock transactions (R7)
 */
const updateOrderStatus = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'processing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      conn.release();
      return res.status(400).json({ error: true, message: 'Invalid status.' });
    }

    await conn.beginTransaction();

    // Get order
    const [orders] = await conn.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (orders.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: true, message: 'Order not found.' });
    }

    const order = orders[0];

    // CRITICAL: If completing the order, process stock transactions
    if (status === 'completed' && order.status !== 'completed') {
      const [items] = await conn.execute(
        'SELECT oi.*, p.name AS product_name, p.current_quantity, p.minimum_threshold, p.unit FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [orderId]
      );

      for (const item of items) {
        const prevQty = parseFloat(item.current_quantity);
        const itemQty = parseFloat(item.quantity);

        if (order.type === 'purchase') {
          // Purchase completed → stock_in
          const newQty = prevQty + itemQty;
          await conn.execute('UPDATE products SET current_quantity = ? WHERE id = ?', [newQty, item.product_id]);
          await conn.execute(
            `INSERT INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, supplier_id, order_id, purchase_price, performed_by, notes)
             VALUES (?, 'stock_in', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [item.product_id, itemQty, prevQty, newQty, order.supplier_id, orderId, item.unit_price, req.user.id, `Auto: Purchase order ${order.order_number} completed`]
          );

          // Clear low_stock alert if above threshold
          if (newQty > parseFloat(item.minimum_threshold)) {
            await conn.execute("DELETE FROM alerts WHERE product_id = ? AND type = 'low_stock'", [item.product_id]);
          }
        } else if (order.type === 'dispatch') {
          // Dispatch completed → stock_out
          if (itemQty > prevQty) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({
              error: true,
              message: `Insufficient stock for ${item.product_name}. Available: ${prevQty} ${item.unit}.`,
            });
          }

          const newQty = prevQty - itemQty;
          await conn.execute('UPDATE products SET current_quantity = ? WHERE id = ?', [newQty, item.product_id]);
          await conn.execute(
            `INSERT INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, order_id, performed_by, notes)
             VALUES (?, 'stock_out', ?, ?, ?, ?, ?, ?)`,
            [item.product_id, itemQty, prevQty, newQty, orderId, req.user.id, `Auto: Dispatch order ${order.order_number} completed`]
          );

          // Create low_stock alert if below threshold
          if (newQty <= parseFloat(item.minimum_threshold)) {
            const [existingAlert] = await conn.execute(
              "SELECT id FROM alerts WHERE product_id = ? AND type = 'low_stock'", [item.product_id]
            );
            if (existingAlert.length === 0) {
              await conn.execute(
                "INSERT INTO alerts (type, product_id, message) VALUES ('low_stock', ?, ?)",
                [item.product_id, `${item.product_name} is low — ${newQty} ${item.unit} remaining`]
              );
            }
          }
        }
      }

      // Create order_status alert
      await conn.execute(
        "INSERT INTO alerts (type, order_id, message) VALUES ('order_status', ?, ?)",
        [orderId, `Order ${order.order_number} has been completed.`]
      );
    }

    // Update order status
    await conn.execute(
      'UPDATE orders SET status = ?, updated_by = ? WHERE id = ?',
      [status, req.user.id, orderId]
    );

    // Log
    await conn.execute(
      'INSERT INTO activity_log (user_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.user.id, `Order ${order.order_number} status: ${order.status} → ${status}`, 'orders',
       JSON.stringify({ order_id: orderId, order_number: order.order_number, old_status: order.status, new_status: status })]
    );

    await conn.commit();
    conn.release();

    res.json({ message: `Order status updated to ${status}.`, status });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
};

/**
 * PUT /api/orders/:id
 */
const updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { supplier_id, customer_name, expected_date, notes } = req.body;

    const [existing] = await db.execute('SELECT id, status FROM orders WHERE id = ?', [orderId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Order not found.' });
    }

    if (['completed', 'cancelled'].includes(existing[0].status)) {
      return res.status(400).json({ error: true, message: 'Cannot edit completed or cancelled orders.' });
    }

    await db.execute(
      `UPDATE orders SET
        supplier_id = COALESCE(?, supplier_id),
        customer_name = COALESCE(?, customer_name),
        expected_date = COALESCE(?, expected_date),
        notes = COALESCE(?, notes),
        updated_by = ?
       WHERE id = ?`,
      [supplier_id, customer_name, expected_date, notes, req.user.id, orderId]
    );

    const [updated] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json({ order: updated[0], message: 'Order updated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/orders/:id
 */
const deleteOrder = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id, order_number, status FROM orders WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Order not found.' });
    }

    if (existing[0].status === 'completed') {
      return res.status(400).json({ error: true, message: 'Cannot delete completed orders.' });
    }

    await db.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: `Order ${existing[0].order_number} deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrders, createOrder, getOrderById,
  updateOrderStatus, updateOrder, deleteOrder,
};
