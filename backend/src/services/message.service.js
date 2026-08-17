const MessageRepository = require('../repositories/message.repository');
const MatchRepository   = require('../repositories/match.repository');

class MessageService {
  async getMessages(matchId) {
    return await MessageRepository.findByMatch(matchId);
  }

  async sendMessage(matchId, senderId, content) {
    const match = await MatchRepository.findById(matchId);
    if (!match) {
      const err = new Error('Match no encontrado');
      err.status = 404;
      throw err;
    }
    if (match.estado !== 'ACTIVO') {
      const err = new Error('Solo se pueden enviar mensajes en matches activos');
      err.status = 422;
      throw err;
    }
    // Verificar que el sender pertenece al match
    if (match.estudiante_id !== senderId && match.exalumno_id !== senderId) {
      const err = new Error('No tienes permiso para enviar mensajes en este match');
      err.status = 403;
      throw err;
    }
    return await MessageRepository.create({ match_id: matchId, sender_id: senderId, content });
  }
}

module.exports = new MessageService();
