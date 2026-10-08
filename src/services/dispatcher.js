const Notification = require('../models/Notification');
const DeviceToken = require('../models/DeviceToken');
const DeliveryLog = require('../models/DeliveryLog');
const { getProvider } = require('../providers');
const { getTemplate, render } = require('./templates');
const { getPreferences, checkChannel } = require('./preferenceService');

async function log(entry) {
  try {
    await DeliveryLog.create(entry);
  } catch (err) {
    console.error('[dispatcher] failed to write delivery log:', err.message);
  }
}

/**
 * Deliver one notification event to one user.
 *
 * @param {object} event
 * @param {string} event.userId
 * @param {string} event.type      key from templates.js
 * @param {object} [event.data]    values for placeholders + extra payload for the app
 * @param {object} [event.contact] { phone, email } needed for sms / email channels
 * @param {string[]} [event.channels] override the template's default channels
 */
async function dispatch({ userId, type, data = {}, contact = {}, channels }) {
  const template = getTemplate(type);
  if (!template) {
    const err = new Error(`Unknown notification type: ${type}`);
    err.status = 400;
    throw err;
  }

  const title = render(template.title, data);
  const body = render(template.body, data);
  const critical = !!template.critical;
  const wanted = channels && channels.length ? channels : template.channels;
  const prefs = await getPreferences(userId);

  const results = {};
  let notification = null;

  // 1. In-app inbox
  if (wanted.includes('inApp')) {
    const gate = checkChannel(prefs, 'inApp', type, { critical });
    if (gate.allowed) {
      notification = await Notification.create({ userId, type, title, body, data });
      results.inApp = 'sent';
      await log({ userId, notificationId: notification._id, type, channel: 'inApp', provider: 'internal', status: 'sent' });
    } else {
      results.inApp = 'skipped';
      await log({ userId, type, channel: 'inApp', status: 'skipped', reason: gate.reason });
    }
  }

  // 2. Outbound channels
  for (const channel of wanted.filter((c) => c !== 'inApp')) {
    const base = { userId, notificationId: notification && notification._id, type, channel };
    const gate = checkChannel(prefs, channel, type, { critical });
    if (!gate.allowed) {
      results[channel] = 'skipped';
      await log({ ...base, status: 'skipped', reason: gate.reason });
      continue;
    }

    try {
      const provider = getProvider(channel);
      let res;
      let to;

      if (channel === 'push') {
        const devices = await DeviceToken.find({ userId });
        if (!devices.length) {
          results.push = 'skipped';
          await log({ ...base, provider: provider.name, status: 'skipped', reason: 'no registered devices' });
          continue;
        }
        const tokens = devices.map((d) => d.token);
        to = `${tokens.length} device(s)`;
        res = await provider.send({ tokens, title, body, data: { type, ...data } });
        if (res.invalidTokens && res.invalidTokens.length) {
          await DeviceToken.deleteMany({ token: { $in: res.invalidTokens } });
        }
      } else if (channel === 'sms') {
        if (!contact.phone) {
          results.sms = 'skipped';
          await log({ ...base, provider: provider.name, status: 'skipped', reason: 'no phone number in event' });
          continue;
        }
        to = contact.phone;
        res = await provider.send({ phone: contact.phone, message: body, templateId: data.templateId });
      } else if (channel === 'email') {
        if (!contact.email) {
          results.email = 'skipped';
          await log({ ...base, provider: provider.name, status: 'skipped', reason: 'no email in event' });
          continue;
        }
        to = contact.email;
        res = await provider.send({ to: contact.email, subject: title, text: body });
      } else {
        res = await provider.send({ userId, title, body, data });
      }

      results[channel] = res.ok ? 'sent' : 'failed';
      await log({
        ...base,
        to,
        provider: provider.name,
        status: res.ok ? 'sent' : 'failed',
        reason: res.ok ? undefined : res.error,
      });
    } catch (err) {
      results[channel] = 'failed';
      await log({ ...base, status: 'failed', reason: err.message });
    }
  }

  return { notificationId: notification && notification._id, results };
}

module.exports = { dispatch };