const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// @POST /api/payments/create-intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ success: false, message: 'Payment not configured' });
    }
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('service');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(appointment.service.price.amount * 100),
      currency: appointment.service.price.currency || 'usd',
      metadata: { appointmentId: appointmentId.toString(), userId: req.user._id.toString() }
    });

    res.json({ success: true, data: { clientSecret: paymentIntent.client_secret } });
  } catch (error) {
    logger.error(`Payment intent error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
});

// @POST /api/payments/confirm
router.post('/confirm', protect, async (req, res) => {
  try {
    const { appointmentId, paymentIntentId } = req.body;
    await Appointment.findByIdAndUpdate(appointmentId, {
      'payment.status': 'paid',
      'payment.stripePaymentIntentId': paymentIntentId,
      'payment.paidAt': new Date()
    });
    res.json({ success: true, message: 'Payment confirmed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment confirmation failed' });
  }
});

module.exports = router;
