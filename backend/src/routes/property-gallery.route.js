const express = require('express');
const propertyGalleryController = require('../controllers/propertyGallery.controller');

const router = express.Router();

router.get('/', propertyGalleryController.list);
router.get('/:id', propertyGalleryController.getById);
router.post('/', propertyGalleryController.create);
router.patch('/:id', propertyGalleryController.update);
router.delete('/:id', propertyGalleryController.remove);

module.exports = router;
