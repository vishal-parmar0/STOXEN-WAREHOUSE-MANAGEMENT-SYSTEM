const db = require('../config/db');

/**
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    let query = `
      SELECT p.*, c.name AS category_name, s.name AS supplier_name,
        CASE
          WHEN p.current_quantity = 0 THEN 'out_of_stock'
          WHEN p.current_quantity <= p.minimum_threshold THEN 'low_stock'
          ELSE 'in_stock'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.created_by = ?
    `;
    const params = [req.user.id];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (status) {
      if (status === 'in_stock') {
        query += ' AND p.current_quantity > p.minimum_threshold';
      } else if (status === 'low_stock') {
        query += ' AND p.current_quantity > 0 AND p.current_quantity <= p.minimum_threshold';
      } else if (status === 'out_of_stock') {
        query += ' AND p.current_quantity = 0';
      }
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.updated_at DESC';

    const [rows] = await db.execute(query, params);

    // Map for frontend compatibility
    const products = rows.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category_name || 'Uncategorized',
      category_id: p.category_id,
      supplier: p.supplier_name || 'No Supplier',
      supplier_id: p.supplier_id,
      unit: p.unit,
      quantity: parseFloat(p.current_quantity),
      current_quantity: parseFloat(p.current_quantity),
      minimum_threshold: parseFloat(p.minimum_threshold),
      purchase_price: parseFloat(p.purchase_price),
      selling_price: parseFloat(p.selling_price),
      price: parseFloat(p.selling_price),
      batch_number: p.batch_number,
      expiry_date: p.expiry_date,
      description: p.description,
      status: p.stock_status,
      stock_status: p.stock_status,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    res.json({ products });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name, sku, category_id, supplier_id, unit,
      current_quantity, minimum_threshold,
      purchase_price, selling_price,
      batch_number, expiry_date, description,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: true, message: 'Product name is required.' });
    }

    // Auto-generate SKU if not provided
    const productSku = sku || `STX-${Date.now()}`;

    // Check SKU uniqueness
    const [existing] = await db.execute('SELECT id FROM products WHERE sku = ?', [productSku]);
    if (existing.length > 0) {
      return res.status(409).json({ error: true, message: 'A product with this SKU already exists.' });
    }

    const [result] = await db.execute(
      `INSERT INTO products (name, sku, category_id, supplier_id, unit, current_quantity, minimum_threshold, purchase_price, selling_price, batch_number, expiry_date, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, productSku, category_id || null, supplier_id || null,
        unit || 'pieces', current_quantity || 0, minimum_threshold || 0,
        purchase_price || 0, selling_price || 0,
        batch_number || null, expiry_date || null, description || null,
        req.user.id,
      ]
    );

    // If initial quantity > 0, create a stock_in transaction
    if (current_quantity && parseFloat(current_quantity) > 0) {
      await db.execute(
        `INSERT INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, performed_by, notes)
         VALUES (?, 'stock_in', ?, 0, ?, ?, 'Initial stock entry')`,
        [result.insertId, current_quantity, current_quantity, req.user.id]
      );
    }

    // Fetch the created product
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({ product: rows[0], message: 'Product created successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name,
        CASE
          WHEN p.current_quantity = 0 THEN 'out_of_stock'
          WHEN p.current_quantity <= p.minimum_threshold THEN 'low_stock'
          ELSE 'in_stock'
        END AS stock_status
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    const p = rows[0];
    res.json({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category_name || 'Uncategorized',
      category_id: p.category_id,
      supplier: p.supplier_name || 'No Supplier',
      supplier_id: p.supplier_id,
      unit: p.unit,
      quantity: parseFloat(p.current_quantity),
      current_quantity: parseFloat(p.current_quantity),
      minimum_threshold: parseFloat(p.minimum_threshold),
      min_stock_level: parseFloat(p.minimum_threshold),
      purchase_price: parseFloat(p.purchase_price),
      selling_price: parseFloat(p.selling_price),
      batch_number: p.batch_number,
      expiry_date: p.expiry_date,
      description: p.description,
      status: p.stock_status,
      stock_status: p.stock_status,
      created_at: p.created_at,
      updated_at: p.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/products/:id
 * Note: current_quantity is EXCLUDED — stock changes only via transactions
 */
const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const {
      name, sku, category_id, supplier_id, unit,
      minimum_threshold, purchase_price, selling_price,
      batch_number, expiry_date, description,
    } = req.body;

    // Check product exists
    const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    // Check SKU uniqueness if changed
    if (sku) {
      const [skuCheck] = await db.execute('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, productId]);
      if (skuCheck.length > 0) {
        return res.status(409).json({ error: true, message: 'A product with this SKU already exists.' });
      }
    }

    await db.execute(
      `UPDATE products SET
        name = COALESCE(?, name),
        sku = COALESCE(?, sku),
        category_id = COALESCE(?, category_id),
        supplier_id = COALESCE(?, supplier_id),
        unit = COALESCE(?, unit),
        minimum_threshold = COALESCE(?, minimum_threshold),
        purchase_price = COALESCE(?, purchase_price),
        selling_price = COALESCE(?, selling_price),
        batch_number = COALESCE(?, batch_number),
        expiry_date = COALESCE(?, expiry_date),
        description = COALESCE(?, description)
       WHERE id = ?`,
      [
        name, sku, category_id, supplier_id, unit,
        minimum_threshold, purchase_price, selling_price,
        batch_number, expiry_date, description,
        productId,
      ]
    );

    const [updated] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
    res.json({ product: updated[0], message: 'Product updated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/products/:id (Admin only)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id, name FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: `Product "${existing[0].name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/low-stock
 */
const getLowStock = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.current_quantity <= p.minimum_threshold
       ORDER BY p.current_quantity ASC`
    );
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/expiring
 */
const getExpiring = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.expiry_date IS NOT NULL
         AND p.expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY)
       ORDER BY p.expiry_date ASC`
    );
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts, createProduct, getProductById,
  updateProduct, deleteProduct, getLowStock, getExpiring,
};
