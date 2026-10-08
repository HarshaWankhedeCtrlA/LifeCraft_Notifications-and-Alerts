const Preference = require('../models/Preference');
const { env } = require('../config/env');

async function getPreferences(userId) {
  let prefs = await Preference.findOne({ userId });
  if (!prefs) {
    prefs = await Preference.create({
      userId,
      quietHours: { timezone: env.defaultTimezone },
    });
  }
  return prefs;
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isInQuietHours(prefs, now = new Date()) {
  const q = prefs.quietHours;
  if (!q || !q.enabled) return false;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: q.timezone || env.defaultTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const m = Number(parts.find((p) => p.type === 'minute').value);
  const cur = h * 60 + m;
  const start = toMinutes(q.start);
  const end = toMinutes(q.end);
  // window may wrap past midnight (22:00 -> 07:00)
  return start <= end ? cur >= start && cur < end : cur >= start || cur < end;
}

// Returns { allowed: boolean, reason?: string }
function checkChannel(prefs, channel, type, { critical = false } = {}) {
  if (critical) return { allowed: true };
  if (prefs.mutedTypes.includes(type)) return { allowed: false, reason: 'type muted by user' };
  if (prefs.channels[channel] === false) return { allowed: false, reason: `${channel} disabled by user` };
  // quiet hours only silence interruptive channels; inbox still fills
  if ((channel === 'push' || channel === 'sms') && isInQuietHours(prefs)) {
    return { allowed: false, reason: 'quiet hours' };
  }
  return { allowed: true };
}

module.exports = { getPreferences, checkChannel, isInQuietHours };