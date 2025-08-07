const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/messageGraphController');

router.get('/', getStats);

module.exports = router;
