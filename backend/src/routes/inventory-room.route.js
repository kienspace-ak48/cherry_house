const express = require('express');
const inventoryRoomController = require('../controllers/inventoryRoom.controller');

const router = express.Router();

router.get('/', inventoryRoomController.list);
router.get('/:id', inventoryRoomController.getById);
router.post('/', inventoryRoomController.create);
router.patch('/:id', inventoryRoomController.update);
router.delete('/:id', inventoryRoomController.remove);

module.exports = router;
