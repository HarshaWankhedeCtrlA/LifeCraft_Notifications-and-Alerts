// Real push via Firebase Cloud Messaging. Only loaded when PUSH_PROVIDER=fcm.
const { getMessaging } = require('../config/firebase');

module.exports = {
  name: 'fcm',
  // payload: { tokens: string[], title, body, data }
  async send({ tokens, title, body, data = {} }) {
    try {
      const stringData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
      );
      const res = await getMessaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: stringData,
      });
      const invalidTokens = [];
      res.responses.forEach((r, i) => {
        const code = r.error && r.error.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(tokens[i]);
        }
      });
      return { ok: res.successCount > 0, invalidTokens, error: res.successCount ? undefined : 'all sends failed' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
};