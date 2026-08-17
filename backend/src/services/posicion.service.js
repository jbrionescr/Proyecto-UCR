const PosicionRepository = require('../repositories/posicion.repository');

class PosicionService {
  async findAll() {
    return await PosicionRepository.findAll();
  }

  async findById(id) {
    return await PosicionRepository.findById(id);
  }

  async create(data) {
    return await PosicionRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await PosicionRepository.update(id, data);
    if (!updated) return null;
    return await PosicionRepository.findById(id);
  }

  async delete(id) {
    const deleted = await PosicionRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new PosicionService();
