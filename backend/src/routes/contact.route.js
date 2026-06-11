const express = require('express');
const contactMessageController = require('../controllers/contactMessage.controller');

const router = express.Router();

router.post('/', contactMessageController.submit);

module.exports = router;
