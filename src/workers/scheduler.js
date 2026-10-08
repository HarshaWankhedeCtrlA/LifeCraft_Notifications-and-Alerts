const ScheduledNotification = require('../models/ScheduledNotification');
const { dispatch } = require('../services/dispatcher');
const { env } = require('../config/env');

let timer;
let running = false;

async function tick() {
  if (running) return; // don't overlap with a slow previous tick
  running = true;
  try {
     console.log('[scheduler] tick at', new Date().toISOString());
    // Claim jobs one at a time so two instances never send the same reminder.
    for (;;) {
      const job = await ScheduledNotification.findOneAndUpdate(
        { status: 'pending', runAt: { $lte: new Date() } },
        { $set: { status: 'processing' } },
        { sort: { runAt: 1 }, new: true }
      );
      if (!job) break;
       console.log('[scheduler] picked job', job._id.toString()); 
      try {
        await dispatch({ userId: job.userId, type: job.type, data: job.data, contact: job.contact || {} });
        job.status = 'sent';
      } catch (err) {
        job.status = 'failed';
        job.error = err.message;
      }
      job.processedAt = new Date();
      await job.save();
    }
  } catch (err) {
    console.error('[scheduler] tick error:', err.message);
  } finally {
    running = false;
  }
}

function start() {
  if (!env.scheduler.enabled) {
    console.log('[scheduler] disabled');
    return;
  }
  timer = setInterval(tick, env.scheduler.tickSeconds * 1000);
  console.log(`[scheduler] running every ${env.scheduler.tickSeconds}s`);
}

function stop() {
  if (timer) clearInterval(timer);
}

module.exports = { start, stop, tick };