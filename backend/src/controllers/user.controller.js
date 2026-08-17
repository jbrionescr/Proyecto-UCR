const UserService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const db = require('../models');
const { Op } = require('sequelize');

// Helper to check if a user is an administrator
function isAdmin(user) {
  return user && (user.tipo === 'ADMIN' || user.tipo === 'ADMINISTRADOR');
}

exports.findAll = asyncHandler(async (req, res) => {
  const data = await UserService.findAll();

  // Requester DB user
  let requesterDbUser = null;
  if (req.user && req.user.email) {
    requesterDbUser = await db.User.findOne({ where: { email: req.user.email } });
  }

  const sanitized = data.map(user => {
    const isSelf = requesterDbUser && requesterDbUser.id === user.id;
    const hasAdminAccess = requesterDbUser && isAdmin(requesterDbUser);
    
    const userJson = user.toJSON();

    // Hide sensitive personal data from public view
    if (!isSelf && !hasAdminAccess) {
      delete userJson.cedula;
      delete userJson.fecha_nacimiento;
      delete userJson.genero;
    }

    return userJson;
  });

  res.status(200).json(sanitized);
});

exports.findById = asyncHandler(async (req, res) => {
  const user = await UserService.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });

  // Requester DB user
  let requesterDbUser = null;
  if (req.user && req.user.email) {
    requesterDbUser = await db.User.findOne({ where: { email: req.user.email } });
  }

  const isSelf = requesterDbUser && requesterDbUser.id === user.id;
  const hasAdminAccess = requesterDbUser && isAdmin(requesterDbUser);

  const userJson = user.toJSON();

  // Hide sensitive personal data
  if (!isSelf && !hasAdminAccess) {
    delete userJson.cedula;
    delete userJson.fecha_nacimiento;
    delete userJson.genero;
  }

  // Hide scholarship data inside Estudiante relation if not authorized
  if (userJson.Estudiante) {
    let hasConnectionAccess = false;
    if (requesterDbUser && requesterDbUser.tipo === 'EXALUMNO') {
      const conn = await db.Connection.findOne({
        where: {
          [Op.or]: [
            { sender_id: requesterDbUser.id, receiver_id: user.id },
            { sender_id: user.id, receiver_id: requesterDbUser.id }
          ],
          status: 'accepted'
        }
      });
      if (conn) {
        hasConnectionAccess = true;
      }
    }

    if (!isSelf && !hasAdminAccess && !hasConnectionAccess) {
      delete userJson.Estudiante.nivel_beca;
    }
  }

  res.status(200).json(userJson);
});

exports.create = asyncHandler(async (req, res) => {
  // Creating users can be public during registration or performed by admin
  const data = await UserService.create(req.body);
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
    return res.status(403).json({ message: 'No autorizado para actualizar este usuario' });
  }

  const data = await UserService.update(req.params.id, req.body);
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
    return res.status(403).json({ message: 'No autorizado para eliminar este usuario' });
  }

  const deleted = await UserService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});
