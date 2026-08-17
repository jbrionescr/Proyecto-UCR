const db = require('../models');

/**
 * Middleware de control de acceso por rol.
 * Debe ejecutarse DESPUÉS de verifyToken.
 * @param {...string} roles - Roles permitidos: 'ESTUDIANTE', 'EXALUMNO', 'ADMINISTRADOR'
 */
exports.requireRole = (...roles) => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // Buscar el usuario en nuestra BD para obtener el tipo/rol
    const user = await db.User.findOne({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(403).json({ message: 'Usuario no encontrado en el sistema' });
    }

    if (!user.activo) {
      return res.status(403).json({ message: 'Cuenta suspendida o inactiva' });
    }

    const userRole = (user.tipo || '').toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Acceso denegado',
        required: allowedRoles,
        current: userRole,
      });
    }

    // Adjuntar el registro completo del usuario para uso posterior
    req.dbUser = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error en middleware de rol', error: error.message });
  }
};
