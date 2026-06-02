const express = require('express');
const router = express.Router();

const authController = require('../auth/auth.controller');


router.get('/register', authController.register);
router.get('/login', authController.loginForm);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/admin/login', authController.loginAdmin);

module.exports = router;
