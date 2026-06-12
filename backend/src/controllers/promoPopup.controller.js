const promoPopupService = require('../services/promoPopup.service');
const { sendApiError } = require('../utils/http');

async function getConfig(req, res) {
  try {
    const data = await promoPopupService.getPublicConfig();
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  getConfig,
};
