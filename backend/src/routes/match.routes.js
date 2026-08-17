const express = require('express');
const router  = express.Router();
const c       = require('../controllers/match.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

// Rutas específicas (deben ir antes de /:id para evitar conflictos)
router.get('/estudiante/:estudianteId', verifyToken, c.findByEstudiante);
router.get('/exalumno/:exalumnoId',     verifyToken, c.findByExalumno);

// Oferta directa del exalumno
router.post('/ofrecer-apoyo', verifyToken, requireRole('EXALUMNO'), c.ofrecerApoyo);

// CRUD base
router.get('/',     verifyToken, c.findAll);
router.get('/:id',  verifyToken, c.findById);
router.post('/',    verifyToken, c.create);
router.put('/:id',  verifyToken, requireRole('ADMIN'), c.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), c.delete);

// Transiciones de estado
router.patch('/:id/contactar', verifyToken, c.contactar); // SUGERIDO   → CONTACTADO
router.patch('/:id/aceptar',   verifyToken, c.aceptar);   // CONTACTADO → ACTIVO
router.patch('/:id/rechazar',  verifyToken, c.rechazar);  // CONTACTADO → CERRADO
router.patch('/:id/cerrar',    verifyToken, c.cerrar);    // ACTIVO     → CERRADO

module.exports = router;
