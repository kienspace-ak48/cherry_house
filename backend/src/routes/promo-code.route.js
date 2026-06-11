const express = require('express');
const promoCodeController = require('../controllers/promoCode.controller');

const router = express.Router();

/** Public — preview giảm giá tại checkout */
router.post('/validate', promoCodeController.validate);

module.exports = router;
