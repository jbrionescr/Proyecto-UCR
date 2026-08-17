const EstudianteService = require('../services/estudiante.service');
const asyncHandler = require('../utils/asyncHandler');
const db = require('../models');
const { Op } = require('sequelize');

// Helper to check if a user is an administrator
function isAdmin(user) {
  return user && (user.tipo === 'ADMIN' || user.tipo === 'ADMINISTRADOR');
}

exports.findAll = asyncHandler(async (req, res) => {
  const data = await EstudianteService.findAll();
  
  // Requester DB user
  let requesterDbUser = null;
  if (req.user && req.user.email) {
    requesterDbUser = await db.User.findOne({ where: { email: req.user.email } });
  }

  const sanitized = data.map(student => {
    const isSelf = requesterDbUser && requesterDbUser.id === student.user_id;
    const hasAdminAccess = requesterDbUser && isAdmin(requesterDbUser);
    
    const studentJson = student.toJSON();

    // Hide sensitive personal data from User relation
    if (studentJson.User) {
      if (!isSelf && !hasAdminAccess) {
        delete studentJson.User.cedula;
        delete studentJson.User.fecha_nacimiento;
        delete studentJson.User.genero;
      }
    }

    // Hide scholarship level in general listings unless self or admin
    if (!isSelf && !hasAdminAccess) {
      delete studentJson.nivel_beca;
    }

    return studentJson;
  });

  res.status(200).json(sanitized);
});

exports.findById = asyncHandler(async (req, res) => {
  const student = await EstudianteService.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Not found' });

  // Requester DB user
  let requesterDbUser = null;
  if (req.user && req.user.email) {
    requesterDbUser = await db.User.findOne({ where: { email: req.user.email } });
  }

  const isSelf = requesterDbUser && requesterDbUser.id === student.user_id;
  const hasAdminAccess = requesterDbUser && isAdmin(requesterDbUser);

  // Check if exalumno has accepted connection with the student
  let hasConnectionAccess = false;
  if (requesterDbUser && requesterDbUser.tipo === 'EXALUMNO') {
    const conn = await db.Connection.findOne({
      where: {
        [Op.or]: [
          { sender_id: requesterDbUser.id, receiver_id: student.user_id },
          { sender_id: student.user_id, receiver_id: requesterDbUser.id }
        ],
        status: 'accepted'
      }
    });
    if (conn) {
      hasConnectionAccess = true;
    }
  }

  const studentJson = student.toJSON();

  // Hide sensitive personal data
  if (studentJson.User) {
    if (!isSelf && !hasAdminAccess) {
      delete studentJson.User.cedula;
      delete studentJson.User.fecha_nacimiento;
      delete studentJson.User.genero;
    }
  }

  // Hide scholarship data unless self, admin, or accepted exalumno
  if (!isSelf && !hasAdminAccess && !hasConnectionAccess) {
    delete studentJson.nivel_beca;
  }

  res.status(200).json(studentJson);
});

exports.create = asyncHandler(async (req, res) => {
  let requesterDbUser = null;
  if (req.user && req.user.email) {
    requesterDbUser = await db.User.findOne({ where: { email: req.user.email } });
  }

  if (!requesterDbUser) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const hasAdminAccess = isAdmin(requesterDbUser);
  const isSelf = requesterDbUser.id === req.body.user_id;

  if (!isSelf && !hasAdminAccess) {
    return res.status(403).json({ message: 'No autorizado para crear este perfil' });
  }

  const data = await EstudianteService.create(req.body);
  res.status(201).json(data);
});

exports.update = asyncHandler(async (req, res) => {
  let requesterDbUser = null;
  if (req.user && req.user.email) {
    requesterDbUser = await db.User.findOne({ where: { email: req.user.email } });
  }

  if (!requesterDbUser) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const isSelf = requesterDbUser.id === req.params.id;
  const hasAdminAccess = isAdmin(requesterDbUser);

  if (!isSelf && !hasAdminAccess) {
    return res.status(403).json({ message: 'No autorizado para actualizar este perfil' });
  }

  const data = await EstudianteService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.delete = asyncHandler(async (req, res) => {
  let requesterDbUser = null;
  if (req.user && req.user.email) {
    requesterDbUser = await db.User.findOne({ where: { email: req.user.email } });
  }

  if (!requesterDbUser) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const isSelf = requesterDbUser.id === req.params.id;
  const hasAdminAccess = isAdmin(requesterDbUser);

  if (!isSelf && !hasAdminAccess) {
    return res.status(403).json({ message: 'No autorizado para eliminar este perfil' });
  }

  const deleted = await EstudianteService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});
