const authService = require('./auth.service');
const adminAuthService = require('./adminAuth.service');
const isProduction = process.env.NODE_ENV === 'production';

const ADMIN_COOKIE = 'token';

function cookieMaxAgeMs() {
  const raw = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1h';
  if (raw.endsWith('h')) return Number(raw.slice(0, -1)) * 60 * 60 * 1000;
  if (raw.endsWith('m')) return Number(raw.slice(0, -1)) * 60 * 1000;
  if (raw.endsWith('d')) return Number(raw.slice(0, -1)) * 24 * 60 * 60 * 1000;
  return 60 * 60 * 1000;
}

const authController = {
  async register(req, res) {
    try {
      const user = await authService.registerClient(req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  loginForm(req, res) {
    res.render('pages/login', { layout: false });
  },

  /** Admin SSR — cookie httpOnly, bảng admins */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await adminAuthService.loginAdminForCookie(email, password);
      res.cookie(ADMIN_COOKIE, result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: cookieMaxAgeMs(),
        path: '/',
      });
      res.redirect('/admin');
    } catch (error) {
      res.render('pages/login', { layout: false, message: error.message });
    }
  },

  /** Admin JSON API (nếu dùng localStorage panel) */
  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      const data = await adminAuthService.loginAdmin(email, password);
      res.json({ success: true, data });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  logout(req, res) {
    res.clearCookie(ADMIN_COOKIE, { path: '/' });
    res.redirect('/auth/login');
  },
};

module.exports = authController;
