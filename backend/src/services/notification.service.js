const NotificationRepository = require('../repositories/notification.repository');

class NotificationService {
  async getAllByUser(userId) {
    return await NotificationRepository.findAllByUser(userId);
  }

  async getUnreadCount(userId) {
    const count = await NotificationRepository.findUnreadCount(userId);
    return { count };
  }

  async getUnreadByUser(userId) {
    return await NotificationRepository.findUnreadByUser(userId);
  }

  async createNotification(userId, title, message, type, referenceId = null) {
    const data = { user_id: userId, title, message, type };
    if (referenceId) data.reference_id = referenceId;
    return await NotificationRepository.create(data);
  }

  async markAsRead(id, userId) {
    const [updated] = await NotificationRepository.markAsRead(id, userId);
    return !!updated;
  }

  async markAllAsRead(userId) {
    await NotificationRepository.markAllAsRead(userId);
    return { success: true };
  }
}

module.exports = new NotificationService();
