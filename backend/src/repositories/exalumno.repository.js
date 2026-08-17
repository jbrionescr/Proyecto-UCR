const db = require('../models');
const Exalumno = db.Exalumno;
const User = db.User;
const { Op } = require('sequelize');

class ExalumnoRepository {
  async findAll(filters = {}) {
    const where = {};
    const userWhere = { activo: true };

    if (filters.carrera) {
      where.carrera = filters.carrera;
    }
    if (filters.sector) {
      // Handle "industria" parameter mapped to "sector"
      where.sector = filters.sector;
    }
    if (filters.pais_ciudad) {
      where.pais_ciudad = { [Op.iLike]: `%${filters.pais_ciudad}%` };
    }

    // Support Types: Mentorship, Hiring, Guest Speaking, Volunteering, Career Advice, Networking
    if (filters.apoyo) {
      const supports = Array.isArray(filters.apoyo) ? filters.apoyo : [filters.apoyo];
      supports.forEach(sup => {
        const key = sup.toLowerCase();
        if (key === 'mentorship' || key === 'mentoria') where.ofrece_mentoria = true;
        if (key === 'hiring' || key === 'empleo') where.ofrece_empleo = true;
        if (key === 'pasantia') where.ofrece_pasantia = true;
        if (key === 'guest speaking' || key === 'charlas') where.ofrece_guest_speaking = true;
        if (key === 'volunteering' || key === 'voluntariado') where.ofrece_volunteering = true;
        if (key === 'career advice' || key === 'consejo') where.ofrece_career_advice = true;
        if (key === 'networking') where.ofrece_networking = true;
      });
    }

    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      userWhere[Op.or] = [
        { nombre: { [Op.iLike]: searchVal } },
        { email: { [Op.iLike]: searchVal } }
      ];
    }

    return await Exalumno.findAll({
      where,
      include: [
        {
          model: User,
          where: userWhere,
          attributes: ['id', 'email', 'nombre', 'foto_url']
        }
      ]
    });
  }

  async findById(user_id) {
    return await Exalumno.findOne({
      where: { user_id },
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'nombre', 'foto_url']
        }
      ]
    });
  }

  async create(data) {
    return await Exalumno.create(data);
  }

  async update(id, data) {
    return await Exalumno.update(data, { where: { user_id: id } });
  }

  async delete(id) {
    return await Exalumno.destroy({ where: { user_id: id } });
  }
}

module.exports = new ExalumnoRepository();
