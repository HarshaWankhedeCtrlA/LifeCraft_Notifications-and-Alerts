const { env, validate } = require('./config/env');
const connectDB = require('./config/database');
const scheduler = require('./workers/scheduler');

async function main() {
  validate();
  await connectDB();
  const app = require('./app');
  const server = app.listen(env.port, () => {
    console.log(`[server] notifications listening on :${env.port}${env.apiPrefix} (${env.nodeEnv})`);
    console.log(`[server] providers: ${JSON.stringify(env.providers)}`);
  });
  scheduler.start();

  const shutdown = () => {
    scheduler.stop();
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[server] failed to start:', err.message);
  process.exit(1);
});