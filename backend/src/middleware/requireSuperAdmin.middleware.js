/** Chỉ super_admin — thao tác nhạy cảm (backup DB, …) */
function requireSuperAdmin(req, res, next) {
  const role = req.admin?.role || req.user?.role;
  if (role !== 'super_admin') {
    if (req.originalUrl?.startsWith('/api') || req.baseUrl?.startsWith('/api')) {
      return res.status(403).json({ success: false, message: 'Super admin required' });
    }
    return res.redirect('/admin');
  }
  return next();
}

module.exports = requireSuperAdmin;
