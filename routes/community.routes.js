const router = require("express").Router();

const controller = require("../controllers/community.controller");
const memberController = require("../controllers/communityMember.controller");

const { protect } = require("../middlewares/auth.middleware");

/* GET COMMUNITY */
router.get("/:businessId", protect, controller.getCommunity);

/* UPDATE SETTINGS */
router.put("/:communityId/settings", protect, controller.updateSettings);

/* GET MEMBERS WITH FILTER */
router.get("/:communityId/members", protect, memberController.getMembers);

module.exports = router;