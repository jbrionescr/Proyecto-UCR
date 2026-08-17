const db = require('../models');
const Curriculumversion = db.Curriculumversion;

class CurriculumversionRepository {
  async findAll() {
    return await Curriculumversion.findAll();
  }

  async findById(id) {
    return await Curriculumversion.findByPk(id);
  }

  async create(data) {
    return await Curriculumversion.create(data);
  }

  async update(id, data) {
    return await Curriculumversion.update(data, { where: { id } });
  }

  async delete(id) {
    return await Curriculumversion.destroy({ where: { id } });
  }
}

module.exports = new CurriculumversionRepository();
