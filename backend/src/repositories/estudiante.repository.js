const db = require('../models');
const Estudiante = db.Estudiante;

class EstudianteRepository {
  async findAll() {
    return await Estudiante.findAll({
      include: [{
        model: db.User,
        required: true,
        where: { tipo: 'ESTUDIANTE' }
      }]
    });
  }

  async findById(id) {
    return await Estudiante.findByPk(id);
  }

  async create(data) {
    return await Estudiante.create(data);
  }

  async update(id, data) {
    return await Estudiante.update(data, { where: { user_id: id } });
  }

  async delete(id) {
    return await Estudiante.destroy({ where: { user_id: id } });
  }
}

module.exports = new EstudianteRepository();
