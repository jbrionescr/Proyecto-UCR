const db = require('../models');
const User = db.User;

class UserRepository {
  async findAll() {
    return await User.findAll();
  }

  async findById(id) {
    return await User.findByPk(id, {
      include: [
        { model: db.Estudiante },
        { model: db.Exalumno }
      ]
    });
  }

  async create(data) {
    return await User.create(data);
  }

  async update(id, data) {
    return await User.update(data, { where: { id } });
  }

  async delete(id) {
    return await User.destroy({ where: { id } });
  }
}

module.exports = new UserRepository();
