const adminAccountService = require('../services/adminAccount.service');

/** super_admin và admin — quản lý tài khoản hệ thống */
function requireAdminManager(req, res, next) {
  if (!adminAccountService.canManageAccounts(req.admin || req.user)) {
    if (req.originalUrl?.startsWith('/api') || req.baseUrl?.startsWith('/api')) {
      return res.status(403).json({ success: false, message: 'Admin manager required' });
    }
    return res.redirect('/admin/bookings?flash=forbidden');
  }
  return next();
}

module.exports = requireAdminManager;
