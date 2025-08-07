const express = require('express');
const router = express.Router();
const controller = require('../controllers/organization_typeController');

router.get('/:code?', controller.getOrganizationTypes);
router.post('/', controller.create);

module.exports = router;