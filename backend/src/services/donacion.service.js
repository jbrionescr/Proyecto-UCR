const DonacionRepository = require('../repositories/donacion.repository');

class DonacionService {
  async findAll() {
    return await DonacionRepository.findAll();
  }

  async findById(id) {
    return await DonacionRepository.findById(id);
  }

  async create(data) {
    return await DonacionRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await DonacionRepository.update(id, data);
    if (!updated) return null;
    return await DonacionRepository.findById(id);
  }

  async delete(id) {
    const deleted = await DonacionRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new DonacionService();
