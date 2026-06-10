const express = require('express');
const chatBotController = require('../controllers/chatBot.controller');

const router = express.Router();

router.post('/message', chatBotController.sendMessage);

module.exports = router;
