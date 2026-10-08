const DeviceToken = require('../models/DeviceToken');
const { asyncHandler, badRequest } = require('../middleware/errorHandler');

// Called by the app after login and whenever FCM rotates the token.
exports.register = asyncHandler(async (req, res) => {
  const { token, platform, deviceId, appVersion } = req.body;
  if (!token || typeof token !== 'string') throw badRequest('token is required');
  if (!['android', 'ios'].includes(platform)) throw badRequest('platform must be android or ios');

  // A token belongs to one user at a time: re-assign if another account used this phone before.
  const device = await DeviceToken.findOneAndUpdate(
    { token },
    { $set: { userId: req.user.id, platform, deviceId, appVersion, lastSeenAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ success: true, data: device });
});

// Called on logout so the phone stops receiving this user's pushes.
exports.unregister = asyncHandler(async (req, res) => {
  await DeviceToken.deleteOne({ token: req.params.token, userId: req.user.id });
  res.json({ success: true, message: 'Device removed' });
});