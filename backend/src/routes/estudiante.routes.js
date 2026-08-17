const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudiante.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren token válido
router.get('/', verifyToken, controller.findAll);
router.get('/:id', verifyToken, controller.findById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;
