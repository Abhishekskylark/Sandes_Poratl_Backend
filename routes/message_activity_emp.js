const express = require('express');
const router = express.Router();
const controller = require('../controllers/message_activity_empController');

router.get('/', controller.getAll);
router.post('/', controller.create);

module.exports = router;
