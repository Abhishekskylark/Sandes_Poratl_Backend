const express = require('express');
const router = express.Router();
const controller = require('../controllers/app_message_activityController');

router.get('/', controller.getAll);
router.post('/', controller.create);

module.exports = router;
