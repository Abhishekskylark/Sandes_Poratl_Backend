const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/userGraphController');

router.get('/', getStats);

module.exports = router;
