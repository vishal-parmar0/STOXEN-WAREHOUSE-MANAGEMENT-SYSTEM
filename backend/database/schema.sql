-- ============================================================
-- STOXEN WAREHOUSE MANAGEMENT SYSTEM — DATABASE SCHEMA
-- Version: 2.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS stoxen_db;
USE stoxen_db;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','manager','staff') DEFAULT 'staff',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(150) NOT NULL,
  contact_person  VARCHAR(100),
  phone           VARCHAR(20),
  email           VARCHAR(100),
  address         TEXT,
  city            VARCHAR(100),
  payment_terms   TEXT,
  notes           TEXT,
  created_by      INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                 INT PRIMARY KEY AUTO_INCREMENT,
  name               VARCHAR(150) NOT NULL,
  sku                VARCHAR(50) NOT NULL UNIQUE,
  category_id        INT,
  supplier_id        INT,
  unit               VARCHAR(50) DEFAULT 'pieces',
  current_quantity   DECIMAL(10,2) DEFAULT 0,
  minimum_threshold  DECIMAL(10,2) DEFAULT 0,
  purchase_price     DECIMAL(10,2) DEFAULT 0,
  selling_price      DECIMAL(10,2) DEFAULT 0,
  batch_number       VARCHAR(100),
  expiry_date        DATE,
  description        TEXT,
  created_by         INT,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
                             ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
                             ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id)
                             ON DELETE SET NULL
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  product_id        INT NOT NULL,
  type              ENUM('stock_in','stock_out','adjustment') NOT NULL,
  quantity          DECIMAL(10,2) NOT NULL,
  previous_quantity DECIMAL(10,2) NOT NULL,
  new_quantity      DECIMAL(10,2) NOT NULL,
  supplier_id       INT,
  order_id          INT,
  purchase_price    DECIMAL(10,2),
  reason            VARCHAR(255),
  notes             TEXT,
  performed_by      INT NOT NULL,
  transaction_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id)   REFERENCES products(id)
                              ON DELETE CASCADE,
  FOREIGN KEY (supplier_id)  REFERENCES suppliers(id)
                              ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES users(id)
                              ON DELETE RESTRICT
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  type        ENUM('low_stock','expiry','order_status') NOT NULL,
  product_id  INT,
  order_id    INT,
  user_id     INT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
                            ON DELETE CASCADE,
  FOREIGN KEY (order_id)   REFERENCES orders(id)
                            ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)
                            ON DELETE CASCADE
);
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
                             ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id)
                             ON DELETE RESTRICT,
  FOREIGN KEY (updated_by)  REFERENCES users(id)
                             ON DELETE SET NULL
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    DECIMAL(10,2) NOT NULL,
  unit_price  DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (order_id)   REFERENCES orders(id)
                            ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
                            ON DELETE RESTRICT
);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  type        ENUM('low_stock','expiry','order_status') NOT NULL,
  product_id  INT,
  order_id    INT,
  user_id     INT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
                            ON DELETE CASCADE,
  FOREIGN KEY (order_id)   REFERENCES orders(id)
                            ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)
                            ON DELETE CASCADE
);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  action      VARCHAR(255) NOT NULL,
  module      VARCHAR(100) NOT NULL,
  details     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
                         ON DELETE CASCADE
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  warehouse_name       VARCHAR(150) DEFAULT 'My Warehouse',
  warehouse_address    TEXT,
  warehouse_phone      VARCHAR(20),
  warehouse_email      VARCHAR(100),
  low_stock_alert_days INT DEFAULT 0,
  expiry_alert_days    INT DEFAULT 30,
  user_id              INT UNIQUE,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                       ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
