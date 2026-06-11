const express = require('express');
const catalogController = require('../controllers/catalog.controller');

const router = express.Router();

/** Cơ sở lưu trú (public catalog cho React) */
router.get('/properties', catalogController.listProperties);
router.get('/properties/slug/:slug', catalogController.getPropertyBySlug);
router.get('/properties/:id', catalogController.getPropertyById);
router.get('/properties/:id/branches', catalogController.listPropertyBranches);

/** Chi nhánh */
router.get('/branches', catalogController.listBranches);
router.get('/branches/property/:propertyId/code/:code', catalogController.getBranchByPropertyAndCode);
router.get('/branches/:branchId/rooms', catalogController.listBranchRooms);
router.get('/branches/:id', catalogController.getBranchById);

/** Phòng (inventory) */
router.get('/rooms', catalogController.listRooms);
router.get('/rooms/detail', catalogController.getRoomDetail);
router.get('/rooms/:id', catalogController.getRoomById);

module.exports = router;
