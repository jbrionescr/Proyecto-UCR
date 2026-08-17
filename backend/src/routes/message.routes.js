const express = require('express');
const router  = express.Router({ mergeParams: true });
const c       = require('../controllers/message.controller');

router.get( '/:matchId', c.getMessages);
router.post('/:matchId', c.sendMessage);

module.exports = router;
