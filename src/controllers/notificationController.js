const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const filter = { userId: req.user.id };
  if (req.query.isRead === 'true') filter.isRead = true;
  if (req.query.isRead === 'false') filter.isRead = false;
  if (req.query.type) filter.type = req.query.type;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user.id, isRead: false }),
  ]);

  res.json({ success: true, data: items, pagination: { page, limit, total }, unreadCount });
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
  res.json({ success: true, data: { count } });
});

exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );
  if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: n });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const r = await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  res.json({ success: true, data: { updated: r.modifiedCount } });
});

exports.remove = asyncHandler(async (req, res) => {
  const r = await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
  if (!r.deletedCount) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, message: 'Deleted' });
});