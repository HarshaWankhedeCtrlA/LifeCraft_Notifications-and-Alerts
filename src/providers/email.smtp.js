// Real email via SMTP. Only loaded when EMAIL_PROVIDER=smtp.
const { env } = require('../config/env');

let transporter;
function init() {
  if (transporter) return transporter;
  const { host, port, user, pass } = env.smtp;
  if (!host || !user || !pass) throw new Error('SMTP credentials are not configured');
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  return transporter;
}

module.exports = {
  name: 'smtp',
  // payload: { to, subject, text }
  async send({ to, subject, text }) {
    try {
      await init().sendMail({ from: env.smtp.from || env.smtp.user, to, subject, text });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
};