
// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/masters_districtsController');

// router.get('/', controller.getAll);
// router.post('/', controller.create);

// module.exports = router;




const express = require('express');
const router = express.Router();
const controller = require('../controllers/masters_districtsController');


router.get('/', controller.getAll); // Handles both all & filtered by query
router.post('/', controller.create);

module.exports = router;
