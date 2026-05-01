const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

// @GET /api/providers - List all providers
router.get('/', async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 12, sort = '-rating.average' } = req.query;
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (search) filter.businessName = new RegExp(search, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [providers, total] = await Promise.all([
      Provider.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email avatar')
        .populate('services', 'name duration price isActive'),
      Provider.countDocuments(filter)
    ]);

    res.json({ success: true, data: { providers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch providers' });
  }
});

// @GET /api/providers/:id
router.get('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('user', 'name email avatar phone')
      .populate({ path: 'services', match: { isActive: true } });

    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch provider' });
  }
});

// @POST /api/providers - Create provider profile
router.post('/', protect, authorize('provider', 'admin'), [
  body('businessName').trim().isLength({ min: 2, max: 100 }),
  body('category').isIn(['Healthcare', 'Beauty & Wellness', 'Fitness', 'Education & Tutoring', 'Legal', 'Financial', 'Consulting', 'Home Services', 'Photography', 'Events', 'Pet Services', 'Technology', 'Other'])
], validate, async (req, res) => {
  try {
    const existing = await Provider.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Provider profile already exists' });

    const defaultAvailability = [1, 2, 3, 4, 5].map(day => ({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    }));

    const provider = await Provider.create({
      user: req.user._id,
      ...req.body,
      weeklyAvailability: req.body.weeklyAvailability || defaultAvailability
    });

    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create provider profile' });
  }
});

// @PUT /api/providers/:id - Update provider
router.put('/:id', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ _id: req.params.id, user: req.user._id });
    if (!provider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'name email');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update provider' });
  }
});

// @PATCH /api/providers/:id/availability - Update availability
router.patch('/:id/availability', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const provider = await Provider.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { weeklyAvailability: req.body.weeklyAvailability },
      { new: true }
    );
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({ success: true, data: provider.weeklyAvailability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
});

// @POST /api/providers/:id/block-date
router.post('/:id/block-date', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ _id: req.params.id, user: req.user._id });
    if (!provider) return res.status(403).json({ success: false, message: 'Not authorized' });

    provider.blockedDates.push(req.body);
    await provider.save();
    res.json({ success: true, data: provider.blockedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to block date' });
  }
});

// @DELETE /api/providers/:id/block-date/:blockedId
router.delete('/:id/block-date/:blockedId', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ _id: req.params.id, user: req.user._id });
    if (!provider) return res.status(403).json({ success: false, message: 'Not authorized' });

    provider.blockedDates = provider.blockedDates.filter(b => b._id.toString() !== req.params.blockedId);
    await provider.save();
    res.json({ success: true, message: 'Blocked date removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove blocked date' });
  }
});

module.exports = router;
