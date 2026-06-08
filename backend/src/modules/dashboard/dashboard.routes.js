const express = require('express');
const adminAuthMiddleware = require('../../middleware/adminAuth.middleware');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

router.use(adminAuthMiddleware);
router.get('/overview', dashboardController.overview);

module.exports = router;
