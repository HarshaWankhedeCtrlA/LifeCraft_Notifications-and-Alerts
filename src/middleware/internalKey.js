const crypto = require('crypto');
const { env } = require('../config/env');

// For service-to-service calls (other LifeCraft modules -> Notifications).
function requireInternalKey(req, res, next) {
  const provided = String(req.headers['x-internal-api-key'] || '');
  const expected = String(env.internalApiKey || '');
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ success: false, message: 'Invalid internal API key' });
  }
  next();
}

module.exports = { requireInternalKey };