const express = require('express');
const amenityController = require('../controllers/amenity.controller');

const router = express.Router();

router.get('/', amenityController.list);
router.get('/:id', amenityController.getById);
router.post('/', amenityController.create);
router.patch('/:id', amenityController.update);
router.delete('/:id', amenityController.remove);

module.exports = router;
