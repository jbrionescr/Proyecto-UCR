const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/register/student
 * Registro de estudiante con correo @ucr.ac.cr
 */
exports.registerStudent = asyncHandler(async (req, res) => {
  const result = await AuthService.registerStudent(req.body);
  res.status(201).json(result);
});

/**
 * POST /api/auth/register/alumni
 * Registro de exalumno (cualquier correo)
 */
exports.registerAlumni = asyncHandler(async (req, res) => {
  const result = await AuthService.registerAlumni(req.body);
  res.status(201).json(result);
});

/**
 * POST /api/auth/login
 * Login con correo y contraseña
 */
exports.login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  res.status(200).json(result);
});

/**
 * POST /api/auth/resend-link
 * Reenviar magic link de verificación
 */
exports.resendMagicLink = asyncHandler(async (req, res) => {
  const result = await AuthService.resendMagicLink(req.body);
  res.status(200).json(result);
});

/**
 * POST /api/auth/forgot-password
 * Recuperación de contraseña por correo
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body);
  res.status(200).json(result);
});

/**
 * GET /api/auth/me
 * Obtener datos del usuario autenticado (requiere token)
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user);
  res.status(200).json(user);
});

/**
 * PATCH /api/auth/approve/:userId
 * Admin: aprobar perfil de exalumno
 */
exports.approveAlumni = asyncHandler(async (req, res) => {
  const result = await AuthService.approveAlumni(req.params.userId);
  res.status(200).json(result);
});

/**
 * Manejador central de errores personalizados del servicio de auth
 */
exports.handleAuthError = (err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }
  next(err);
};
