const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  preferredDates: [{
    date: Date,
    startTime: String,
    endTime: String
  }],
  status: {
    type: String,
    enum: ['waiting', 'notified', 'booked', 'expired', 'cancelled'],
    default: 'waiting'
  },
  position: Number,
  notifiedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  notes: String
}, {
  timestamps: true
});

waitlistSchema.index({ provider: 1, service: 1, status: 1 });
waitlistSchema.index({ client: 1 });
waitlistSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
