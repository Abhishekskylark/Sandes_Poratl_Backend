// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/designationController');

// router.get('/', controller.getAll);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.remove);

// module.exports = router;



const express = require('express');
const router = express.Router();
const controller = require('../controllers/designationController');

// middleware to set req.user with roles
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', controller.getConfig);
router.get('/list', controller.list);
router.post('/', controller.create);
router.put('/:guid', controller.update);
router.delete('/:guid', controller.remove);

module.exports = router;
