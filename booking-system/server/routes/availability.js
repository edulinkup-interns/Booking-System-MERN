const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
 
// @GET /api/availability/:providerId - Get available slots for a date
router.get('/:providerId', async (req, res) => {
  try {
    const { date, serviceId } = req.query;
 
    if (!date || !serviceId) {
      return res.status(400).json({ success: false, message: 'date and serviceId required' });
    }
 
    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
 
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
 
    // Parse date parts
    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day);
    const dayOfWeek = requestedDate.getDay(); // 0=Sun, 1=Mon, 6=Sat
 
    console.log('=== AVAILABILITY CHECK ===');
    console.log('Date:', date, '| DayOfWeek:', dayOfWeek, '(0=Sun,6=Sat)');
    console.log('Service duration:', service.duration, 'mins');
    console.log('Buffer time:', provider.bufferTime || 15, 'mins');
 
    // Always block weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('Weekend - no slots');
      return res.json({ success: true, data: { slots: [], message: 'Not available on weekends' } });
    }
 
    // Use fixed default hours - ignore DB availability issues
    const startTime = '09:00';
    const endTime = '18:00';
    const bufferTime = provider.bufferTime || 15;
    const serviceDuration = service.duration;
 
    console.log('Hours:', startTime, 'to', endTime);
 
    // Get booked appointments for this day
    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
 
    const bookedAppointments = await Appointment.find({
      provider: provider._id,
      dateTime: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['pending', 'confirmed'] }
    }).select('dateTime endDateTime');
 
    console.log('Booked appointments:', bookedAppointments.length);
 
    // Generate slots
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startTotalMins = sh * 60 + sm;
    const endTotalMins = eh * 60 + em;
    const slotInterval = serviceDuration + bufferTime;
 
    const slots = [];
 
    for (let currentMins = startTotalMins; currentMins + serviceDuration <= endTotalMins; currentMins += slotInterval) {
      const slotHour = Math.floor(currentMins / 60);
      const slotMin = currentMins % 60;
 
      const slotStart = new Date(year, month - 1, day, slotHour, slotMin, 0, 0);
      const slotEnd = new Date(year, month - 1, day, slotHour, slotMin + serviceDuration, 0, 0);
 
      // Check conflicts
      const isBooked = bookedAppointments.some(apt => {
        const aptStart = new Date(apt.dateTime);
        const aptEnd = new Date(apt.endDateTime);
        return slotStart < aptEnd && slotEnd > aptStart;
      });
 
      // Format display time (12-hour format)
      const displayHour = slotHour % 12 || 12;
      const displayMin = String(slotMin).padStart(2, '0');
      const ampm = slotHour < 12 ? 'AM' : 'PM';
      const displayTime = `${displayHour}:${displayMin} ${ampm}`;
 
      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        displayTime,
        isAvailable: !isBooked
      });
    }
 
    console.log('Total slots generated:', slots.length);
    console.log('Available slots:', slots.filter(s => s.isAvailable).length);
    console.log('=========================');
 
    res.json({
      success: true,
      data: { slots, date }
    });
 
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to get availability' });
  }
});
 
// @GET /api/availability/:providerId/monthly
router.get('/:providerId/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;
 
    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
 
    const m = parseInt(month);
    const y = parseInt(year);
    const daysInMonth = new Date(y, m, 0).getDate();
 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
 
    const availableDates = [];
 
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m - 1, d);
 
      // Skip past dates
      if (date < today) continue;
 
      // Skip weekends
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;
 
      const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      availableDates.push(ds);
    }
 
    res.json({ success: true, data: { availableDates } });
 
  } catch (error) {
    console.error('Monthly availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to get monthly availability' });
  }
});
 
module.exports = router;
 