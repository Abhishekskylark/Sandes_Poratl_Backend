const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/activeUserGroupController');

router.get('/', getStats);

module.exports = router;
