const express = require('express');
const router = express.Router();
const controller = require('../controllers/curriculumexperiencia.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Descomenta verifyToken si quieres proteger las rutas
router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', /*verifyToken,*/ controller.create);
router.put('/:id', /*verifyToken,*/ controller.update);
router.delete('/:id', /*verifyToken,*/ controller.delete);

module.exports = router;
