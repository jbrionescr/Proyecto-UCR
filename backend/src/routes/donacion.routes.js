const express = require('express');
const router = express.Router();
const controller = require('../controllers/donacion.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/',     verifyToken, requireRole('ADMIN', 'EXALUMNO'), controller.findAll);
router.get('/:id',  verifyToken, requireRole('ADMIN', 'EXALUMNO'), controller.findById);
router.post('/',    verifyToken, requireRole('EXALUMNO'),           controller.create);
router.put('/:id',  verifyToken, requireRole('ADMIN'),              controller.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'),            controller.delete);

module.exports = router;
