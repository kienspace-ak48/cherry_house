const express = require('express');
const propertyController = require('../controllers/property.controller');

const router = express.Router();

router.get('/', propertyController.list);
router.get('/slug/:slug', propertyController.getBySlug);
router.get('/:id/branches', propertyController.listBranches);
router.get('/:id', propertyController.getById);
router.post('/', propertyController.create);
router.patch('/:id', propertyController.update);
router.delete('/:id', propertyController.remove);

module.exports = router;
