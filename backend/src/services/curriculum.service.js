const CurriculumRepository = require('../repositories/curriculum.repository');

class CurriculumService {
  async findAll() {
    return await CurriculumRepository.findAll();
  }

  async findById(id) {
    return await CurriculumRepository.findById(id);
  }

  async create(data) {
    return await CurriculumRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await CurriculumRepository.update(id, data);
    if (!updated) return null;
    return await CurriculumRepository.findById(id);
  }

  async delete(id) {
    const deleted = await CurriculumRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new CurriculumService();
