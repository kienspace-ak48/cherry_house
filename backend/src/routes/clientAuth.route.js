const express = require('express');
const clientAuthController = require('../auth/clientAuth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register/send-otp', clientAuthController.sendRegisterOtp);
router.post('/register/verify-otp', clientAuthController.verifyRegisterOtp);
router.post('/login', clientAuthController.login);
router.post('/forgot-password/request', clientAuthController.requestPasswordReset);
router.post('/forgot-password/confirm', clientAuthController.confirmPasswordReset);
router.post('/refresh', clientAuthController.refresh);
router.post('/logout', clientAuthController.logout);
router.get('/google', clientAuthController.googleStart);
router.get('/google/callback', clientAuthController.googleCallback);
router.post('/google/mobile', clientAuthController.googleMobile);
router.get('/me', authMiddleware, clientAuthController.me);
router.patch('/me', authMiddleware, clientAuthController.updateMe);
router.post('/change-password', authMiddleware, clientAuthController.changePassword);
router.post('/change-email/request', authMiddleware, clientAuthController.requestEmailChange);
router.post('/change-email/confirm', authMiddleware, clientAuthController.confirmEmailChange);

module.exports = router;
