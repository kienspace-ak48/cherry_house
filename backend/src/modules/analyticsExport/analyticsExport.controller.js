const analyticsExportService = require('./analyticsExport.service');

async function downloadAnalytics(req, res, next) {
  try {
    const { buffer, filename } = await analyticsExportService.exportAnalyticsBuffer(
      req.query,
      req.admin || req.user,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  downloadAnalytics,
};
