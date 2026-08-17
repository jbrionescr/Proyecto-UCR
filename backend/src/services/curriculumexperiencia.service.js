const CurriculumexperienciaRepository = require('../repositories/curriculumexperiencia.repository');

class CurriculumexperienciaService {
  async findAll() {
    return await CurriculumexperienciaRepository.findAll();
  }

  async findById(id) {
    return await CurriculumexperienciaRepository.findById(id);
  }

  async create(data) {
    return await CurriculumexperienciaRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await CurriculumexperienciaRepository.update(id, data);
    if (!updated) return null;
    return await CurriculumexperienciaRepository.findById(id);
  }

  async delete(id) {
    const deleted = await CurriculumexperienciaRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new CurriculumexperienciaService();
