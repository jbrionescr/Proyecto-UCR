const CurriculumcertificacionRepository = require('../repositories/curriculumcertificacion.repository');

class CurriculumcertificacionService {
  async findAll() {
    return await CurriculumcertificacionRepository.findAll();
  }

  async findById(id) {
    return await CurriculumcertificacionRepository.findById(id);
  }

  async create(data) {
    return await CurriculumcertificacionRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await CurriculumcertificacionRepository.update(id, data);
    if (!updated) return null;
    return await CurriculumcertificacionRepository.findById(id);
  }

  async delete(id) {
    const deleted = await CurriculumcertificacionRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new CurriculumcertificacionService();
