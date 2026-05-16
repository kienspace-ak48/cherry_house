const express = require('express');
const roomRoute = require('./room.route');

const router = express.Router();

router.get('/tests', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/rooms', roomRoute);

module.exports = router;
