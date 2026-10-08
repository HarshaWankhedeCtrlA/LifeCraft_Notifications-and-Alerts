require('dotenv').config();

const num = (v, d) => (v === undefined || v === '' || isNaN(Number(v)) ? d : Number(v));

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 5005),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigins: process.env.CORS_ORIGINS || '*',
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://puneet:VtTI8xsEzVJpa9Yn@cluster0.tuenz0l.mongodb.net/Lifecraft_Notifications?retryWrites=true&w=majority&appName=Cluster0',
  jwt: {
    secret: process.env.JWT_ACCESS_SECRET,
    issuer: process.env.JWT_ISSUER || undefined,
    audience: process.env.JWT_AUDIENCE || undefined,
  },
  internalApiKey: process.env.INTERNAL_API_KEY,
  providers: {
    push: process.env.PUSH_PROVIDER || 'mock',
    sms: process.env.SMS_PROVIDER || 'mock',
    email: process.env.EMAIL_PROVIDER || 'mock',
    whatsapp: process.env.WHATSAPP_PROVIDER || 'mock',
  },
  fcmServiceAccountPath: process.env.FCM_SERVICE_ACCOUNT_PATH,
  sms: {
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID,
    entityId: process.env.SMS_ENTITY_ID,
    templateId: process.env.SMS_TEMPLATE_ID,
    baseUrl: process.env.SMS_BASE_URL,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: num(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },
  scheduler: {
    enabled: process.env.SCHEDULER_ENABLED !== 'false',
    tickSeconds: num(process.env.SCHEDULER_TICK_SECONDS, 30),
  },
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata',
};

function validate() {
  const missing = [];
  if (!env.jwt.secret) missing.push('JWT_ACCESS_SECRET');
  if (!env.internalApiKey) missing.push('INTERNAL_API_KEY');
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

module.exports = { env, validate };