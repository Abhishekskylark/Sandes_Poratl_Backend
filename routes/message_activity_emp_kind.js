const express = require('express');
const router = express.Router();
const controller = require('../controllers/message_activity_emp_kindController');

router.get('/', controller.getAll);
router.post('/', controller.create);

module.exports = router;
