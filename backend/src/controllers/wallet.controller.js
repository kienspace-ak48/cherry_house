const userWalletService = require('../services/userWallet.service');
const { sendApiError } = require('../utils/http');

async function summary(req, res) {
  try {
    const data = await userWalletService.getWalletSummary(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function transactions(req, res) {
  try {
    const data = await userWalletService.listTransactions(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = { summary, transactions };
