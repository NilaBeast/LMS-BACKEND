const router = require("express").Router();

const { protect } = require("../middlewares/auth.middleware");

const {
  buyDigitalFile,
} = require("../controllers/purchase.controller");

router.post("/", protect, buyDigitalFile);

module.exports = router;