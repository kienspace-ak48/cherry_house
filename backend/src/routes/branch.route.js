const express = require('express');
const branchController = require('../controllers/branch.controller');
const catalogController = require('../controllers/catalog.controller');

const router = express.Router();

router.get('/', branchController.list);
router.get('/property/:propertyId/code/:code', branchController.getByPropertyAndCode);
router.get('/:branchId/rooms', catalogController.listBranchRooms);
router.get('/:id', branchController.getById);
router.post('/', branchController.create);
router.patch('/:id', branchController.update);
router.delete('/:id', branchController.remove);

module.exports = router;
