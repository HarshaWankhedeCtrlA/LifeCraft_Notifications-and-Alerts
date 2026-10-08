const fs = require('fs');
const { env } = require('./env');

let messaging;

// Lazy: Firebase is only initialised the first time a real push is sent.
function getMessaging() {
  if (messaging) return messaging;
  if (!env.fcmServiceAccountPath) {
    throw new Error('FCM_SERVICE_ACCOUNT_PATH is not set');
  }
  const admin = require('firebase-admin');
  const creds = JSON.parse(fs.readFileSync(env.fcmServiceAccountPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(creds) });
  messaging = admin.messaging();
  return messaging;
}

module.exports = { getMessaging };