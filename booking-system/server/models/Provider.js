const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0=Sunday, 1=Monday, ..., 6=Saturday
    required: true,
    min: 0,
    max: 6
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "17:00"
  isAvailable: { type: Boolean, default: true }
}, { _id: false });

const blockedDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  reason: String,
  isFullDay: { type: Boolean, default: true },
  startTime: String,
  endTime: String
}, { _id: true });

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Healthcare', 'Beauty & Wellness', 'Fitness', 'Education & Tutoring',
      'Legal', 'Financial', 'Consulting', 'Home Services', 'Photography',
      'Events', 'Pet Services', 'Technology', 'Other'
    ]
  },
  specializations: [String],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contactInfo: {
    phone: String,
    website: String,
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String
    }
  },
  // Weekly recurring availability
  weeklyAvailability: [availabilitySlotSchema],
  // Specific blocked dates/times
  blockedDates: [blockedDateSchema],
  // Buffer time between appointments (minutes)
  bufferTime: {
    type: Number,
    default: 15,
    min: 0,
    max: 120
  },
  // Max appointments per day
  maxAppointmentsPerDay: {
    type: Number,
    default: 10
  },
  // Lead time required to book (hours)
  minimumBookingLeadTime: {
    type: Number,
    default: 1
  },
  // How far in advance clients can book (days)
  maximumBookingAdvanceDays: {
    type: Number,
    default: 90
  },
  // Cancellation policy
  cancellationPolicy: {
    hoursBeforeNoFee: { type: Number, default: 24 },
    percentageFee: { type: Number, default: 0 },
    description: String
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  stripeAccountId: String,
  paymentEnabled: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

providerSchema.index({ user: 1 });
providerSchema.index({ category: 1 });
providerSchema.index({ isActive: 1 });
providerSchema.index({ 'location.city': 1 });
providerSchema.index({ 'rating.average': -1 });

// Virtual for services
providerSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'provider'
});

// Method to check if provider is available at a specific datetime
providerSchema.methods.isAvailableAt = function(dateTime, durationMinutes) {
  const date = new Date(dateTime);
  const dayOfWeek = date.getDay();
  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  // Check weekly availability
  const daySlot = this.weeklyAvailability.find(
    slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable
  );
  if (!daySlot) return false;

  // Check time range
  if (timeStr < daySlot.startTime) return false;
  
  const endTime = new Date(dateTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes + this.bufferTime);
  const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
  if (endTimeStr > daySlot.endTime) return false;

  // Check blocked dates
  const dateOnly = date.toISOString().split('T')[0];
  const isBlocked = this.blockedDates.some(blocked => {
    const blockedDate = new Date(blocked.date).toISOString().split('T')[0];
    if (blockedDate !== dateOnly) return false;
    if (blocked.isFullDay) return true;
    return timeStr >= blocked.startTime && timeStr <= blocked.endTime;
  });

  return !isBlocked;
};

module.exports = mongoose.model('Provider', providerSchema);
