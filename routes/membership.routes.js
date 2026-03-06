const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");

const {
  createMembership,
  updateMembership,
  deleteMembership,
  getMyMemberships,
  getMembershipById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  toggleApproval,
  getMembershipOptions,
} = require("../controllers/membership.controller");

const {getMembershipPurchases} = require("../controllers/membershipPurchase.controller");

/* ================= GET ROUTES FIRST ================= */

router.get("/my", protect, getMyMemberships);
router.get("/options", protect, getMembershipOptions);
router.get("/:id", protect, getMembershipById);

/* ================= CREATE ================= */

router.post(
  "/",
  protect,
  upload.single("cover"),
  createMembership
);

/* ================= UPDATE ================= */

router.patch(
  "/:id",
  protect,
  upload.single("cover"),
  updateMembership
);

/* ================= DELETE ================= */

router.delete("/:id", protect, deleteMembership);

/* ================= QUESTIONS ================= */

router.post("/:id/questions", protect, addQuestion);
router.patch("/questions/:id", protect, updateQuestion);
router.delete("/questions/:id", protect, deleteQuestion);

/* ================= APPROVAL ================= */

router.patch("/:id/approval", protect, toggleApproval);



/* ================= PURCHASES ================= */

router.get("/:id/purchases", protect, getMembershipPurchases);

module.exports = router;