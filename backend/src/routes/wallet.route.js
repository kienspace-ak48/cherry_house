const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const walletController = require('../controllers/wallet.controller');

const router = express.Router();

router.use(authMiddleware);
router.get('/', walletController.summary);
router.get('/transactions', walletController.transactions);

module.exports = router;
