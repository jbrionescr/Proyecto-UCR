const db = require('../models');
const Aplicacion = db.Aplicacion;

class AplicacionRepository {
  async findAll() {
    return await Aplicacion.findAll();
  }

  async findById(id) {
    return await Aplicacion.findByPk(id);
  }

  async create(data) {
    return await Aplicacion.create(data);
  }

  async update(id, data) {
    return await Aplicacion.update(data, { where: { id } });
  }

  async delete(id) {
    return await Aplicacion.destroy({ where: { id } });
  }
}

module.exports = new AplicacionRepository();
