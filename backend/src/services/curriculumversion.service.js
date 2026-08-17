const CurriculumversionRepository = require('../repositories/curriculumversion.repository');

class CurriculumversionService {
  async findAll() {
    return await CurriculumversionRepository.findAll();
  }

  async findById(id) {
    return await CurriculumversionRepository.findById(id);
  }

  async create(data) {
    return await CurriculumversionRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await CurriculumversionRepository.update(id, data);
    if (!updated) return null;
    return await CurriculumversionRepository.findById(id);
  }

  async delete(id) {
    const deleted = await CurriculumversionRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new CurriculumversionService();
