const express = require('express');
const router = express.Router();
const controller = require('../controllers/connection.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Protect all connections endpoints
router.use(verifyToken);

router.post('/', controller.sendRequest);
router.get('/pending', controller.getPendingReceived);
router.get('/sent', controller.getSent);
router.get('/active', controller.getActiveConnections);
router.put('/:id/accept', controller.acceptRequest);
router.put('/:id/reject', controller.rejectRequest);
router.put('/:id/cancel', controller.cancelRequest);
router.delete('/:id', controller.deleteConnection);

module.exports = router;
