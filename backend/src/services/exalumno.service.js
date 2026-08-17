const ExalumnoRepository = require('../repositories/exalumno.repository');
const ConnectionRepository = require('../repositories/connection.repository');

class ExalumnoService {
  async findAll(filters = {}) {
    return await ExalumnoRepository.findAll(filters);
  }

  async findById(id, requestingUserId = null) {
    const exalumno = await ExalumnoRepository.findById(id);
    if (!exalumno) return null;

    // Convert to JSON plain object to modify properties
    const result = exalumno.get({ plain: true });

    if (requestingUserId) {
      const connection = await ConnectionRepository.findBySenderAndReceiver(requestingUserId, id);
      if (connection) {
        result.connectionStatus = connection.status;
        result.connectionId = connection.id;
        result.connectionSenderId = connection.sender_id;
      } else {
        result.connectionStatus = 'none';
      }
    } else {
      result.connectionStatus = 'none';
    }

    return result;
  }

  async create(data) {
    return await ExalumnoRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await ExalumnoRepository.update(id, data);
    if (!updated) return null;
    return await ExalumnoRepository.findById(id);
  }

  async delete(id) {
    const deleted = await ExalumnoRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new ExalumnoService();
