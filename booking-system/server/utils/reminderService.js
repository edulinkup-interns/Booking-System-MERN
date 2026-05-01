const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Notification = require('../models/Notification');
const emailService = require('./emailService');
const logger = require('./logger');

const sendReminderEmails = async () => {
  try {
    const now = new Date();

    // 24-hour reminders
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFourHourWindow = {
      $gte: new Date(in24h.getTime() - 30 * 60 * 1000),
      $lte: new Date(in24h.getTime() + 30 * 60 * 1000)
    };

    const appointments24h = await Appointment.find({
      dateTime: twentyFourHourWindow,
      status: 'confirmed',
      'reminders.sent24h': false
    }).populate('client service provider');

    for (const apt of appointments24h) {
      if (!apt.client || !apt.service || !apt.provider) continue;
      
      const clientUser = await User.findById(apt.client._id || apt.client);
      if (clientUser?.preferences?.notifications?.reminders) {
        await emailService.sendReminderEmail({
          to: clientUser.email,
          clientName: clientUser.name,
          appointment: apt,
          service: apt.service,
          provider: apt.provider,
          hoursUntil: 24
        });

        await Notification.create({
          user: clientUser._id,
          type: 'appointment_reminder',
          title: 'Appointment Tomorrow',
          message: `Reminder: You have an appointment for ${apt.service.name} tomorrow.`,
          appointment: apt._id,
          emailSent: true
        });
      }

      await Appointment.findByIdAndUpdate(apt._id, {
        'reminders.sent24h': true,
        'reminders.sent24hAt': new Date()
      });
    }

    // 1-hour reminders
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourWindow = {
      $gte: new Date(in1h.getTime() - 15 * 60 * 1000),
      $lte: new Date(in1h.getTime() + 15 * 60 * 1000)
    };

    const appointments1h = await Appointment.find({
      dateTime: oneHourWindow,
      status: 'confirmed',
      'reminders.sent1h': false
    }).populate('client service provider');

    for (const apt of appointments1h) {
      if (!apt.client || !apt.service || !apt.provider) continue;
      
      const clientUser = await User.findById(apt.client._id || apt.client);
      if (clientUser?.preferences?.notifications?.reminders) {
        await emailService.sendReminderEmail({
          to: clientUser.email,
          clientName: clientUser.name,
          appointment: apt,
          service: apt.service,
          provider: apt.provider,
          hoursUntil: 1
        });
      }

      await Appointment.findByIdAndUpdate(apt._id, {
        'reminders.sent1h': true,
        'reminders.sent1hAt': new Date()
      });
    }

    logger.info(`Reminder job: sent ${appointments24h.length} 24h and ${appointments1h.length} 1h reminders`);
  } catch (error) {
    logger.error(`Reminder service error: ${error.message}`);
  }
};

module.exports = { sendReminderEmails };
