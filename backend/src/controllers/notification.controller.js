const NotificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllByUser = asyncHandler(async (req, res) => {
  const result = await NotificationService.getAllByUser(req.user.id);
  res.status(200).json(result);
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const result = await NotificationService.getUnreadCount(req.user.id);
  res.status(200).json(result);
});

exports.getUnreadByUser = asyncHandler(async (req, res) => {
  const result = await NotificationService.getUnreadByUser(req.user.id);
  res.status(200).json(result);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const success = await NotificationService.markAsRead(req.params.id, req.user.id);
  if (!success) {
    return res.status(404).json({ message: 'Notificación no encontrada.' });
  }
  res.status(200).json({ success: true });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await NotificationService.markAllAsRead(req.user.id);
  res.status(200).json(result);
});
