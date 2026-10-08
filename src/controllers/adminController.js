const ScheduledNotification = require('../models/ScheduledNotification');
const DeliveryLog = require('../models/DeliveryLog');
const { getTemplate } = require('../services/templates');
const { asyncHandler, badRequest } = require('../middleware/errorHandler');

function paging(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit };
}

exports.createScheduled = asyncHandler(async (req, res) => {
  const { userId, userIds, type, data, contact, runAt } = req.body;
  if (!type || !getTemplate(type)) throw badRequest(`Unknown or missing type: ${type}`);
  const when = new Date(runAt);
  if (!runAt || isNaN(when.getTime())) throw badRequest('runAt must be a valid ISO date');
  if (when <= new Date()) throw badRequest('runAt must be in the future');
  const targets = userIds && userIds.length ? userIds : userId ? [userId] : [];
  if (!targets.length) throw badRequest('userId or userIds is required');

  const docs = await ScheduledNotification.insertMany(
    targets.map((id) => ({ userId: String(id), type, data, contact: targets.length === 1 ? contact : undefined, runAt: when }))
  );
  res.status(201).json({ success: true, data: { created: docs.length, runAt: when } });
});

exports.listScheduled = asyncHandler(async (req, res) => {
  const { page, limit } = paging(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    ScheduledNotification.find(filter).sort({ runAt: -1 }).skip((page - 1) * limit).limit(limit),
    ScheduledNotification.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total } });
});

exports.cancelScheduled = asyncHandler(async (req, res) => {
  const job = await ScheduledNotification.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    { $set: { status: 'cancelled' } },
    { new: true }
  );
  if (!job) return res.status(404).json({ success: false, message: 'No pending scheduled notification with that id' });
  res.json({ success: true, data: job });
});

exports.deliveryLogs = asyncHandler(async (req, res) => {
  const { page, limit } = paging(req.query);
  const filter = {};
  for (const key of ['channel', 'status', 'type', 'userId']) {
    if (req.query[key]) filter[key] = req.query[key];
  }
  const [items, total] = await Promise.all([
    DeliveryLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    DeliveryLog.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total } });
});