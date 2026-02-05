const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");

const ctrl = require("../controllers/bookmark.controller");

/* SAVE / UPDATE */
router.post("/", protect, ctrl.saveBookmark);

/* GET */
router.get("/:courseId", protect, ctrl.getMyBookmark);

/* CLEAR */
router.delete("/:courseId", protect, ctrl.clearBookmark);

module.exports = router;
