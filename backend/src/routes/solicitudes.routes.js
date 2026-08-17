const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes.controller');

// Rutas para simular la aceptación o rechazo de solicitudes
router.patch('/:id/accept', solicitudesController.acceptRequest);
router.patch('/:id/reject', solicitudesController.rejectRequest);

module.exports = router;
