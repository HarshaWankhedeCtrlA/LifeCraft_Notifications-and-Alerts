const { env } = require('../config/env');

// Every provider exposes: async send(payload) -> { ok: boolean, error?: string }
// Real providers are required lazily so missing optional packages never break mock mode.

function mockProvider(channel) {
  return {
    name: 'mock',
    async send(payload) {
      console.log(`[mock:${channel}]`, JSON.stringify(payload));
      return { ok: true };
    },
  };
}

function load(channel) {
  const choice = env.providers[channel];
  if (choice === 'mock') return mockProvider(channel);

  switch (`${channel}:${choice}`) {
    case 'push:fcm':
      return require('./push.fcm');
    case 'sms:onextel':
      return require('./sms.onextel');
    case 'email:smtp':
      return require('./email.smtp');
          case 'whatsapp:stub':
      return require('./whatsapp.stub');
    default:
      throw new Error(`Unknown provider "${choice}" for channel "${channel}"`);
  }
}

const cache = {};
function getProvider(channel) {
  if (!cache[channel]) cache[channel] = load(channel);
  return cache[channel];
}

module.exports = { getProvider };