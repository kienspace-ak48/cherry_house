const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const chatBotController = require('../controllers/chatBot.controller');

const router = express.Router();

router.get('/config', authMiddleware, chatBotController.getConfig);
router.post('/message', authMiddleware, chatBotController.sendMessage);

module.exports = router;
