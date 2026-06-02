const express = require('express');
const promoCodeController = require('../controllers/promoCode.controller');

const router = express.Router();

router.get('/code/:code', promoCodeController.getByCode);
router.get('/', promoCodeController.list);
router.get('/:id', promoCodeController.getById);
router.post('/', promoCodeController.create);
router.patch('/:id', promoCodeController.update);
router.delete('/:id', promoCodeController.remove);

module.exports = router;
