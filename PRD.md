# STOXEN — Product Requirements Document (PRD)
> **Version:** 2.0  
> **Date:** February 22, 2026  
> **Status:** In Development  

---

## 1. Executive Summary

### 1.1 Product Name
**Stoxen** — Warehouse Management System

### 1.2 Tagline
*Smart Stock. Zero Chaos.*

### 1.3 Product Type
Full-Stack Web Application (SaaS)

### 1.4 Elevator Pitch
Stoxen is a free, web-based, full-featured Warehouse Management System designed for small and medium businesses. It bridges the gap between error-prone spreadsheets and unaffordable enterprise solutions (SAP, Oracle), delivering real-time stock visibility, automatic alerts, audit trails, and role-based access — all without requiring technical training.

---

## 2. Problem Statement

Small and medium businesses that operate physical warehouses have **NO affordable, complete, and easy-to-use digital solution** to manage their warehouse operations. They are stuck between two bad options:

| Option | Pros | Cons |
|--------|------|------|
| **Paper & Excel** | Cheap | Error-prone, no real-time data, no alerts, no audit trail |
| **Enterprise WMS** (SAP, Oracle) | Powerful | Unaffordable, requires IT teams, weeks of training |

### 2.1 Ten Core Problems Stoxen Solves

| # | Problem | Impact |
|---|---------|--------|
| 1 | **No Real-Time Stock Visibility** | Stockouts discovered only after orders fail |
| 2 | **No Stock Transaction History** | No record of who changed stock, when, or why |
| 3 | **No Automatic Low Stock Alerts** | Stockouts happen silently — no warnings |
| 4 | **No Supplier Management** | Supplier info scattered across WhatsApp, contacts, paper |
| 5 | **No Order Management** | Orders created verbally with no digital tracking |
| 6 | **No Role-Based Access Control** | All employees share same access — anyone can delete anything |
| 7 | **No Report Generation** | Hours of manual spreadsheet work, still error-prone |
| 8 | **No Batch or Expiry Tracking** | Expired stock (medicine/food) goes undetected |
| 9 | **No Audit Trail** | Cannot pass compliance audits, cannot investigate theft |
| 10 | **Inventory Inaccuracy** | Manual errors drop accuracy to 85-90%, causing business loss |

---

## 3. Solution — Stoxen's 10 Modules

| Module | Name | Description |
|--------|------|-------------|
| M1 | **Authentication & RBAC** | JWT login & signup, bcrypt password hashing, role-based route guards, demo-mode fallback |
| M2 | **Product & Inventory** | Full CRUD, SKU management, batch/expiry tracking, threshold monitoring |
| M3 | **Stock Transactions** | Stock IN/OUT/Adjustment with immutable audit trail |
| M4 | **Supplier Management** | Supplier CRUD, contact info, purchase history per supplier |
| M5 | **Order Management** | Purchase & dispatch orders with full lifecycle (pending → completed) |
| M6 | **Dashboard & Analytics** | Real-time visual stats, charts, alerts, recent activity |
| M7 | **Report Generation** | PDF & CSV export for inventory, transactions, suppliers, orders |
| M8 | **Alerts & Notifications** | Automatic low-stock, expiry, and order-status alerts |
| M9 | **User Management** | Admin panel for managing users, roles, activation status |
| M10 | **Settings & Config** | Warehouse info, alert thresholds, system preferences |

---

## 4. Target Users & Roles

### 4.1 Target Audience
- Small and medium warehouse businesses (5–200 employees)
- Distribution centers, retail stockrooms, manufacturing stores
- Food/pharma businesses needing batch & expiry tracking

### 4.2 User Roles & Permissions

| Permission | Admin | Manager | Staff |
|-----------|-------|---------|-------|
| View dashboard | ✅ | ✅ | ✅ |
| View inventory | ✅ | ✅ | ✅ |
| Add/edit products | ✅ | ✅ | ❌ |
| Delete products | ✅ | ❌ | ❌ |
| Record stock IN/OUT | ✅ | ✅ | ✅ |
| Manage suppliers | ✅ | ✅ | ❌ |
| Delete suppliers | ✅ | ❌ | ❌ |
| Manage orders | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ |
| Export reports (PDF/CSV) | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ |
| View alerts | ✅ | ✅ | ✅ |
| View activity log | ✅ | ✅ | ❌ |

---

## 5. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19.2+ | UI component library |
| **Styling** | Tailwind CSS 4.2+ | Utility-first CSS framework (Vite plugin, no config file) |
| **Bundler** | Vite 7.3+ | Fast dev server & build tool |
| **UI Primitives** | Radix UI (react-slot) | Composable component primitives |
| **CSS Utilities** | clsx + tailwind-merge + cva | Class merging & variant management |
| **Backend** | Node.js 18+ + Express.js 4+ | REST API server |
| **Database** | MySQL 8+ | Relational data storage |
| **Auth** | JWT + bcrypt | Token-based authentication |
| **Charts** | Recharts 3.7+ | Data visualization |
| **PDF Export** | jsPDF 4.2+ + html2canvas | PDF report generation |
| **Icons** | Lucide React 0.575+ | SVG icon library |
| **HTTP Client** | Axios 1.13+ | API request handling |
| **Router** | React Router DOM 7.13+ | Client-side routing |

---

## 6. Business Rules (Strict)

These rules are **non-negotiable** and must be enforced at both backend and frontend layers:

| # | Rule | Enforcement |
|---|------|-------------|
| R1 | Stock quantity can **NEVER** go below 0 | Backend validation + DB constraint |
| R2 | Stock OUT must **fail** if qty > available stock | Backend transaction check |
| R3 | `current_quantity` changes **ONLY** via transactions | No direct update endpoint |
| R4 | Direct editing of `current_quantity` is **NOT allowed** | Field excluded from PUT body |
| R5 | After stock_out: if qty ≤ threshold → **auto alert** | Post-transaction trigger |
| R6 | `expiry_date` within 30 days → **auto expiry alert** | Scheduled check / on-access |
| R7 | Order status → COMPLETED → **auto stock update** | Order status change hook |
| R8 | Transactions are **IMMUTABLE** — never edit or delete | No PUT/DELETE endpoints |
| R9 | SKU codes must be **globally unique** | DB UNIQUE constraint + validation |
| R10 | Only Admin can **delete** products, suppliers, users | Role middleware enforcement |
| R11 | Staff **cannot access** reports, settings, users | Route guard + API middleware |
| R12 | All actions logged to `activity_log` with timestamp | Middleware logger on all mutations |

---

## 7. Database Schema

### 7.1 Entity Relationship Overview

```
users ─────────┬─── products (created_by)
               ├─── transactions (performed_by)
               ├─── orders (created_by, updated_by)
               └─── activity_log (user_id)

categories ────── products (category_id)

suppliers ─────┬─── products (supplier_id)
               ├─── transactions (supplier_id)
               └─── orders (supplier_id)

products ──────┬─── transactions (product_id)
               ├─── order_items (product_id)
               └─── alerts (product_id)

orders ────────┬─── order_items (order_id)
               ├─── transactions (order_id)
               └─── alerts (order_id)
```

### 7.2 Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (bcrypt hashed) |
| role | ENUM('admin','manager','staff') | DEFAULT 'staff' |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

#### `categories`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| description | TEXT | — |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Seed Data:** Electronics, Raw Materials, Finished Goods, Packaging, Spare Parts, Chemicals

#### `suppliers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(150) | NOT NULL |
| contact_person | VARCHAR(100) | — |
| phone | VARCHAR(20) | — |
| email | VARCHAR(100) | — |
| address | TEXT | — |
| city | VARCHAR(100) | — |
| payment_terms | TEXT | — |
| notes | TEXT | — |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

#### `products`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(150) | NOT NULL |
| sku | VARCHAR(50) | NOT NULL, UNIQUE |
| category_id | INT | FK → categories(id) ON DELETE SET NULL |
| supplier_id | INT | FK → suppliers(id) ON DELETE SET NULL |
| unit | VARCHAR(50) | DEFAULT 'pieces' |
| current_quantity | DECIMAL(10,2) | DEFAULT 0 |
| minimum_threshold | DECIMAL(10,2) | DEFAULT 0 |
| purchase_price | DECIMAL(10,2) | DEFAULT 0 |
| selling_price | DECIMAL(10,2) | DEFAULT 0 |
| batch_number | VARCHAR(100) | — |
| expiry_date | DATE | — |
| description | TEXT | — |
| created_by | INT | FK → users(id) ON DELETE SET NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

#### `transactions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| product_id | INT | NOT NULL, FK → products(id) ON DELETE CASCADE |
| type | ENUM('stock_in','stock_out','adjustment') | NOT NULL |
| quantity | DECIMAL(10,2) | NOT NULL |
| previous_quantity | DECIMAL(10,2) | NOT NULL |
| new_quantity | DECIMAL(10,2) | NOT NULL |
| supplier_id | INT | FK → suppliers(id) ON DELETE SET NULL |
| order_id | INT | FK → orders(id) nullable |
| purchase_price | DECIMAL(10,2) | — |
| reason | VARCHAR(255) | — |
| notes | TEXT | — |
| performed_by | INT | NOT NULL, FK → users(id) ON DELETE RESTRICT |
| transaction_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### `orders`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| order_number | VARCHAR(50) | NOT NULL, UNIQUE |
| type | ENUM('purchase','dispatch') | NOT NULL |
| supplier_id | INT | FK → suppliers(id) ON DELETE SET NULL |
| customer_name | VARCHAR(150) | — |
| status | ENUM('pending','approved','processing','completed','cancelled') | DEFAULT 'pending' |
| expected_date | DATE | — |
| total_value | DECIMAL(12,2) | DEFAULT 0 |
| notes | TEXT | — |
| created_by | INT | NOT NULL, FK → users(id) ON DELETE RESTRICT |
| updated_by | INT | FK → users(id) nullable |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

#### `order_items`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| order_id | INT | NOT NULL, FK → orders(id) ON DELETE CASCADE |
| product_id | INT | NOT NULL, FK → products(id) ON DELETE RESTRICT |
| quantity | DECIMAL(10,2) | NOT NULL |
| unit_price | DECIMAL(10,2) | DEFAULT 0 |
| total_price | DECIMAL(10,2) | DEFAULT 0 |

#### `alerts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| type | ENUM('low_stock','expiry','order_status') | NOT NULL |
| product_id | INT | FK → products(id) ON DELETE CASCADE |
| order_id | INT | FK → orders(id) ON DELETE CASCADE |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### `activity_log`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | NOT NULL, FK → users(id) ON DELETE CASCADE |
| action | VARCHAR(255) | NOT NULL |
| module | VARCHAR(100) | NOT NULL |
| details | TEXT | — |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### `settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| warehouse_name | VARCHAR(150) | DEFAULT 'My Warehouse' |
| warehouse_address | TEXT | — |
| warehouse_phone | VARCHAR(20) | — |
| warehouse_email | VARCHAR(100) | — |
| low_stock_alert_days | INT | DEFAULT 0 |
| expiry_alert_days | INT | DEFAULT 30 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

---

## 8. API Routes

### 8.1 Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user → JWT | Public |
| POST | `/api/auth/login` | Login with email + password → JWT | Public |
| POST | `/api/auth/logout` | Invalidate session | Authenticated |
| GET | `/api/auth/me` | Get current user profile | Authenticated |

### 8.2 Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List all users | Admin |
| POST | `/api/users` | Create new user | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Deactivate/delete user | Admin |

### 8.3 Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | List all products (filterable) | Authenticated |
| POST | `/api/products` | Create product | Admin, Manager |
| GET | `/api/products/:id` | Get product details | Authenticated |
| PUT | `/api/products/:id` | Update product (not qty) | Admin, Manager |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/products/low-stock` | Products below threshold | Authenticated |
| GET | `/api/products/expiring` | Products expiring within N days | Authenticated |

### 8.4 Transactions
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/transactions` | List all transactions | Admin, Manager |
| POST | `/api/transactions/stock-in` | Record stock IN | Authenticated |
| POST | `/api/transactions/stock-out` | Record stock OUT | Authenticated |
| POST | `/api/transactions/adjustment` | Record adjustment | Admin, Manager |
| GET | `/api/transactions/:id` | Get transaction detail | Authenticated |
| GET | `/api/transactions/product/:productId` | Transaction history for product | Authenticated |

### 8.5 Suppliers
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/suppliers` | List all suppliers | Admin, Manager |
| POST | `/api/suppliers` | Create supplier | Admin, Manager |
| GET | `/api/suppliers/:id` | Get supplier details | Admin, Manager |
| PUT | `/api/suppliers/:id` | Update supplier | Admin, Manager |
| DELETE | `/api/suppliers/:id` | Delete supplier | Admin |
| GET | `/api/suppliers/:id/history` | Supplier purchase history | Admin, Manager |

### 8.6 Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | List all orders | Admin, Manager |
| POST | `/api/orders` | Create order | Admin, Manager |
| GET | `/api/orders/:id` | Get order details + items | Admin, Manager |
| PUT | `/api/orders/:id` | Update order | Admin, Manager |
| PATCH | `/api/orders/:id/status` | Change order status | Admin, Manager |
| DELETE | `/api/orders/:id` | Delete order (if pending) | Admin |

### 8.7 Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/stats` | Summary stats (counts, values) | Authenticated |
| GET | `/api/dashboard/stock-movement` | Stock movement chart data (7d/30d) | Authenticated |
| GET | `/api/dashboard/top-products` | Top moving products | Authenticated |
| GET | `/api/dashboard/recent-transactions` | Last 10 transactions | Authenticated |
| GET | `/api/dashboard/alerts` | Active unread alerts | Authenticated |

### 8.8 Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reports/inventory` | Full inventory report | Admin, Manager |
| GET | `/api/reports/transactions` | Transaction report (date range) | Admin, Manager |
| GET | `/api/reports/low-stock` | Low-stock report | Admin, Manager |
| GET | `/api/reports/suppliers` | Supplier performance report | Admin, Manager |
| GET | `/api/reports/orders` | Order summary report | Admin, Manager |

### 8.9 Alerts
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/alerts` | List all alerts | Authenticated |
| PATCH | `/api/alerts/:id/read` | Mark alert as read | Authenticated |
| PATCH | `/api/alerts/read-all` | Mark all alerts as read | Authenticated |
| DELETE | `/api/alerts/:id` | Delete alert | Admin |

### 8.10 Settings & Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/settings` | Get warehouse settings | Admin |
| PUT | `/api/settings` | Update warehouse settings | Admin |
| GET | `/api/categories` | List all categories | Authenticated |
| POST | `/api/categories` | Create category | Admin, Manager |
| PUT | `/api/categories/:id` | Update category | Admin, Manager |
| DELETE | `/api/categories/:id` | Delete category | Admin |
| GET | `/api/activity-log` | Get activity log | Admin, Manager |

---

## 9. Environment Variables

### Backend (`.env`)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=stoxen_db
JWT_SECRET=stoxen_super_secret_jwt_key_2025
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 10. Project Structure

```
STOXEN-WAREHOUSE-MANAGEMENT-SYSTEM/
├── backend/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   ├── role.js                  # Role-based access middleware
│   │   └── logger.js                # Activity log middleware
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── products.routes.js
│   │   ├── transactions.routes.js
│   │   ├── suppliers.routes.js
│   │   ├── orders.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── reports.routes.js
│   │   ├── alerts.routes.js
│   │   ├── settings.routes.js
│   │   └── categories.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── products.controller.js
│   │   ├── transactions.controller.js
│   │   ├── suppliers.controller.js
│   │   ├── orders.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── reports.controller.js
│   │   ├── alerts.controller.js
│   │   └── settings.controller.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── database/
│   │   └── schema.sql               # Full DB creation script
│   ├── .env
│   ├── server.js                    # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── warehouse-logo.svg       # Custom warehouse building SVG logo
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js               # Axios instance + interceptors + demo fallback
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state (login, register, logout, demo mode)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.jsx   # Responsive layout w/ mobile drawer
│   │   │   │   ├── Sidebar.jsx           # Collapsible sidebar + mobile slide-out
│   │   │   │   └── Topbar.jsx            # Search, alerts, user menu, hamburger
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   └── ui/
│   │   │       ├── animated-stoxen-landing.jsx  # Full landing page (single component)
│   │   │       ├── liquid-glass-button.jsx
│   │   │       └── navbar.jsx                   # Light navbar variant (scroll-morphing)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx          # Wrapper → StoxenLanding
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx           # Registration page
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── SuppliersPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── hooks/
│   │   │   └── useScrollReveal.js
│   │   ├── lib/
│   │   │   └── utils.js             # cn() helper (clsx + tailwind-merge)
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Tailwind v4 @import + @theme tokens + responsive helpers
│   ├── index.html
│   ├── vite.config.js               # React + Tailwind v4 Vite plugins, path alias, proxy
│   └── package.json
│
├── PRD.md
├── design.md
├── design.json
└── README.md
```

---

## 11. Build Order (Implementation Phases)

### Phase 1 — Backend Foundation
| Step | Task | Dependencies |
|------|------|-------------|
| 1 | Setup Express server + MySQL connection pool | None |
| 2 | Create MySQL database + all tables (schema.sql) | Step 1 |
| 3 | Build auth module (login, JWT, role middleware) | Step 2 |
| 4 | Build users module (CRUD + admin guard) | Step 3 |

### Phase 2 — Core Backend Modules
| Step | Task | Dependencies |
|------|------|-------------|
| 5 | Build products module with business rules | Step 4 |
| 6 | Build transactions module (IN/OUT/Adj + rules) | Step 5 |
| 7 | Build suppliers module | Step 4 |
| 8 | Build orders module with status lifecycle | Steps 5, 7 |

### Phase 3 — Backend Analytics & Support
| Step | Task | Dependencies |
|------|------|-------------|
| 9 | Build dashboard API (5 endpoints) | Steps 5–8 |
| 10 | Build reports module (5 report types) | Steps 5–8 |
| 11 | Build alerts module | Steps 5, 8 |
| 12 | Build settings module | Step 4 |

### Phase 4 — Frontend Foundation
| Step | Task | Dependencies |
|------|------|-------------|
| 13 | Setup React + Vite + Tailwind CSS | None |
| 14 | Build axios api.js with interceptors | Step 13 |
| 15 | Build AuthContext + ProtectedRoute | Step 14 |
| 16 | Build Landing Page (9 sections) | Step 13 |

### Phase 5 — Frontend Application
| Step | Task | Dependencies |
|------|------|-------------|
| 17 | Build Sidebar + Topbar + DashboardLayout | Step 15 |
| 18 | Build Dashboard page (3-column layout) | Step 17 |
| 19 | Build Inventory pages | Step 17 |
| 20 | Build Transactions pages | Step 17 |
| 21 | Build Suppliers pages | Step 17 |
| 22 | Build Orders pages | Step 17 |

### Phase 6 — Frontend Features & Polish
| Step | Task | Dependencies |
|------|------|-------------|
| 23 | Build Reports page (PDF/CSV export) | Step 17 |
| 24 | Build Alerts page | Step 17 |
| 25 | Build Users page (Admin only) | Step 17 |
| 26 | Build Settings page (Admin only) | Step 17 |
| 27 | Add loading, error, empty states, modals, validation | Steps 18–26 |
| 28 | Make all pages fully responsive | Steps 18–26 |

---

## 12. Non-Functional Requirements

### 12.1 Performance
- Dashboard loads within 2 seconds
- API response time < 500ms for standard queries
- Support up to 10,000 products and 100,000 transactions

### 12.2 Security
- Passwords hashed with bcrypt (10+ salt rounds)
- JWT tokens with 7-day expiry
- All API routes protected by auth middleware
- Role-based access enforced at API level (not just UI)
- SQL injection prevention via parameterized queries
- CORS restricted to `CLIENT_URL`

### 12.3 Reliability
- Database transactions for stock operations (BEGIN/COMMIT/ROLLBACK)
- Immutable transaction records — no edit/delete
- Graceful error handling with meaningful error messages

### 12.4 Usability
- Clean, minimal UI — no technical training required
- Consistent design language across all pages
- Mobile-responsive down to 375px width
- Loading spinners, empty states, confirmation dialogs everywhere

### 12.5 Data Integrity
- Foreign key constraints with appropriate ON DELETE behavior
- Unique constraints on SKU, email, order_number
- Stock quantity validated before every OUT transaction
- All mutations logged to activity_log

---

## 13. Success Metrics

| Metric | Target |
|--------|--------|
| Inventory accuracy improvement | 85% → 98%+ |
| Time to generate reports | Hours → Seconds |
| Stockout incidents | Reduced by 80% |
| Stock transaction traceability | 100% audit trail |
| User onboarding time | < 30 minutes |
| System uptime | 99.5%+ |

---

## 14. Future Scope (v2.0)

- Barcode/QR code scanning for products
- Multi-warehouse support
- Mobile app (React Native)
- Email/SMS alert notifications
- API integration with accounting software
- Warehouse floor plan visualization
- AI-powered demand forecasting
- Multi-language (i18n) support

---

*End of PRD — Stoxen v1.0*
