// analytics.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/analytics/provider - Provider dashboard analytics
router.get('/provider', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const [
      totalAppointments,
      statusBreakdown,
      revenueData,
      topServices,
      hourlyDistribution,
      weeklyTrend
    ] = await Promise.all([
      Appointment.countDocuments({ provider: provider._id, dateTime: { $gte: start, $lte: end } }),
      Appointment.aggregate([
        { $match: { provider: provider._id, dateTime: { $gte: start, $lte: end } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        { $match: { provider: provider._id, 'payment.status': 'paid', dateTime: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$payment.amount' }, count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        { $match: { provider: provider._id, dateTime: { $gte: start, $lte: end } } },
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
        { $unwind: '$service' }
      ]),
      Appointment.aggregate([
        { $match: { provider: provider._id, dateTime: { $gte: start, $lte: end } } },
        { $group: { _id: { $hour: '$dateTime' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } }
      ]),
      Appointment.aggregate([
        { $match: { provider: provider._id, dateTime: { $gte: start, $lte: end } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateTime' } },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, '$payment.amount', 0] } }
        }},
        { $sort: { '_id': 1 } }
      ])
    ]);

    const revenue = revenueData[0] || { total: 0, count: 0 };
    const avgRating = provider.rating.average;

    res.json({
      success: true,
      data: {
        overview: {
          totalAppointments,
          revenue: revenue.total,
          avgRating,
          ratingCount: provider.rating.count
        },
        statusBreakdown,
        topServices,
        hourlyDistribution,
        weeklyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// @GET /api/analytics/admin - Admin analytics
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalProviders, totalAppointments, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Provider.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProviders,
        totalAppointments,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin analytics' });
  }
});

module.exports = router;
