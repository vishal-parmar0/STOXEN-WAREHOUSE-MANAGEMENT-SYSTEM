export const ORDER_STATUSES = ['pending', 'approved', 'processing', 'completed', 'cancelled'];
export const TRANSACTION_TYPES = ['stock_in', 'stock_out', 'adjustment'];
export const USER_ROLES = ['admin', 'manager', 'staff'];
export const UNITS = ['pieces', 'kg', 'liters', 'meters', 'boxes', 'pallets', 'cartons', 'units'];

export const NAV_ITEMS = {
  main: [
    { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Inventory', icon: 'Package', path: '/inventory' },
    {
      label: 'Transactions', icon: 'ArrowLeftRight', path: '/transactions',
      children: [
        { label: 'History', path: '/transactions' },
        { label: 'Stock IN', path: '/transactions/stock-in' },
        { label: 'Stock OUT', path: '/transactions/stock-out' },
      ]
    },
    { label: 'Suppliers', icon: 'Truck', path: '/suppliers' },
    { label: 'Orders', icon: 'ClipboardList', path: '/orders' },
  ],
  management: [
    { label: 'Reports', icon: 'BarChart3', path: '/reports', roles: ['admin', 'manager'] },
    { label: 'Alerts', icon: 'Bell', path: '/alerts', badge: true },
  ],
  admin: [
    { label: 'Users', icon: 'Users', path: '/users', roles: ['admin'] },
    { label: 'Settings', icon: 'Settings', path: '/settings', roles: ['admin'] },
  ],
};
