const express = require('express');
const router = express.Router();
const controller = require('../controllers/masters_ministriesController');

router.get('/:id?', controller.getAll);
router.post('/', controller.create);

module.exports = router;