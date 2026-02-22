/**
 * Stoxen — Backend Helper Utilities
 */

/**
 * Format currency value.
 */
const formatCurrency = (value, currency = '₹') => {
  const num = parseFloat(value) || 0;
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Generate SKU code.
 */
const generateSKU = (prefix = 'STX') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate order number.
 */
const generateOrderNumber = (type, counter) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = type === 'purchase' ? 'PO' : 'DO';
  const num = String(counter).padStart(3, '0');
  return `${prefix}-${dateStr}-${num}`;
};

/**
 * Calculate stock status.
 */
const getStockStatus = (currentQty, minThreshold) => {
  const qty = parseFloat(currentQty) || 0;
  const threshold = parseFloat(minThreshold) || 0;

  if (qty === 0) return 'out_of_stock';
  if (qty <= threshold) return 'low_stock';
  return 'in_stock';
};

/**
 * Paginate query results.
 */
const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (p - 1) * l;
  return { limit: l, offset, page: p };
};

/**
 * Build pagination response.
 */
const paginationResponse = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Safe parse JSON.
 */
const safeParseJSON = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

module.exports = {
  formatCurrency,
  generateSKU,
  generateOrderNumber,
  getStockStatus,
  paginate,
  paginationResponse,
  safeParseJSON,
};
