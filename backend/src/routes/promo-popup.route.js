const express = require('express');
const promoPopupController = require('../controllers/promoPopup.controller');

const router = express.Router();

router.get('/', promoPopupController.getConfig);

module.exports = router;
