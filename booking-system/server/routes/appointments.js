const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Waitlist = require('../models/Waitlist');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');
const { protect, authorize } = require('../middleware/auth');
 
// @GET /api/appointments - Get user's appointments
router.get('/', protect, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};
 
    if (req.user.role === 'client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ user: req.user._id });
      if (!provider) return res.json({ success: true, data: { appointments: [], total: 0 } });
      filter.provider = provider._id;
    }
 
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }
 
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ dateTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('client', 'name email phone avatar')
        .populate('service', 'name duration price color')
        .populate({ path: 'provider', populate: { path: 'user', select: 'name email' } }),
      Appointment.countDocuments(filter)
    ]);
 
    res.json({
      success: true,
      data: {
        appointments,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get appointments error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});
 
// @GET /api/appointments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'name email phone avatar')
      .populate('service', 'name duration price color description')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name email phone' } });
 
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
 
    const isClient = appointment.client?._id?.toString() === req.user._id.toString();
    const provider = await Provider.findOne({ user: req.user._id });
    const isProvider = provider && appointment.provider?._id?.toString() === provider._id.toString();
    const isAdmin = req.user.role === 'admin';
 
    if (!isClient && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointment' });
  }
});
 
// @POST /api/appointments - Book appointment
router.post('/', protect, async (req, res) => {
  try {
    console.log('=== BOOKING REQUEST ===');
    console.log('Body:', JSON.stringify(req.body));
    console.log('User:', req.user._id, req.user.role);
 
    const { serviceId, providerId, dateTime, notes, recurring, participants = 1 } = req.body;
 
    // Validate required fields
    if (!serviceId) {
      return res.status(400).json({ success: false, message: 'serviceId is required' });
    }
    if (!providerId) {
      return res.status(400).json({ success: false, message: 'providerId is required' });
    }
    if (!dateTime) {
      return res.status(400).json({ success: false, message: 'dateTime is required' });
    }
 
    // Fetch service and provider
    const [service, provider] = await Promise.all([
      Service.findById(serviceId),
      Provider.findById(providerId)
    ]);
 
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive' });
    }
    if (!provider || !provider.isActive) {
      return res.status(404).json({ success: false, message: 'Provider not found or inactive' });
    }
 
    // Parse datetime
    const startTime = new Date(dateTime);
    if (isNaN(startTime.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid dateTime format' });
    }
 
    const endTime = new Date(startTime.getTime() + service.duration * 60000);
 
    console.log('Start time:', startTime);
    console.log('End time:', endTime);
 
    // Check for conflicts
    const conflict = await Appointment.findOne({
      provider: provider._id,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { dateTime: { $lt: endTime }, endDateTime: { $gt: startTime } }
      ]
    });
 
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }
 
    // Determine status
    const status = service.requiresApproval ? 'pending' : 'confirmed';
 
    // Create appointment
    const appointment = await Appointment.create({
      client: req.user._id,
      provider: provider._id,
      service: serviceId,
      dateTime: startTime,
      endDateTime: endTime,
      status,
      notes: notes ? { client: notes } : {},
      payment: {
        status: service.price?.amount > 0 ? 'unpaid' : 'waived',
        amount: service.price?.amount || 0,
        currency: service.price?.currency || 'USD'
      },
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        source: 'web'
      }
    });
 
    console.log('Appointment created:', appointment._id, appointment.bookingRef);
 
    // Handle recurring bookings
    if (recurring && recurring.frequency) {
      const recurringGroupId = appointment._id.toString();
      await Appointment.findByIdAndUpdate(appointment._id, {
        recurringGroupId,
        isRecurring: true,
        recurringConfig: recurring
      });
 
      const dates = generateRecurringDates(startTime, recurring);
      if (dates.length > 0) {
        const recurringAppointments = dates.map(date => ({
          client: req.user._id,
          provider: provider._id,
          service: serviceId,
          dateTime: date,
          endDateTime: new Date(date.getTime() + service.duration * 60000),
          status,
          isRecurring: true,
          recurringGroupId,
          recurringConfig: recurring,
          notes: notes ? { client: notes } : {},
          payment: {
            status: service.price?.amount > 0 ? 'unpaid' : 'waived',
            amount: service.price?.amount || 0
          }
        }));
        await Appointment.insertMany(recurringAppointments);
      }
    }
 
    // Send notifications
    try {
      const clientUser = await User.findById(req.user._id);
      const providerUser = await User.findById(provider.user);
 
      // Create in-app notifications
      await Promise.all([
        Notification.create({
          user: req.user._id,
          type: 'appointment_booked',
          title: 'Appointment Booked',
          message: `Your appointment for ${service.name} has been ${status}.`,
          appointment: appointment._id
        }),
        Notification.create({
          user: provider.user,
          type: 'appointment_booked',
          title: 'New Appointment',
          message: `New booking from ${clientUser?.name} for ${service.name}.`,
          appointment: appointment._id
        })
      ]);
 
      // Send confirmation email
      if (clientUser) {
        await emailService.sendBookingConfirmation({
          to: clientUser.email,
          clientName: clientUser.name,
          appointment,
          service,
          provider
        });
      }
    } catch (notifError) {
      console.error('Notification error (non-fatal):', notifError.message);
    }
 
    // Return populated appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'name email')
      .populate('service', 'name duration price')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name email' } });
 
    console.log('=== BOOKING SUCCESS ===');
    res.status(201).json({ success: true, data: populatedAppointment });
 
  } catch (error) {
    console.error('Book appointment error:', error);
    logger.error(`Book appointment error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Failed to book appointment' });
  }
});
 
// @PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service', 'name')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name' } });
 
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
 
    const isClient = appointment.client.toString() === req.user._id.toString();
    const provider = await Provider.findOne({ user: req.user._id });
    const isProvider = provider && appointment.provider._id.toString() === provider._id.toString();
 
    if (!isClient && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status} appointment` });
    }
 
    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
      reason: req.body.reason
    };
    await appointment.save();
 
    // Send cancellation email
    try {
      const clientUser = await User.findById(appointment.client);
      if (clientUser) {
        await emailService.sendCancellationEmail({
          to: clientUser.email,
          clientName: clientUser.name,
          appointment,
          service: appointment.service,
          reason: req.body.reason
        });
      }
    } catch (emailError) {
      console.error('Email error (non-fatal):', emailError.message);
    }
 
    // Notify waitlist
    try {
      await notifyWaitlist(appointment.provider._id, appointment.service._id, appointment.dateTime);
    } catch (waitlistError) {
      console.error('Waitlist error (non-fatal):', waitlistError.message);
    }
 
    res.json({ success: true, data: appointment, message: 'Appointment cancelled' });
  } catch (error) {
    logger.error(`Cancel appointment error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
  }
});
 
// @PATCH /api/appointments/:id/reschedule
router.patch('/:id/reschedule', protect, async (req, res) => {
  try {
    const { dateTime, reason } = req.body;
 
    if (!dateTime) {
      return res.status(400).json({ success: false, message: 'New dateTime is required' });
    }
 
    const appointment = await Appointment.findById(req.params.id).populate('service');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
 
    const isClient = appointment.client.toString() === req.user._id.toString();
    const providerDoc = await Provider.findOne({ user: req.user._id });
    const isProvider = providerDoc && appointment.provider.toString() === providerDoc._id.toString();
 
    if (!isClient && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    const newStart = new Date(dateTime);
    const newEnd = new Date(newStart.getTime() + appointment.service.duration * 60000);
 
    // Check conflicts
    const conflict = await Appointment.findOne({
      provider: appointment.provider,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: appointment._id },
      $or: [{ dateTime: { $lt: newEnd }, endDateTime: { $gt: newStart } }]
    });
 
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }
 
    const oldDateTime = appointment.dateTime;
    appointment.reschedule = {
      originalDateTime: oldDateTime,
      rescheduledAt: new Date(),
      rescheduledBy: req.user._id,
      reason
    };
    appointment.dateTime = newStart;
    appointment.endDateTime = newEnd;
    appointment.status = 'confirmed';
    await appointment.save();
 
    // Send reschedule email
    try {
      const clientUser = await User.findById(appointment.client);
      if (clientUser) {
        await emailService.sendRescheduleEmail({
          to: clientUser.email,
          clientName: clientUser.name,
          appointment,
          service: appointment.service,
          oldDateTime
        });
      }
    } catch (emailError) {
      console.error('Email error (non-fatal):', emailError.message);
    }
 
    res.json({ success: true, data: appointment, message: 'Appointment rescheduled' });
  } catch (error) {
    logger.error(`Reschedule error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to reschedule appointment' });
  }
});
 
// @PATCH /api/appointments/:id/complete
router.patch('/:id/complete', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
 
    appointment.status = 'completed';
    await appointment.save();
 
    // Notify client to leave review
    try {
      await Notification.create({
        user: appointment.client,
        type: 'review_request',
        title: 'How was your experience?',
        message: 'Your appointment is complete. Please leave a review!',
        appointment: appointment._id
      });
    } catch (notifError) {
      console.error('Notification error (non-fatal):', notifError.message);
    }
 
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete appointment' });
  }
});
 
// @POST /api/appointments/:id/rate
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { score, comment } = req.body;
 
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 5' });
    }
 
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      client: req.user._id,
      status: 'completed'
    });
 
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Completed appointment not found' });
    }
 
    if (appointment.rating?.score) {
      return res.status(400).json({ success: false, message: 'Already rated' });
    }
 
    appointment.rating = {
      score,
      comment,
      createdAt: new Date()
    };
    await appointment.save();
 
    // Update provider rating
    const allRatings = await Appointment.find({
      provider: appointment.provider,
      'rating.score': { $exists: true }
    }).select('rating.score');
 
    const avg = allRatings.reduce((sum, a) => sum + a.rating.score, 0) / allRatings.length;
    await Provider.findByIdAndUpdate(appointment.provider, {
      'rating.average': Math.round(avg * 10) / 10,
      'rating.count': allRatings.length
    });
 
    res.json({ success: true, data: appointment.rating });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to rate appointment' });
  }
});
 
// Helper: Generate recurring dates
function generateRecurringDates(startDate, config) {
  const dates = [];
  const { frequency, endDate, occurrences } = config;
  let current = new Date(startDate);
  let count = 0;
  const maxOccurrences = occurrences || 52;
  const maxDate = endDate
    ? new Date(endDate)
    : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
 
  const intervals = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
  const days = intervals[frequency] || 7;
 
  while (count < maxOccurrences - 1) {
    current = new Date(current.getTime() + days * 24 * 60 * 60 * 1000);
    if (current > maxDate) break;
    dates.push(new Date(current));
    count++;
  }
 
  return dates;
}
 
// Helper: Notify waitlist when slot opens
async function notifyWaitlist(providerId, serviceId, dateTime) {
  try {
    const waitlistEntry = await Waitlist.findOne({
      provider: providerId,
      service: serviceId,
      status: 'waiting'
    }).populate('client');
 
    if (waitlistEntry && waitlistEntry.client) {
      waitlistEntry.status = 'notified';
      waitlistEntry.notifiedAt = new Date();
      await waitlistEntry.save();
 
      await Notification.create({
        user: waitlistEntry.client._id,
        type: 'waitlist_available',
        title: 'Slot Available!',
        message: 'A slot you were waiting for is now available. Book now!'
      });
    }
  } catch (error) {
    logger.error(`Waitlist notify error: ${error.message}`);
  }
}
 
module.exports = router;
 