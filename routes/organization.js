const express = require('express');
const router = express.Router();
const controller = require('../controllers/organizationController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:gu_id', controller.update);
router.delete('/:gu_id', controller.remove);

module.exports = router;
