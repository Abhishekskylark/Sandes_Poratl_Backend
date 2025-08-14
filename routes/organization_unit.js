// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/organization_unitController');

// router.get('/', controller.getAll);
// router.post('/', controller.create);
// router.put('/:gu_id', controller.update);
// router.delete('/:id', controller.remove);

// module.exports = router;



const express = require('express');
const router = express.Router();
const controller = require('../controllers/organization_unitController');

// NOTE: roles check controller ke andar handle ho raha hai.
// Agar baad me middleware chahiye ho to asani se add kar sakte ho.

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:gu_id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

