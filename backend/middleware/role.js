/**
 * Role-based access control middleware.
 * Must be used AFTER authenticate middleware.
 */

/**
 * Only admin users allowed.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: true,
      message: 'Forbidden. Admin access required.',
    });
  }
  next();
};

/**
 * Admin or manager users allowed.
 */
const requireManager = (req, res, next) => {
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      error: true,
      message: 'Forbidden. Manager or admin access required.',
    });
  }
  next();
};

/**
 * Generic role check — accepts array of allowed roles.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: `Forbidden. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = { requireAdmin, requireManager, requireRole };
