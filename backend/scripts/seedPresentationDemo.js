require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dbConfig = {
  host: '127.0.0.1',
  port: 5000,
  user: 'root',
  password: 'entersql',
  database: 'stoxen_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
let db;

async function getDb() {
  if (!db) db = await mysql.createPool(dbConfig);
  return db;
}


async function getUserIdByEmail(email) {
  const db = await getDb();
  const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0].id : null;
}

async function main() {

  // Always initialize db at the very top
  const db = await getDb();

  // 1. Create users if not exist (declare only once)
  const users = [
    { name: 'Ajay', email: 'ajay@demo.com', password: 'admin123', role: 'admin' },
    { name: 'Majay', email: 'majay@demo.com', password: 'manager123', role: 'manager' },
    { name: 'Sajay', email: 'sajay@demo.com', password: 'staff123', role: 'staff' },
  ];
  const userIds = {};
  for (const user of users) {
    let id = await getUserIdByEmail(user.email);
    if (!id) {
      const hashed = await bcrypt.hash(user.password, 10);
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hashed, user.role]
      );
      id = result.insertId;
      console.log(`Created user: ${user.name} (${user.role})`);
    } else {
      console.log(`User already exists: ${user.name} (${user.role})`);
    }
    userIds[user.role] = id;
  }

  // 2. Clear previous demo data for idempotency (now that userIds are available)
  await db.execute('DELETE FROM transactions WHERE performed_by IN (?, ?, ?)', [userIds.admin, userIds.manager, userIds.staff]);
  await db.execute('DELETE FROM orders WHERE created_by IN (?, ?, ?)', [userIds.admin, userIds.manager, userIds.staff]);
  await db.execute('DELETE FROM products WHERE created_by IN (?, ?, ?)', [userIds.admin, userIds.manager, userIds.staff]);
  await db.execute('DELETE FROM suppliers WHERE created_by IN (?, ?, ?)', [userIds.admin, userIds.manager, userIds.staff]);

  // 2. Add demo suppliers for each user
  const supplierData = [
    { name: 'Alpha Supplies', contact_person: 'Alice', phone: '9876543210', email: 'alpha@supplies.com', address: '123 Alpha St', city: 'Metropolis', payment_terms: 'Net 30', notes: 'Preferred', created_by: userIds.admin },
    { name: 'Beta Traders', contact_person: 'Bob', phone: '9123456780', email: 'beta@traders.com', address: '456 Beta Ave', city: 'Gotham', payment_terms: 'Net 15', notes: '', created_by: userIds.manager },
    { name: 'Gamma Wholesale', contact_person: 'Carol', phone: '9988776655', email: 'gamma@wholesale.com', address: '789 Gamma Rd', city: 'Star City', payment_terms: 'Advance', notes: 'Bulk discounts', created_by: userIds.staff },
  ];
  const supplierIds = {};
  for (const s of supplierData) {
    const [result] = await db.execute(
      'INSERT IGNORE INTO suppliers (name, contact_person, phone, email, address, city, payment_terms, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [s.name, s.contact_person, s.phone, s.email, s.address, s.city, s.payment_terms, s.notes, s.created_by]
    );
    // Get supplier id (insertId if new, or fetch by name)
    let id = result.insertId;
    if (!id) {
      const [rows] = await db.execute('SELECT id FROM suppliers WHERE name = ?', [s.name]);
      id = rows.length > 0 ? rows[0].id : null;
    }
    supplierIds[s.name] = id;
  }

  // 3. Add demo products for each user, with a mix of stock levels
  const demoProducts = [
    // In stock
    ['Admin Widget', 'AW-003', 'pieces', 80, 8, 60, 90, userIds.admin, supplierIds['Alpha Supplies']],
    ['Manager Tool', 'MT-004', 'boxes', 30, 3, 150, 220, userIds.manager, supplierIds['Beta Traders']],
    ['Staff Supply', 'SS-005', 'packs', 60, 6, 40, 55, userIds.staff, supplierIds['Gamma Wholesale']],
    // Low stock
    ['Low Stock Widget', 'LS-006', 'pieces', 2, 5, 20, 30, userIds.admin, supplierIds['Alpha Supplies']],
    // Out of stock
    ['Out of Stock Tool', 'OS-007', 'boxes', 0, 4, 100, 150, userIds.manager, supplierIds['Beta Traders']],
  ];
  for (const prod of demoProducts) {
    await db.execute(
      'INSERT IGNORE INTO products (name, sku, unit, current_quantity, minimum_threshold, purchase_price, selling_price, created_by, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      prod
    );
  }

  // 4. Add more demo orders for each user, with different statuses
  const demoOrders = [
    ['ORD-2001', 'purchase', 'pending', 3000, userIds.admin, supplierIds['Alpha Supplies']],
    ['ORD-2002', 'dispatch', 'processing', 1500, userIds.manager, supplierIds['Beta Traders']],
    ['ORD-2003', 'purchase', 'approved', 800, userIds.staff, supplierIds['Gamma Wholesale']],
    ['ORD-2004', 'purchase', 'completed', 1200, userIds.admin, supplierIds['Alpha Supplies']],
    ['ORD-2005', 'dispatch', 'pending', 500, userIds.manager, supplierIds['Beta Traders']],
  ];
  for (const ord of demoOrders) {
    await db.execute(
      'INSERT IGNORE INTO orders (order_number, type, status, total_value, created_by, supplier_id) VALUES (?, ?, ?, ?, ?, ?)',
      ord
    );
  }

  // 5. Add more demo transactions for each user, with varied types and dates
  const [allProducts] = await db.execute('SELECT id, name, created_by FROM products');
  const allProductIds = {};
  for (const p of allProducts) allProductIds[p.name] = p.id;
  const demoTransactions = [
    // Stock in, out, adjustment, for different users and products
    [allProductIds['Admin Widget'], 'stock_in', 20, 60, 80, userIds.admin, '2026-02-20'],
    [allProductIds['Admin Widget'], 'stock_out', 10, 80, 70, userIds.admin, '2026-02-21'],
    [allProductIds['Manager Tool'], 'stock_in', 15, 15, 30, userIds.manager, '2026-02-22'],
    [allProductIds['Manager Tool'], 'stock_out', 5, 30, 25, userIds.manager, '2026-02-23'],
    [allProductIds['Staff Supply'], 'adjustment', 2, 62, 60, userIds.staff, '2026-02-24'],
    [allProductIds['Low Stock Widget'], 'stock_out', 3, 5, 2, userIds.admin, '2026-02-24'],
    [allProductIds['Out of Stock Tool'], 'stock_out', 4, 4, 0, userIds.manager, '2026-02-24'],
  ];
  for (const tx of demoTransactions) {
    await db.execute(
      'INSERT INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, performed_by, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      tx
    );
  }
  // 6. Skipping alert insertion: alerts table does not have user_id column in this schema

  // 6. Insert demo products (created by Admin and Manager)
  await db.execute(
    'INSERT IGNORE INTO products (name, sku, unit, current_quantity, minimum_threshold, purchase_price, selling_price, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['Demo Widget', 'DW-001', 'pieces', 100, 10, 50, 75, userIds.admin]
  );
  await db.execute(
    'INSERT IGNORE INTO products (name, sku, unit, current_quantity, minimum_threshold, purchase_price, selling_price, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['Sample Gadget', 'SG-002', 'boxes', 50, 5, 200, 300, userIds.manager]
  );
  // Get product IDs
  const [pRows] = await db.execute('SELECT id, name FROM products WHERE sku IN (?, ?)', ['DW-001', 'SG-002']);
  const productIds = {};
  for (const p of pRows) productIds[p.name] = p.id;

  // 7. Insert demo orders (created by Manager)
  const [order1] = await db.execute(
    'INSERT IGNORE INTO orders (order_number, type, status, total_value, created_by) VALUES (?, ?, ?, ?, ?)',
    ['ORD-1001', 'purchase', 'completed', 5000, userIds.manager]
  );
  // Get order ID
  const [oRows] = await db.execute('SELECT id FROM orders WHERE order_number = ?', ['ORD-1001']);
  const orderId = oRows.length > 0 ? oRows[0].id : null;

  // 8. Insert demo transactions (performed by Staff)
  if (productIds['Demo Widget']) {
    await db.execute(
      'INSERT IGNORE INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, performed_by) VALUES (?, ?, ?, ?, ?, ?)',
      [productIds['Demo Widget'], 'stock_out', 10, 100, 90, userIds.staff]
    );
  }
  if (productIds['Sample Gadget']) {
    await db.execute(
      'INSERT IGNORE INTO transactions (product_id, type, quantity, previous_quantity, new_quantity, performed_by) VALUES (?, ?, ?, ?, ?, ?)',
      [productIds['Sample Gadget'], 'stock_in', 20, 50, 70, userIds.staff]
    );
  }

  // 9. Skipping alerts: alerts table does not have user_id column in this schema

  // 10. Skipping settings: settings table does not have user_id column in this schema

  console.log('Demo data seeded for Ajay (Admin), Majay (Manager), Sajay (Staff).');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding demo data:', err);
  process.exit(1);
});