// notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const filter = { user: req.user._id };
    if (unread === 'true') filter.isRead = false;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false })
    ]);
    res.json({ success: true, data: { notifications, total, unreadCount } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All marked as read' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
