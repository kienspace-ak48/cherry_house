const express = require('express');
const seoController = require('../controllers/seo.controller');

const router = express.Router();

router.get('/config', seoController.getConfig);

module.exports = router;
