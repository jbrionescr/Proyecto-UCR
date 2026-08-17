const db = require('../models');
const Notification = db.Notification;

class NotificationRepository {
  async findAllByUser(userId) {
    return await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
  }

  async findUnreadCount(userId) {
    return await Notification.count({
      where: { user_id: userId, read: false }
    });
  }

  async findUnreadByUser(userId) {
    return await Notification.findAll({
      where: { user_id: userId, read: false },
      order: [['created_at', 'DESC']]
    });
  }

  async create(data) {
    return await Notification.create(data);
  }

  async markAsRead(id, userId) {
    return await Notification.update({ read: true }, { where: { id, user_id: userId } });
  }

  async markAllAsRead(userId) {
    return await Notification.update({ read: true }, { where: { user_id: userId, read: false } });
  }
}

module.exports = new NotificationRepository();
