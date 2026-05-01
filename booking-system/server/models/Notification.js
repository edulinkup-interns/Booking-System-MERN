const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'appointment_booked', 'appointment_confirmed', 'appointment_cancelled',
      'appointment_rescheduled', 'appointment_reminder', 'appointment_completed',
      'waitlist_available', 'payment_received', 'payment_refunded',
      'provider_approved', 'review_request', 'system'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ appointment: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
