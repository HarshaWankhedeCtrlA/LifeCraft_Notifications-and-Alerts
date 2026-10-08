const { dispatch } = require('../services/dispatcher');
const ScheduledNotification = require('../models/ScheduledNotification');
const { getTemplate } = require('../services/templates');
const { asyncHandler, badRequest } = require('../middleware/errorHandler');

// POST /internal/events  — other modules report "something happened"
// body: { userId | userIds[], type, data?, contact?, channels?, sendAt? }
exports.ingestEvent = asyncHandler(async (req, res) => {
  const { userId, userIds, type, data, contact, channels, sendAt } = req.body;

  if (!type || !getTemplate(type)) throw badRequest(`Unknown or missing type: ${type}`);
  const targets = userIds && userIds.length ? userIds : userId ? [userId] : [];
  if (!targets.length) throw badRequest('userId or userIds is required');
  if (targets.length > 1000) throw badRequest('Max 1000 userIds per call');

  // future-dated => hand to the scheduler instead of sending now
  if (sendAt) {
    const runAt = new Date(sendAt);
    if (isNaN(runAt.getTime())) throw badRequest('sendAt must be a valid ISO date');
    if (runAt > new Date()) {
      const docs = await ScheduledNotification.insertMany(
        targets.map((id) => ({ userId: String(id), type, data, contact, runAt }))
      );
      return res.status(202).json({ success: true, scheduled: docs.length, runAt });
    }
  }

  // Contact details only make sense for a single user.
  const results = [];
  for (const id of targets) {
    try {
      const r = await dispatch({ userId: String(id), type, data, contact: targets.length === 1 ? contact : {}, channels });
      results.push({ userId: String(id), ...r });
    } catch (err) {
      results.push({ userId: String(id), error: err.message });
    }
  }
  res.status(202).json({ success: true, processed: results.length, results: targets.length === 1 ? results : undefined });
});

// POST /internal/send — direct single send, e.g. OTP / transactional SMS from Auth
// body: { userId, type, data, contact }
exports.send = asyncHandler(async (req, res) => {
  const { userId, type, data, contact, channels } = req.body;
  if (!userId || !type) throw badRequest('userId and type are required');
  const result = await dispatch({ userId: String(userId), type, data, contact, channels });
  res.json({ success: true, data: result });
});