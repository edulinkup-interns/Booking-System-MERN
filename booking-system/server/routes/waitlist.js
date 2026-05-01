const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const existing = await Waitlist.findOne({ client: req.user._id, service: req.body.serviceId, status: 'waiting' });
    if (existing) return res.status(400).json({ success: false, message: 'Already on waitlist' });

    const count = await Waitlist.countDocuments({ provider: req.body.providerId, service: req.body.serviceId, status: 'waiting' });
    const entry = await Waitlist.create({
      client: req.user._id,
      provider: req.body.providerId,
      service: req.body.serviceId,
      preferredDates: req.body.preferredDates,
      position: count + 1,
      notes: req.body.notes
    });

    res.status(201).json({ success: true, data: entry });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const entries = await Waitlist.find({ client: req.user._id, status: { $in: ['waiting', 'notified'] } })
      .populate('service', 'name duration price')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name' } });
    res.json({ success: true, data: entries });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Waitlist.findOneAndUpdate({ _id: req.params.id, client: req.user._id }, { status: 'cancelled' });
    res.json({ success: true, message: 'Removed from waitlist' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
