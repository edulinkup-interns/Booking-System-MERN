const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const { protect, authorize } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

// @GET /api/services - List services
router.get('/', async (req, res) => {
  try {
    const { providerId, category, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    
    if (providerId) filter.provider = providerId;
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
    }

    const services = await Service.find(filter)
      .populate({ path: 'provider', populate: { path: 'user', select: 'name avatar' } });

    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// @GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({ path: 'provider', populate: { path: 'user', select: 'name email avatar' } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
});

// @POST /api/services - Create service
router.post('/', protect, authorize('provider', 'admin'), [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('duration').isInt({ min: 5, max: 480 }),
  body('price.amount').isFloat({ min: 0 })
], validate, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(400).json({ success: false, message: 'Create a provider profile first' });

    const service = await Service.create({ ...req.body, provider: provider._id });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

// @PUT /api/services/:id
router.put('/:id', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    if (req.user.role !== 'admin' && service.provider.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

// @DELETE /api/services/:id
router.delete('/:id', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    if (req.user.role !== 'admin' && service.provider.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

module.exports = router;
