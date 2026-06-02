const CNAME = "auth.controller.js ";
const hashPassword = require("../utils/hashPassword.util");
const authService = require("./auth.service");
const { generateJWT } = require("../utils/generateJWT.util");
const isProduction = process.env.NODE_ENV === "production";

const authController = {
  async register(req, res) {
    // const {email, password} = req.body;
    const userData = {
      email: "admin2@gmail.com",
      password: "123",
      fullName: "admin 2",
      phone: "1234567890",
      membershipTier: "standard",
      isActive: true,
      role: "admin",
    };
    const user = await authService.register(userData);
    res.json({ success: true, data: user });
  },
  async loginForm(req, res) {
    res.render("pages/login", { layout: false });
  },
  /** Client (React): POST body → { token, user } — lưu token ở trình duyệt phía client */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      //   const { email, password } = req.query;
      console.log(email, password);
      const user = await authService.login(email, password);
      const token = await generateJWT({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 1, // 1 hour
      });
      //   res.json({
      //     success: true,
      //     data: { token },
      //   });
      res.redirect("/admin");
    } catch (error) {
      //   res.status(error.statusCode || 500).json({ success: false, message: error.message });
      // res.redirect('/auth/login');
      res.render("pages/login", { layout: false, message: error.message });
    }
  },

  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      const data = await authService.loginAdmin(email, password);
      res.json({ success: true, data });
    } catch (error) {
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  },

  logout(req, res) {
    res.clearCookie('token', { path: '/' });
    res.redirect('/auth/login');
  },
};

module.exports = authController;
