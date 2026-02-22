const db = require('../config/db');

/**
 * Activity logger middleware.
 * Logs every successful POST/PUT/PATCH/DELETE to activity_log table.
 * Must be used AFTER authenticate middleware.
 */
const activityLogger = (module) => {
  return (req, res, next) => {
    // Only log mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Store original res.json to intercept after success
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Only log on successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const action = `${req.method} ${req.originalUrl}`;
        const userId = req.user?.id;

        if (userId) {
          const details = JSON.stringify({
            method: req.method,
            path: req.originalUrl,
            body: sanitizeBody(req.body),
            params: req.params,
          });

          db.execute(
            'INSERT INTO activity_log (user_id, action, module, details) VALUES (?, ?, ?, ?)',
            [userId, action, module, details]
          ).catch(err => {
            console.error('Activity log error:', err.message);
          });
        }
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Remove sensitive fields from logged body.
 */
function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.token;
  return sanitized;
}

module.exports = activityLogger;
