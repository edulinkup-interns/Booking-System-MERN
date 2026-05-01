const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: String,
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  price: {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'free'],
      default: 'fixed'
    }
  },
  maxParticipants: {
    type: Number,
    default: 1,
    min: 1
  },
  isGroupSession: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  // Override provider availability for this specific service
  customAvailability: {
    enabled: { type: Boolean, default: false },
    slots: [{
      dayOfWeek: Number,
      startTime: String,
      endTime: String
    }]
  },
  // Recurrence options
  allowRecurring: {
    type: Boolean,
    default: false
  },
  tags: [String],
  imageUrl: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

serviceSchema.index({ provider: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ 'price.amount': 1 });

module.exports = mongoose.model('Service', serviceSchema);
