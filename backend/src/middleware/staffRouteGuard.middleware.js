/** Nhân viên (staff) chỉ được truy cập module đặt phòng */
const STAFF_ALLOWED = [
  /^\/bookings(\/|$)/,
];

function staffRouteGuard(req, res, next) {
  const role = req.admin?.role || req.user?.role;
  if (role !== 'staff') return next();

  const path = req.path || '';
  if (path === '/' || path === '') {
    return res.redirect('/admin/bookings/reception');
  }

  if (STAFF_ALLOWED.some((pattern) => pattern.test(path))) {
    return next();
  }

  return res.redirect('/admin/bookings/reception?flash=forbidden');
}

module.exports = staffRouteGuard;
