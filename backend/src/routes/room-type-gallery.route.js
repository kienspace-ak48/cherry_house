const express = require('express');
const roomTypeGalleryController = require('../controllers/roomTypeGallery.controller');

const router = express.Router();

router.get('/', roomTypeGalleryController.list);
router.get('/:id', roomTypeGalleryController.getById);
router.post('/', roomTypeGalleryController.create);
router.patch('/:id', roomTypeGalleryController.update);
router.delete('/:id', roomTypeGalleryController.remove);

module.exports = router;
