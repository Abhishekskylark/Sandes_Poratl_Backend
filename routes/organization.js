// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/organizationController');

// router.get('/', controller.getAll);
// router.post('/', controller.create);
// router.put('/:gu_id', controller.update);
// router.delete('/:gu_id', controller.remove);

// module.exports = router;




const express = require("express");
const router = express.Router();
const orgCtrl = require("../controllers/organizationController");

// endpoints
router.get("/", orgCtrl.index);
router.get("/list", orgCtrl.list);
router.post("/insert", orgCtrl.insert);
router.put("/update/:gu_id", orgCtrl.update);
router.delete("/delete/:gu_id", orgCtrl.deleteConfirm);

router.post("/getOsByMinistry", orgCtrl.getOsByMinistry);
router.post("/getDDDByOrganization", orgCtrl.getDDDByOrganization);
router.post("/getOrganizations", orgCtrl.getOrganizations);

router.get("/listOfOrganizations", orgCtrl.listOfOrganizations);
router.get("/emailTotalMessagesOrganizationWise", orgCtrl.emailTotalMessagesOrganizationWise);

module.exports = router;

