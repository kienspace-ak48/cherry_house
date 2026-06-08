const dashboardService = require('./dashboard.service');
const { sendApiError } = require('../../utils/http');

async function overview(req, res) {
  try {
    const period = typeof req.query.period === 'string' ? req.query.period : 'week';
    const data = await dashboardService.getDashboardOverview(period);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  overview,
};
