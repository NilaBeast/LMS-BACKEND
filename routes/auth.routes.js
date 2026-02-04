const express = require("express");
const {googleAuth, emailRegister, emailLogin} = require("../controllers/auth.controller");
const router = express.Router();
const {protect} = require("../middlewares/auth.middleware");

router.post("/google", googleAuth);
router.post("/register", emailRegister);
router.post("/login", emailLogin);

router.get("/me", protect, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    photo: req.user.photo,
    provider: req.user.provider,
    role: req.user.role,
  });
});


module.exports = router;