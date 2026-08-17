const db = require('../models');
const Donacion = db.Donacion;

class DonacionRepository {
  async findAll() {
    return await Donacion.findAll();
  }

  async findById(id) {
    return await Donacion.findByPk(id);
  }

  async create(data) {
    return await Donacion.create(data);
  }

  async update(id, data) {
    return await Donacion.update(data, { where: { id } });
  }

  async delete(id) {
    return await Donacion.destroy({ where: { id } });
  }
}

module.exports = new DonacionRepository();
