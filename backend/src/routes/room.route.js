const express = require('express');
const roomController = require('../controllers/room.controller');

const router = express.Router();

// Static paths must come before "/:id" or "add" is treated as an id.

router.post('/', roomController.create);

router.get('/add', roomController.create);

router.patch('/:id', roomController.update);
router.delete('/:id', roomController.remove);
router.get('/:id', roomController.getById);
router.get('/', roomController.list);

module.exports = router;
