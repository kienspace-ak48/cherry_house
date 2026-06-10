const chatBotService = require('../services/chatBot.service');
const { sendApiError } = require('../utils/http');

async function sendMessage(req, res) {
  try {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const data = await chatBotService.chat({ message, history });
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  sendMessage,
};
