const express = require('express');
const router = express.Router();
const controller = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Protect all notifications endpoints
router.use(verifyToken);

router.get('/', controller.getAllByUser);
router.get('/unread/count', controller.getUnreadCount);
router.get('/unread', controller.getUnreadByUser);
router.put('/:id/read', controller.markAsRead);
router.put('/read-all', controller.markAllAsRead);

module.exports = router;
