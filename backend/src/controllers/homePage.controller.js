const homePageService = require('../services/homePage.service');
const { sendApiError } = require('../utils/http');

async function getConfig(req, res) {
  try {
    const data = await homePageService.getPublicConfig(req);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  getConfig,
};
