const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
    type: { type: String, required: true },
    channel: { type: String, enum: ['inApp', 'push', 'sms', 'email', 'whatsapp'], required: true },
    provider: { type: String },
    status: { type: String, enum: ['sent', 'failed', 'skipped'], required: true, index: true },
    reason: { type: String }, // why skipped / failed
    to: { type: String }, // phone / email / token count, for debugging
  },
  { timestamps: true }
);

deliveryLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DeliveryLog', deliveryLogSchema);