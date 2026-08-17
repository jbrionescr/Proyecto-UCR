const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

// ─── Rutas públicas ─────────────────────────────────────────────────────────

/** POST /api/auth/register/student — Registro de estudiante (@ucr.ac.cr) */
router.post('/register/student', authController.registerStudent);

/** POST /api/auth/register/alumni — Registro de exalumno */
router.post('/register/alumni', authController.registerAlumni);

/** POST /api/auth/login — Login con correo y contraseña */
router.post('/login', authController.login);

/** POST /api/auth/resend-link — Reenviar magic link */
router.post('/resend-link', authController.resendMagicLink);

/** POST /api/auth/forgot-password — Recuperación de contraseña */
router.post('/forgot-password', authController.forgotPassword);

// ─── Rutas protegidas (requieren token) ────────────────────────────────────

/** GET /api/auth/me — Datos del usuario autenticado */
router.get('/me', verifyToken, authController.getMe);

/** PATCH /api/auth/approve/:userId — Admin: aprobar exalumno */
router.patch(
  '/approve/:userId',
  verifyToken,
  requireRole('ADMINISTRADOR'),
  authController.approveAlumni
);

module.exports = router;
