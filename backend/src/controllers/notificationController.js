const asyncHandler = require('express-async-handler');
const NotificationService = require('../services/NotificationService');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { id, tenantId } = req.user;
  const notifications = await NotificationService.getNotifications(id, tenantId);
  res.status(200).json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const notificationId = req.params.id;
  const notification = await NotificationService.markAsRead(notificationId, id);
  res.status(200).json(notification);
});
