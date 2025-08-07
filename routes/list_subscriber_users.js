const express = require('express');
const router = express.Router();
const controller = require('../controllers/list_subscriber_usersController');

router.get('/', controller.getAll);
router.post('/', controller.create);

module.exports = router;
