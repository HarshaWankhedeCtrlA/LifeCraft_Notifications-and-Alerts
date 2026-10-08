const { getPreferences } = require('../services/preferenceService');
const { templates } = require('../services/templates');
const { asyncHandler, badRequest } = require('../middleware/errorHandler');

const CHANNELS = ['inApp', 'push', 'sms', 'email', 'whatsapp'];
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

exports.get = asyncHandler(async (req, res) => {
  const prefs = await getPreferences(req.user.id);
  res.json({
    success: true,
    data: {
      channels: prefs.channels,
      mutedTypes: prefs.mutedTypes,
      quietHours: prefs.quietHours,
      // lets the app render a per-type toggle list (critical types are not user-controllable)
      availableTypes: Object.entries(templates)
        .filter(([, t]) => !t.critical)
        .map(([type, t]) => ({ type, title: t.title })),
    },
  });
});

exports.update = asyncHandler(async (req, res) => {
  const { channels, mutedTypes, quietHours } = req.body;
  const prefs = await getPreferences(req.user.id);

  if (channels !== undefined) {
    if (typeof channels !== 'object' || channels === null) throw badRequest('channels must be an object');
    for (const [key, value] of Object.entries(channels)) {
      if (!CHANNELS.includes(key)) throw badRequest(`Unknown channel: ${key}`);
      if (typeof value !== 'boolean') throw badRequest(`channels.${key} must be true or false`);
      prefs.channels[key] = value;
    }
  }

  if (mutedTypes !== undefined) {
    if (!Array.isArray(mutedTypes)) throw badRequest('mutedTypes must be an array');
    const bad = mutedTypes.find((t) => !templates[t] || templates[t].critical);
    if (bad) throw badRequest(`Cannot mute type: ${bad}`);
    prefs.mutedTypes = [...new Set(mutedTypes)];
  }

  if (quietHours !== undefined) {
    const { enabled, start, end, timezone } = quietHours || {};
    if (enabled !== undefined) prefs.quietHours.enabled = !!enabled;
    if (start !== undefined) {
      if (!HHMM.test(start)) throw badRequest('quietHours.start must be HH:mm');
      prefs.quietHours.start = start;
    }
    if (end !== undefined) {
      if (!HHMM.test(end)) throw badRequest('quietHours.end must be HH:mm');
      prefs.quietHours.end = end;
    }
    if (timezone !== undefined) {
      try {
        new Intl.DateTimeFormat('en', { timeZone: timezone });
      } catch (e) {
        throw badRequest('quietHours.timezone is not a valid IANA timezone');
      }
      prefs.quietHours.timezone = timezone;
    }
  }

  await prefs.save();
  res.json({ success: true, data: { channels: prefs.channels, mutedTypes: prefs.mutedTypes, quietHours: prefs.quietHours } });
});