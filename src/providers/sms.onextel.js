// Real SMS via Onextel. Only loaded when SMS_PROVIDER=onextel.
//
// TODO: the exact request format comes from your Auth service's SMS code.
// Copy the HTTP call from there into send() below so both services behave the same.
// In India every transactional message needs its own DLT-approved template ID.
const { env } = require('../config/env');

module.exports = {
  name: 'onextel',
  // payload: { phone, message, templateId? }
  async send({ phone, message, templateId }) {
    const { apiKey, senderId, entityId, baseUrl } = env.sms;
    if (!apiKey || !senderId || !entityId || !baseUrl) {
      return { ok: false, error: 'Onextel SMS credentials are not configured' };
    }
    return {
      ok: false,
      error: `Onextel call not implemented yet (phone=${phone}, template=${templateId || env.sms.templateId})`,
    };
  },
};