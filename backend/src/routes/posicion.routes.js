const express = require('express');
const router = express.Router();
const controller = require('../controllers/posicion.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/',     verifyToken, controller.findAll);
router.get('/:id',  verifyToken, controller.findById);
router.post('/',    verifyToken, requireRole('EXALUMNO'),          controller.create);
router.put('/:id',  verifyToken, requireRole('EXALUMNO'),          controller.update);
router.delete('/:id', verifyToken, requireRole('EXALUMNO', 'ADMIN'), controller.delete);

module.exports = router;
