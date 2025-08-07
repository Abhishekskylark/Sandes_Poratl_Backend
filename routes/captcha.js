// routes/captcha.js
const express = require('express');
const router = express.Router();
const captchaController = require('../controllers/captchaController');

router.get('/', captchaController.getRandomCaptcha);
router.post('/verify', captchaController.verifyCaptcha);

module.exports = router;
