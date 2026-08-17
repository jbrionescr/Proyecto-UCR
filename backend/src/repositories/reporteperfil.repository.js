const db = require('../models');
const Reporteperfil = db.Reporteperfil;

class ReporteperfilRepository {
  async findAll() {
    return await Reporteperfil.findAll();
  }

  async findById(id) {
    return await Reporteperfil.findByPk(id);
  }

  async create(data) {
    return await Reporteperfil.create(data);
  }

  async update(id, data) {
    return await Reporteperfil.update(data, { where: { id } });
  }

  async delete(id) {
    return await Reporteperfil.destroy({ where: { id } });
  }
}

module.exports = new ReporteperfilRepository();
