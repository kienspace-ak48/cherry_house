const express = require('express');
const roomTypeController = require('../controllers/roomType.controller');

const router = express.Router();

router.get('/', roomTypeController.list);
router.get('/slug/:slug', roomTypeController.getBySlug);
router.get('/:id', roomTypeController.getById);
router.post('/', roomTypeController.create);
router.patch('/:id', roomTypeController.update);
router.delete('/:id', roomTypeController.remove);

module.exports = router;
