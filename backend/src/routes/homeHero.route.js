const express = require('express');
const homeHeroController = require('../controllers/homeHero.controller');
const homePageController = require('../controllers/homePage.controller');

const router = express.Router();

router.get('/hero', homeHeroController.getConfig);
router.get('/sections', homePageController.getConfig);

module.exports = router;
