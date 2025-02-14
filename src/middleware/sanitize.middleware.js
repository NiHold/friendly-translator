import pkg from "validator";

const { escape } = pkg;
/**
 * Recursively sanitizes all string values in an object or array.
 * For strings, we trim whitespace and escape HTML characters.
 */
function sanitizeValue(value) {
  if (typeof value === "string") {
    return escape(value.trim());
  } else if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  } else if (value !== null && typeof value === "object") {
    const sanitized = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }
  return value;
}

/**
 * Global sanitation middleware that processes:
 * - req.body
 * - req.query
 * - req.params
 *
 * It escapes any string data to ensure no HTML or harmful code is stored or processed.
 */
export function sanitize(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
}
