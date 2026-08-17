const db = require('../models');
const Posicion = db.Posicion;

class PosicionRepository {
  async findAll() {
    return await Posicion.findAll();
  }

  async findById(id) {
    return await Posicion.findByPk(id);
  }

  async create(data) {
    return await Posicion.create(data);
  }

  async update(id, data) {
    return await Posicion.update(data, { where: { id } });
  }

  async delete(id) {
    return await Posicion.destroy({ where: { id } });
  }
}

module.exports = new PosicionRepository();
