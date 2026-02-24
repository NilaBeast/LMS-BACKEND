const router = require("express").Router();

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const ctrl = require("../controllers/digitalFile.controller");


/* ================= MAIN ================= */

router.post(
  "/",
  protect,
  upload.single("banner"),
  ctrl.createDigitalFile
);

router.get("/my", protect, ctrl.getMyDigitalFiles);

router.get("/:id", protect, ctrl.getDigitalFile);

router.put(
  "/:id",
  protect,
  upload.single("banner"),
  ctrl.updateDigitalFile
);

router.delete("/:id", protect, ctrl.deleteDigitalFile);


/* ==================================================
   ================= MANAGE =========================
   ================================================== */

/* ================= CONTENT ================= */
router.post(
  "/content/reorder",
  protect,
  ctrl.reorderContents
);
/* CREATE CONTENT */
router.post(
  "/:id/content",
  protect,
  upload.single("file"),
  ctrl.addContent
);

/* ✅ GET CONTENT LIST */
router.get(
  "/:id/content",
  protect,
  ctrl.getContents
);

/* DELETE CONTENT */
router.delete(
  "/content/:contentId",
  protect,
  ctrl.deleteContent
);

/* ✅ UPDATE CONTENT (NEW) */
router.put(
  "/content/:contentId",
  protect,
  upload.fields([
    { name: "file", maxCount: 1 },    // main file
    { name: "banner", maxCount: 1 },  // banner image
  ]),
  ctrl.updateContent
);


/* ================= AUDIENCE ================= */

router.get(
  "/:id/audience",
  protect,
  ctrl.getBuyers
);

module.exports = router;