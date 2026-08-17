const db = require('../models');
const Match = db.Match;

class MatchRepository {
  async findAll() {
    return await Match.findAll();
  }

  async findById(id) {
    return await Match.findByPk(id);
  }

  async findByEstudiante(estudianteId) {
    return await Match.findAll({
      where: { estudiante_id: estudianteId },
      order: [['score_match', 'DESC']],
    });
  }

  async findByExalumno(exalumnoId) {
    return await Match.findAll({
      where: { exalumno_id: exalumnoId },
      order: [['score_match', 'DESC']],
    });
  }

  async create(data) {
    return await Match.create(data);
  }

  async update(id, data) {
    return await Match.update(data, { where: { id } });
  }

  async delete(id) {
    return await Match.destroy({ where: { id } });
  }
}

module.exports = new MatchRepository();
