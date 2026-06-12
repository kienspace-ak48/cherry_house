const clientAuthService = require('./clientAuth.service');

async function sendRegisterOtp(req, res) {
  try {
    const data = await clientAuthService.sendRegisterOtp(req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function verifyRegisterOtp(req, res) {
  try {
    const data = await clientAuthService.verifyRegisterOtp(req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const data = await clientAuthService.loginClient(email, password);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function refresh(req, res) {
  try {
    const refreshToken = req.body?.refreshToken;
    const data = await clientAuthService.refreshSession(refreshToken);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      code: error.statusCode === 401 ? 'REFRESH_TOKEN_INVALID' : undefined,
    });
  }
}

async function logout(req, res) {
  try {
    const refreshToken = req.body?.refreshToken;
    await clientAuthService.logout(refreshToken);
    res.json({ success: true, data: { ok: true } });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

function googleStart(req, res) {
  try {
    const url = clientAuthService.getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    const frontend = clientAuthService.getFrontendUrl(req);
    res.redirect(`${frontend}/register?error=${encodeURIComponent(error.message)}`);
  }
}

async function googleCallback(req, res) {
  const frontend = clientAuthService.getFrontendUrl(req);
  try {
    const code = req.query.code;
    if (!code) throw new Error('Thiếu mã xác thực Google');
    const session = await clientAuthService.handleGoogleCallback(code);
    const params = new URLSearchParams({
      token: session.accessToken || session.token,
      refreshToken: session.refreshToken || '',
      user: JSON.stringify(session.user),
    });
    res.redirect(`${frontend}/oauth/callback?${params.toString()}`);
  } catch (error) {
    res.redirect(`${frontend}/register?error=${encodeURIComponent(error.message)}`);
  }
}

async function googleMobile(req, res) {
  try {
    const { idToken } = req.body;
    const data = await clientAuthService.handleGoogleMobile(idToken);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function me(req, res) {
  try {
    const data = await clientAuthService.getMe(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function updateMe(req, res) {
  try {
    const data = await clientAuthService.updateMe(req.user.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const data = await clientAuthService.changePassword(req.user.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = {
  sendRegisterOtp,
  verifyRegisterOtp,
  login,
  refresh,
  logout,
  googleStart,
  googleCallback,
  googleMobile,
  me,
  updateMe,
  changePassword,
};
