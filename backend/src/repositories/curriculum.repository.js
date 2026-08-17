const db = require('../models');
const Curriculum = db.Curriculum;

class CurriculumRepository {
  async findAll() {
    return await Curriculum.findAll();
  }

  async findById(id) {
    return await Curriculum.findByPk(id);
  }

  async create(data) {
    return await Curriculum.create(data);
  }

  async update(id, data) {
    return await Curriculum.update(data, { where: { id } });
  }

  async delete(id) {
    return await Curriculum.destroy({ where: { id } });
  }
}

module.exports = new CurriculumRepository();
