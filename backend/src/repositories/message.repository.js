const db = require('../models');
const Message = db.Message;

class MessageRepository {
  async findByMatch(matchId) {
    return await Message.findAll({
      where: { match_id: matchId },
      include: [{ model: db.User, as: 'sender', attributes: ['id', 'nombre', 'foto_url'] }],
      order: [['created_at', 'ASC']],
    });
  }

  async create(data) {
    return await Message.create(data);
  }
}

module.exports = new MessageRepository();
