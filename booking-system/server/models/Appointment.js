const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const recurringConfigSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    required: true
  },
  endDate: Date,
  occurrences: Number,
  groupId: String // All recurring appointments share this ID
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  bookingRef: {
    type: String,
    unique: true,
    default: () => `BK-${uuidv4().slice(0, 8).toUpperCase()}`
  },
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
  dateTime: {
    type: Date,
    required: [true, 'Appointment date and time is required']
  },
  endDateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'],
    default: 'pending'
  },
  notes: {
    client: String,
    provider: String,
    internal: String
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processed', 'failed'],
      default: 'none'
    }
  },
  reschedule: {
    originalDateTime: Date,
    rescheduledAt: Date,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  },
  payment: {
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'partial_refund', 'waived'],
      default: 'unpaid'
    },
    amount: Number,
    currency: { type: String, default: 'USD' },
    stripePaymentIntentId: String,
    paidAt: Date
  },
  reminders: {
    sent24h: { type: Boolean, default: false },
    sent1h: { type: Boolean, default: false },
    sent24hAt: Date,
    sent1hAt: Date
  },
  isRecurring: { type: Boolean, default: false },
  recurringConfig: recurringConfigSchema,
  recurringGroupId: String,
  noShow: { type: Boolean, default: false },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: Date
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: { type: String, default: 'web' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
appointmentSchema.index({ client: 1, dateTime: -1 });
appointmentSchema.index({ provider: 1, dateTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ bookingRef: 1 }, { unique: true });
appointmentSchema.index({ recurringGroupId: 1 });
appointmentSchema.index({ 'reminders.sent24h': 1, 'reminders.sent1h': 1 });

// Compound index for availability checking
appointmentSchema.index({ provider: 1, dateTime: 1, status: 1 });

// Virtual for duration
appointmentSchema.virtual('durationMinutes').get(function() {
  if (this.endDateTime && this.dateTime) {
    return Math.round((this.endDateTime - this.dateTime) / 60000);
  }
  return null;
});

// Static: Get provider's booked slots for a date range
appointmentSchema.statics.getBookedSlots = async function(providerId, startDate, endDate) {
  return await this.find({
    provider: providerId,
    dateTime: { $gte: startDate, $lte: endDate },
    status: { $in: ['pending', 'confirmed'] }
  }).select('dateTime endDateTime status service').populate('service', 'name duration bufferTime');
};

// Static: Check for conflicts
appointmentSchema.statics.hasConflict = async function(providerId, startTime, endTime, excludeId = null) {
  const query = {
    provider: providerId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { dateTime: { $lt: endTime }, endDateTime: { $gt: startTime } }
    ]
  };
  if (excludeId) query._id = { $ne: excludeId };
  
  const conflict = await this.findOne(query);
  return !!conflict;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
