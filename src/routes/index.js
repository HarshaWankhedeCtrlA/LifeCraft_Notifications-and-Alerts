const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { requireInternalKey } = require('../middleware/internalKey');
const { requireFields, validateObjectId } = require('../middleware/validate');
const notifications = require('../controllers/notificationController');
const devices = require('../controllers/deviceController');
const preferences = require('../controllers/preferenceController');
const internal = require('../controllers/internalController');
const admin = require('../controllers/adminController');

const router = express.Router();

// --- User: inbox -----------------------------------------------------------
router.get('/notifications', requireAuth, notifications.list);
router.get('/notifications/unread-count', requireAuth, notifications.unreadCount);
router.put('/notifications/read-all', requireAuth, notifications.markAllRead);
router.put('/notifications/:id/read', requireAuth, validateObjectId(), notifications.markRead);
router.delete('/notifications/:id', requireAuth, validateObjectId(), notifications.remove);

// --- User: devices ---------------------------------------------------------
router.post('/devices', requireAuth, requireFields('token', 'platform'), devices.register);
router.delete('/devices/:token', requireAuth, devices.unregister);

// --- User: preferences -----------------------------------------------------
router.get('/notification-preferences', requireAuth, preferences.get);
router.put('/notification-preferences', requireAuth, preferences.update);

// --- Service-to-service ----------------------------------------------------
router.post('/internal/events', requireInternalKey, internal.ingestEvent);
router.post('/internal/send', requireInternalKey, internal.send);

// --- Admin -----------------------------------------------------------------
router.post('/admin/scheduled', requireAuth, requireAdmin, admin.createScheduled);
router.get('/admin/scheduled', requireAuth, requireAdmin, admin.listScheduled);
router.delete('/admin/scheduled/:id', requireAuth, requireAdmin, validateObjectId(), admin.cancelScheduled);
router.get('/admin/delivery-logs', requireAuth, requireAdmin, admin.deliveryLogs);

module.exports = router;