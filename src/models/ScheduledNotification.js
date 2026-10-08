const mongoose = require('mongoose');

const scheduledSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    contact: {
      phone: String,
      email: String,
    },
    runAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
      default: 'pending',
    },
    error: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

scheduledSchema.index({ status: 1, runAt: 1 });

module.exports = mongoose.model('ScheduledNotification', scheduledSchema);