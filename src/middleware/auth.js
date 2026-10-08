const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Missing bearer token' });
  }

  try {
    const options = {};
    if (env.jwt.issuer) options.issuer = env.jwt.issuer;
    if (env.jwt.audience) options.audience = env.jwt.audience;

    const payload = jwt.verify(token, env.jwt.secret, options);

    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token has no user id' });
    }

    // Auth service issues `roles` as an array (e.g. ['member','admin']).
    // Fall back to `role` if a legacy token is encountered.
    const roles = Array.isArray(payload.roles)
      ? payload.roles
      : (payload.role ? [payload.role] : []);

    req.user = {
      id: String(userId),
      email: payload.email || null,
      roles,                          // ← ARRAY
      role: roles[0] || 'user',       // ← first role for convenience
      sessionId: payload.sid || null,
      raw: payload
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  const roles = (req.user && req.user.roles) || [];
  const role = String((req.user && req.user.role) || '').toLowerCase();

  const devAdmins = (process.env.DEV_ADMINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isAdmin =
    roles.map((r) => String(r).toLowerCase()).includes('admin') ||
    roles.map((r) => String(r).toLowerCase()).includes('superadmin') ||
    role === 'admin' ||
    role === 'superadmin' ||
    devAdmins.includes(req.user && req.user.id);

  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };