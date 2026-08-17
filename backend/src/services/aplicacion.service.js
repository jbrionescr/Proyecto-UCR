const AplicacionRepository = require('../repositories/aplicacion.repository');

class AplicacionService {
  async findAll() {
    return await AplicacionRepository.findAll();
  }

  async findById(id) {
    return await AplicacionRepository.findById(id);
  }

  async create(data) {
    return await AplicacionRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await AplicacionRepository.update(id, data);
    if (!updated) return null;
    return await AplicacionRepository.findById(id);
  }

  async delete(id) {
    const deleted = await AplicacionRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new AplicacionService();
