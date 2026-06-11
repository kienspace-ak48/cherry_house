const adminAuthService = require('./adminAuth.service');
const isProduction = process.env.NODE_ENV === 'production';

const STAFF_COOKIE = 'token';

function cookieMaxAgeMs() {
  const raw =
    process.env.JWT_ADMIN_ACCESS_EXPIRES_IN
    || process.env.JWT_ACCESS_EXPIRES_IN
    || '3h';
  if (raw.endsWith('h')) return Number(raw.slice(0, -1)) * 60 * 60 * 1000;
  if (raw.endsWith('m')) return Number(raw.slice(0, -1)) * 60 * 1000;
  if (raw.endsWith('d')) return Number(raw.slice(0, -1)) * 24 * 60 * 60 * 1000;
  return 60 * 60 * 1000;
}

const staffAuthController = {
  loginForm(req, res) {
    const session = typeof req.query.session === 'string' ? req.query.session : '';
    let message = null;
    if (session === 'expired') {
      message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    } else if (session === 'disabled') {
      message = 'Tài khoản chưa được gắn cơ sở. Liên hệ quản trị viên.';
    } else if (session === 'invalid') {
      message = 'Tài khoản không có quyền nhân viên.';
    }
    res.render('staff/login', { layout: false, message });
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await adminAuthService.loginStaffForCookie(email, password);
      res.cookie(STAFF_COOKIE, result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: cookieMaxAgeMs(),
        path: '/',
      });
      res.redirect('/staff');
    } catch (error) {
      res.render('staff/login', { layout: false, message: error.message });
    }
  },

  logout(_req, res) {
    res.clearCookie(STAFF_COOKIE, { path: '/' });
    res.redirect('/staff/login');
  },
};

module.exports = staffAuthController;
