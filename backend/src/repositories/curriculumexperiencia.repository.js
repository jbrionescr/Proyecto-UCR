const db = require('../models');
const Curriculumexperiencia = db.Curriculumexperiencia;

class CurriculumexperienciaRepository {
  async findAll() {
    return await Curriculumexperiencia.findAll();
  }

  async findById(id) {
    return await Curriculumexperiencia.findByPk(id);
  }

  async create(data) {
    return await Curriculumexperiencia.create(data);
  }

  async update(id, data) {
    return await Curriculumexperiencia.update(data, { where: { id } });
  }

  async delete(id) {
    return await Curriculumexperiencia.destroy({ where: { id } });
  }
}

module.exports = new CurriculumexperienciaRepository();
