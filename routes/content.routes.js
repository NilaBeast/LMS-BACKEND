const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const uploadContent = require("../middlewares/contentUpload.middleware");
const {
  createContent,
  reorderContents,
  getContentsByChapter,
  deleteContent,
} = require("../controllers/content.controller");

router.post(
  "/:chapterId",
  protect,
  uploadContent.single("file"),
  createContent
);

router.get("/chapter/:chapterId", protect, getContentsByChapter);
router.patch("/reorder", protect, reorderContents);
router.delete("/:id", protect, deleteContent);

module.exports = router;