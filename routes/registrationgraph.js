const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/registrationgraphController');

router.get('/', getStats);

module.exports = router;
