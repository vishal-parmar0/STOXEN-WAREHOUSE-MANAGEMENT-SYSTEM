const db = require('../config/db');

/**
 * GET /api/suppliers
 */
const getAllSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT s.*,
        (SELECT COUNT(*) FROM products p WHERE p.supplier_id = s.id AND p.created_by = ?) AS products_count
      FROM suppliers s
      WHERE s.created_by = ?
    `;
    const params = [req.user.id, req.user.id];

    if (search) {
      query += ' AND (s.name LIKE ? OR s.city LIKE ? OR s.contact_person LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.name ASC';

    const [rows] = await db.execute(query, params);
    res.json({ suppliers: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/suppliers
 */
const createSupplier = async (req, res, next) => {
  try {
    const { name, contact_person, phone, email, address, city, payment_terms, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: true, message: 'Supplier name is required.' });
    }

    const [result] = await db.execute(
      `INSERT INTO suppliers (name, contact_person, phone, email, address, city, payment_terms, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, contact_person || null, phone || null, email || null, address || null, city || null, payment_terms || null, notes || null, req.user.id]
    );

    const [rows] = await db.execute('SELECT * FROM suppliers WHERE id = ? AND created_by = ?', [result.insertId, req.user.id]);
    res.status(201).json({ supplier: rows[0], message: 'Supplier created successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/suppliers/:id
 */
const getSupplierById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*,
        (SELECT COUNT(*) FROM products p WHERE p.supplier_id = s.id AND p.created_by = ?) AS products_count
       FROM suppliers s WHERE s.id = ? AND s.created_by = ?`,
      [req.user.id, req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Supplier not found.' });
    }

    // Get products linked to this supplier
    const [products] = await db.execute(
      'SELECT id, name, sku, current_quantity, unit FROM products WHERE supplier_id = ?',
      [req.params.id]
    );

    res.json({ supplier: rows[0], products });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/suppliers/:id
 */
const updateSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const { name, contact_person, phone, email, address, city, payment_terms, notes } = req.body;

    const [existing] = await db.execute('SELECT id FROM suppliers WHERE id = ? AND created_by = ?', [supplierId, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Supplier not found or access denied.' });
    }

    await db.execute(
      `UPDATE suppliers SET
        name = COALESCE(?, name),
        contact_person = COALESCE(?, contact_person),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        payment_terms = COALESCE(?, payment_terms),
        notes = COALESCE(?, notes)
       WHERE id = ? AND created_by = ?`,
      [name, contact_person, phone, email, address, city, payment_terms, notes, supplierId, req.user.id]
    );

    const [updated] = await db.execute('SELECT * FROM suppliers WHERE id = ? AND created_by = ?', [supplierId, req.user.id]);
    res.json({ supplier: updated[0], message: 'Supplier updated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/suppliers/:id (Admin only)
 */
const deleteSupplier = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id, name FROM suppliers WHERE id = ? AND created_by = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Supplier not found or access denied.' });
    }

    await db.execute('DELETE FROM suppliers WHERE id = ? AND created_by = ?', [req.params.id, req.user.id]);
    res.json({ message: `Supplier "${existing[0].name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/suppliers/:id/history
 */
const getSupplierHistory = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.*, p.name AS product_name, p.sku AS product_sku, u.name AS user_name
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       JOIN users u ON t.performed_by = u.id
       WHERE t.supplier_id = ? AND t.type = 'stock_in'
       ORDER BY t.transaction_date DESC`,
      [req.params.id]
    );

    // Calculate totals
    const totalValue = rows.reduce((sum, t) => sum + (parseFloat(t.quantity) * (parseFloat(t.purchase_price) || 0)), 0);

    res.json({ history: rows, totalValue });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSuppliers, createSupplier, getSupplierById,
  updateSupplier, deleteSupplier, getSupplierHistory,
};
