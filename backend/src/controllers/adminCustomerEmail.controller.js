const customerEmailService = require('../services/customerEmail.service');

async function index(req, res) {
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return res.redirect(`/admin/users${qs}`);
}

async function sendAjax(req, res) {
  try {
    const { userIds, emailType, customPayload, promoCodeId } = req.body || {};
    const summary = await customerEmailService.sendBulk({
      userIds,
      emailType,
      customPayload,
      promoCodeId,
    });
    res.json({ success: true, ...summary });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Gửi email thất bại',
    });
  }
}

module.exports = {
  index,
  sendAjax,
};
