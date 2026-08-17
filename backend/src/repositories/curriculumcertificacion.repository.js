const db = require('../models');
const Curriculumcertificacion = db.Curriculumcertificacion;

class CurriculumcertificacionRepository {
  async findAll() {
    return await Curriculumcertificacion.findAll();
  }

  async findById(id) {
    return await Curriculumcertificacion.findByPk(id);
  }

  async create(data) {
    return await Curriculumcertificacion.create(data);
  }

  async update(id, data) {
    return await Curriculumcertificacion.update(data, { where: { id } });
  }

  async delete(id) {
    return await Curriculumcertificacion.destroy({ where: { id } });
  }
}

module.exports = new CurriculumcertificacionRepository();
