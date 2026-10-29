// backend/middleware/sanitizeMiddleware.js
// ─────────────────────────────────────────────────────────────
// Strips MongoDB operator keys (anything starting with "$") out of
// req.body and req.params before any controller sees them.
//
// Why: a client can send {"email": {"$ne": null}} instead of a string.
// Mongoose would pass that to MongoDB as an operator, not as text.
// ShopZone never legitimately receives "$" keys from a browser, so
// removing them is safe.
//
// It mutates in place (no reassigning req.query) so it works on both
// Express 4 and Express 5. Query-string values are handled separately
// in productController with String() coercion (ISS-093).
// ─────────────────────────────────────────────────────────────
const stripOperators = (value) => {
  if (Array.isArray(value)) {
    value.forEach(stripOperators);
  } else if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (key.startsWith('$')) {
        delete value[key];          // remove the operator key entirely
      } else {
        stripOperators(value[key]); // recurse into nested objects
      }
    });
  }
};

const sanitizeInput = (req, res, next) => {
  stripOperators(req.body);
  stripOperators(req.params);
  next();
};

module.exports = { sanitizeInput };