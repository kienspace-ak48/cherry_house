const chatBotConfigService = require('../services/chatBotConfig.service');
const { renderAdminPage } = require('../utils/adminRender');

async function index(req, res) {
  try {
    const settings = await chatBotConfigService.getAdminSettings();
    renderAdminPage(req, res, 'admin/chatbot/index', {
      pageTitle: 'Chatbot AI',
      adminPage: 'chatbot',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Chatbot AI' },
      ],
      settings,
      placeholders: chatBotConfigService.PROMPT_PLACEHOLDERS,
      defaultPrompt: chatBotConfigService.buildDefaultSystemPrompt(),
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/chatbot/index', {
      pageTitle: 'Chatbot AI',
      adminPage: 'chatbot',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Chatbot AI' },
      ],
      settings: chatBotConfigService.buildDefaultSettings(),
      placeholders: chatBotConfigService.PROMPT_PLACEHOLDERS,
      defaultPrompt: chatBotConfigService.buildDefaultSystemPrompt(),
      flash: 'error',
      msg: error.message,
    });
  }
}

async function update(req, res) {
  try {
    await chatBotConfigService.updateSettings(req.body);
    res.redirect('/admin/chatbot?flash=saved');
  } catch (error) {
    res.redirect(
      `/admin/chatbot?flash=error&msg=${encodeURIComponent(error.message || 'Lưu thất bại')}`,
    );
  }
}

async function reset(req, res) {
  try {
    await chatBotConfigService.resetToDefaults();
    res.redirect('/admin/chatbot?flash=reset');
  } catch (error) {
    res.redirect(
      `/admin/chatbot?flash=error&msg=${encodeURIComponent(error.message || 'Reset thất bại')}`,
    );
  }
}

module.exports = {
  index,
  update,
  reset,
};
