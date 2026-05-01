const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    const config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };

    // Fallback to ethereal for development
    if (!process.env.EMAIL_USER) {
      nodemailer.createTestAccount((err, account) => {
        if (!err) {
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: { user: account.user, pass: account.pass }
          });
          logger.info('Using Ethereal test email account');
        }
      });
    } else {
      this.transporter = nodemailer.createTransport(config);
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not initialized');
        return false;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'BookEase <noreply@bookease.com>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '')
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId} to ${to}`);

      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) logger.info(`Email preview: ${previewUrl}`);
      }

      return true;
    } catch (error) {
      logger.error(`Email send error: ${error.message}`);
      return false;
    }
  }

  // Templates
  getBaseTemplate(content, title) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; color: #333; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .header .logo { font-size: 36px; margin-bottom: 8px; }
        .body { padding: 40px 30px; }
        .body h2 { font-size: 22px; color: #1a1a2e; margin-bottom: 16px; }
        .body p { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 16px; }
        .card { background: #f8f9ff; border: 1px solid #e8ebff; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .card-row:last-child { border-bottom: none; }
        .card-label { font-size: 13px; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-value { font-size: 14px; color: #333; font-weight: 600; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 16px 0; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .status-pending { background: #fff3cd; color: #856404; }
        .footer { background: #f8f9ff; padding: 24px 30px; text-align: center; border-top: 1px solid #e8ebff; }
        .footer p { font-size: 12px; color: #999; line-height: 1.6; }
        .booking-ref { font-family: monospace; font-size: 18px; font-weight: 700; color: #667eea; letter-spacing: 2px; background: #f0f0ff; padding: 8px 16px; border-radius: 8px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📅</div>
          <h1>BookEase</h1>
        </div>
        <div class="body">${content}</div>
        <div class="footer">
          <p>© 2024 BookEase. All rights reserved.<br>
          If you did not make this request, please ignore this email or contact support.</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  async sendBookingConfirmation({ to, clientName, appointment, service, provider }) {
    const dateTime = new Date(appointment.dateTime);
    const content = `
      <h2>Booking Confirmed! 🎉</h2>
      <p>Hi ${clientName}, your appointment has been successfully booked.</p>
      <p>Booking Reference: <span class="booking-ref">${appointment.bookingRef}</span></p>
      <div class="card">
        <div class="card-row"><span class="card-label">Service</span><span class="card-value">${service.name}</span></div>
        <div class="card-row"><span class="card-label">Provider</span><span class="card-value">${provider.businessName}</span></div>
        <div class="card-row"><span class="card-label">Date</span><span class="card-value">${dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        <div class="card-row"><span class="card-label">Time</span><span class="card-value">${dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="card-row"><span class="card-label">Duration</span><span class="card-value">${service.duration} minutes</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-value"><span class="status-badge status-confirmed">Confirmed</span></span></div>
      </div>
      <p>Please arrive 5 minutes before your scheduled time. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
      <a href="${process.env.CLIENT_URL}/appointments/${appointment._id}" class="btn">View Appointment</a>`;

    return await this.sendEmail({
      to,
      subject: `Booking Confirmed - ${service.name} on ${dateTime.toLocaleDateString()}`,
      html: this.getBaseTemplate(content, 'Booking Confirmation')
    });
  }

  async sendCancellationEmail({ to, clientName, appointment, service, reason }) {
    const dateTime = new Date(appointment.dateTime);
    const content = `
      <h2>Appointment Cancelled</h2>
      <p>Hi ${clientName}, your appointment has been cancelled.</p>
      <p>Booking Reference: <span class="booking-ref">${appointment.bookingRef}</span></p>
      <div class="card">
        <div class="card-row"><span class="card-label">Service</span><span class="card-value">${service.name}</span></div>
        <div class="card-row"><span class="card-label">Date</span><span class="card-value">${dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        <div class="card-row"><span class="card-label">Time</span><span class="card-value">${dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-value"><span class="status-badge status-cancelled">Cancelled</span></span></div>
        ${reason ? `<div class="card-row"><span class="card-label">Reason</span><span class="card-value">${reason}</span></div>` : ''}
      </div>
      <a href="${process.env.CLIENT_URL}/services" class="btn">Book Another Appointment</a>`;

    return await this.sendEmail({
      to,
      subject: `Appointment Cancelled - ${service.name}`,
      html: this.getBaseTemplate(content, 'Appointment Cancelled')
    });
  }

  async sendReminderEmail({ to, clientName, appointment, service, provider, hoursUntil }) {
    const dateTime = new Date(appointment.dateTime);
    const content = `
      <h2>Appointment Reminder ⏰</h2>
      <p>Hi ${clientName}, this is a reminder that you have an appointment in <strong>${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}</strong>.</p>
      <p>Booking Reference: <span class="booking-ref">${appointment.bookingRef}</span></p>
      <div class="card">
        <div class="card-row"><span class="card-label">Service</span><span class="card-value">${service.name}</span></div>
        <div class="card-row"><span class="card-label">Provider</span><span class="card-value">${provider.businessName}</span></div>
        <div class="card-row"><span class="card-label">Date</span><span class="card-value">${dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        <div class="card-row"><span class="card-label">Time</span><span class="card-value">${dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="card-row"><span class="card-label">Duration</span><span class="card-value">${service.duration} minutes</span></div>
      </div>
      <a href="${process.env.CLIENT_URL}/appointments/${appointment._id}" class="btn">View Details</a>`;

    return await this.sendEmail({
      to,
      subject: `Reminder: ${service.name} in ${hoursUntil} hours`,
      html: this.getBaseTemplate(content, 'Appointment Reminder')
    });
  }

  async sendRescheduleEmail({ to, clientName, appointment, service, oldDateTime }) {
    const newDateTime = new Date(appointment.dateTime);
    const content = `
      <h2>Appointment Rescheduled 🔄</h2>
      <p>Hi ${clientName}, your appointment has been rescheduled.</p>
      <p>Booking Reference: <span class="booking-ref">${appointment.bookingRef}</span></p>
      <div class="card">
        <div class="card-row"><span class="card-label">Service</span><span class="card-value">${service.name}</span></div>
        <div class="card-row"><span class="card-label">Previous Date</span><span class="card-value" style="text-decoration:line-through;color:#888">${new Date(oldDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="card-row"><span class="card-label">New Date</span><span class="card-value">${newDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        <div class="card-row"><span class="card-label">New Time</span><span class="card-value">${newDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-value"><span class="status-badge status-confirmed">Confirmed</span></span></div>
      </div>
      <a href="${process.env.CLIENT_URL}/appointments/${appointment._id}" class="btn">View Appointment</a>`;

    return await this.sendEmail({
      to,
      subject: `Appointment Rescheduled - ${service.name}`,
      html: this.getBaseTemplate(content, 'Appointment Rescheduled')
    });
  }

  async sendPasswordReset({ to, name, resetUrl }) {
    const content = `
      <h2>Reset Your Password 🔐</h2>
      <p>Hi ${name}, you requested a password reset. Click the button below to reset your password.</p>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="font-size:13px;color:#999;margin-top:20px">If you didn't request this, please ignore this email. Your password won't change.</p>`;

    return await this.sendEmail({
      to,
      subject: 'BookEase - Password Reset Request',
      html: this.getBaseTemplate(content, 'Password Reset')
    });
  }

  async sendWelcomeEmail({ to, name }) {
    const content = `
      <h2>Welcome to BookEase! 🎊</h2>
      <p>Hi ${name}, welcome aboard! We're excited to have you with us.</p>
      <p>With BookEase you can:</p>
      <div class="card">
        <div class="card-row"><span class="card-value">📅 Browse and book appointments with ease</span></div>
        <div class="card-row"><span class="card-value">🔔 Get automated reminders</span></div>
        <div class="card-row"><span class="card-value">📊 Track your booking history</span></div>
        <div class="card-row"><span class="card-value">⚡ Reschedule or cancel anytime</span></div>
      </div>
      <a href="${process.env.CLIENT_URL}/services" class="btn">Browse Services</a>`;

    return await this.sendEmail({
      to,
      subject: 'Welcome to BookEase!',
      html: this.getBaseTemplate(content, 'Welcome')
    });
  }
}

module.exports = new EmailService();
