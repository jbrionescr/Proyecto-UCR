const db = require('../models');
const Connection = db.Connection;
const User = db.User;
const Exalumno = db.Exalumno;
const { Op } = require('sequelize');

class ConnectionRepository {
  async findById(id) {
    return await Connection.findByPk(id, {
      include: [
        { model: User, as: 'Sender' },
        { model: User, as: 'Receiver' }
      ]
    });
  }

  async findBySenderAndReceiver(senderId, receiverId) {
    return await Connection.findOne({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId }
        ]
      }
    });
  }

  async findPendingReceived(receiverId) {
    return await Connection.findAll({
      where: { receiver_id: receiverId, status: 'pending' },
      include: [
        { 
          model: User, 
          as: 'Sender',
          include: [{ model: Exalumno, required: false }]
        }
      ]
    });
  }

  async findSent(senderId) {
    return await Connection.findAll({
      where: { sender_id: senderId },
      include: [
        { 
          model: User, 
          as: 'Receiver',
          include: [{ model: Exalumno, required: false }]
        }
      ]
    });
  }

  async findActiveConnections(userId) {
    return await Connection.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        { 
          model: User, 
          as: 'Sender',
          include: [{ model: Exalumno, required: false }]
        },
        { 
          model: User, 
          as: 'Receiver',
          include: [{ model: Exalumno, required: false }]
        }
      ]
    });
  }

  async create(data) {
    return await Connection.create(data);
  }

  async update(id, data) {
    return await Connection.update(data, { where: { id } });
  }

  async delete(id) {
    return await Connection.destroy({ where: { id } });
  }
}

module.exports = new ConnectionRepository();
