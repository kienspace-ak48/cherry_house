const promoCodeService = require('../services/promoCode.service');
const { sendApiError } = require('../utils/http');

async function validate(req, res) {
  try {
    const code = typeof req.body?.code === 'string' ? req.body.code : '';
    const subtotalVnd = Number(req.body?.subtotalVnd);
    if (!code.trim()) {
      return res.status(400).json({ success: false, message: 'code is required' });
    }
    if (!Number.isFinite(subtotalVnd) || subtotalVnd < 0) {
      return res.status(400).json({ success: false, message: 'subtotalVnd must be a non-negative number' });
    }
    const data = await promoCodeService.validateAndApply(code, subtotalVnd);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = { validate };
