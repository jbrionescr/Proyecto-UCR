const express = require('express');
const router = express.Router();

// 🔐 Auth (registro, login, magic link)
router.use('/auth', require('./auth.routes'));

// 🛡️ Admin (KPIs, moderación)
router.use('/admin', require('./admin.routes'));

// ─── Entidades ─────────────────────────────────────────────────────────────
router.use('/users', require('./user.routes'));
router.use('/exalumnos', require('./exalumno.routes'));
router.use('/estudiantes', require('./estudiante.routes'));
router.use('/matches', require('./match.routes'));
router.use('/donaciones', require('./donacion.routes'));
router.use('/reportes-perfil', require('./reporteperfil.routes'));
router.use('/curriculum', require('./curriculum.routes'));
router.use('/curriculum-experiencia', require('./curriculumexperiencia.routes'));
router.use('/curriculum-certificacion', require('./curriculumcertificacion.routes'));
router.use('/posiciones', require('./posicion.routes'));
router.use('/curriculum-versiones', require('./curriculumversion.routes'));
router.use('/aplicaciones', require('./aplicacion.routes'));
router.use('/connections', require('./connection.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/messages',     require('./message.routes'));

router.use('/solicitudes', require('./solicitudes.routes'));

router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
