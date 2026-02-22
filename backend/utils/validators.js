/**
 * Stoxen — Backend Validators
 */

/**
 * Validate email format.
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate positive number.
 */
const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate non-negative number.
 */
const isNonNegativeNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate required fields in a request body.
 * Returns array of missing field names.
 */
const validateRequired = (body, fields) => {
  const missing = [];
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field);
    }
  }
  return missing;
};

/**
 * Validate SKU format: alphanumeric with dashes.
 */
const isValidSKU = (sku) => {
  return /^[A-Za-z0-9-]+$/.test(sku);
};

/**
 * Validate password strength.
 */
const isStrongPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Validate date format (YYYY-MM-DD).
 */
const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Sanitize string — trim and prevent XSS basics.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

module.exports = {
  isValidEmail,
  isPositiveNumber,
  isNonNegativeNumber,
  validateRequired,
  isValidSKU,
  isStrongPassword,
  isValidDate,
  sanitizeString,
};
