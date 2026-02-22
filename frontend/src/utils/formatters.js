export const formatCurrency = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Number(value).toFixed(2)}`;
};

export const formatNumber = (num) => {
  return Number(num).toLocaleString('en-IN');
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getStockStatus = (qty, threshold) => {
  if (qty <= 0) return { label: 'Out of Stock', type: 'out_of_stock' };
  if (qty <= threshold) return { label: 'Low Stock', type: 'low_stock' };
  return { label: 'In Stock', type: 'in_stock' };
};

export const getTransactionTypeInfo = (type) => {
  const map = {
    stock_in: { label: '↑ Stock IN', badge: 'stock_in', sign: '+', color: 'text-green-500' },
    stock_out: { label: '↓ Stock OUT', badge: 'stock_out', sign: '-', color: 'text-red-500' },
    adjustment: { label: '~ Adjustment', badge: 'adjustment', sign: '±', color: 'text-amber-500' },
  };
  return map[type] || map.adjustment;
};
