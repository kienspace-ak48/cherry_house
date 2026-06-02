const express = require('express');
const branchMapPinController = require('../controllers/branchMapPin.controller');

const router = express.Router();

router.get('/', branchMapPinController.list);
router.get('/:id', branchMapPinController.getById);
router.post('/', branchMapPinController.create);
router.patch('/:id', branchMapPinController.update);
router.delete('/:id', branchMapPinController.remove);

module.exports = router;
