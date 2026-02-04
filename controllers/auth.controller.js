const admin = require("../config/firebase");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");


/**
 * GOOGLE AUTH
 */
exports.googleAuth = async (req, res) => {
  const { idToken, mode } = req.body;

  if (!idToken || !mode) {
    return res.status(400).json({ message: "idToken and mode required" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    let user = await User.findOne({ where: { firebaseUid: uid } });
    let emailUser = await User.findOne({ where: { email } });

    if (mode === "register") {
      if (emailUser) {
        return res.status(409).json({
          message: "User already exists. Please login.",
        });
      }

      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        photo: picture,
        provider: "google",
      });
    }

    if (mode === "login") {
      if (!user && !emailUser) {
        return res.status(404).json({
          message: "No account found. Please register.",
        });
      }

      if (!user && emailUser) {
        emailUser.firebaseUid = uid;
        emailUser.provider = "google";
        emailUser.name ||= name;
        emailUser.photo ||= picture;
        await emailUser.save();
        user = emailUser;
      }
    }

    if (!user) {
      return res.status(500).json({ message: "User resolution failed" });
    }

    const token = generateToken(user);
    res.json({ user, token });

  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};


/**
 * EMAIL REGISTER
 */
exports.emailRegister = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 🔒 Normalize input
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // 🔐 Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    // 🔑 Strong password validation
    // min 8 chars, upper, lower, number, ANY special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    // 🔍 Check existing user
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists. Please login.",
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 👤 Create user (email auth = no Firebase UID)
    const user = await User.create({
      email,
      password: hashedPassword,
      provider: "password",
      firebaseUid: `email_${Date.now()}`,
    });

    const token = generateToken(user);
    res.status(201).json({ user, token });

  } catch (err) {
    console.error("EMAIL REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * EMAIL LOGIN
 */
exports.emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || user.provider !== "password") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error("EMAIL LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

