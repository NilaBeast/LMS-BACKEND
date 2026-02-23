const {
  Product,
  Session,
  SessionBooking,
  User,
  Business,
} = require("../models");

const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");
const cloudinary = require("../config/cloudinary");


/* ================= PRICE BREAKDOWN ================= */

const buildPriceBreakdown = (pricingType, body) => {

  let base = 0;

  if (pricingType === "fixed") {
    base = Number(body.price || 0);
  }

  if (pricingType === "flexible") {
    base = Number(body.minPrice || 0);
  }

  const tax = Math.round(base * 0.18);
  const platformFee = Math.round(base * 0.05);

  const total = base + tax + platformFee;

  return {
    base,
    tax,
    platformFee,
    total,
  };
};



/* ================= CREATE SESSION ================= */

exports.createSession = async (req, res) => {
  try {

    let bannerUrl = null;

    /* Upload banner */

    if (req.file) {

      const uploadRes = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "techzuno/sessions",
          resource_type: "auto",
        }
      );

      bannerUrl = uploadRes.secure_url;
    }


    /* Business */

    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }


    /* Product */

    const product = await Product.create({
      businessId: business.id,
      type: "session",
    });


    /* Breakdown */

    let breakdown = null;

    if (req.body.priceBreakdown) {
      breakdown = JSON.parse(req.body.priceBreakdown);
    }


    /* Create */

    const session = await Session.create({

      productId: product.id,

      banner: bannerUrl,

      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,

      pricingType: req.body.pricingType,

      price: req.body.price || null,
      minPrice: req.body.minPrice || null,
      maxPrice: req.body.maxPrice || null,

      priceBreakdown: breakdown,

      locationType: req.body.locationType,
      meetingLink: req.body.meetingLink,
      address: req.body.address,
      pageUrl: req.body.pageUrl,
    });


    res.json(session);

  } catch (err) {

    console.error("CREATE SESSION ERROR:", err);

    res.status(500).json({
      message: "Failed to create session",
      error: err.message,
    });
  }
};



/* ================= GET MY SESSIONS ================= */

exports.getMySessions = async (req, res) => {
  try {

    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    const sessions = await Session.findAll({
      include: [
        {
          model: Product,
          where: {
            businessId: business.id,
            type: "session",
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(sessions);

  } catch (err) {

    console.error("GET MY SESSIONS ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch sessions",
    });
  }
};



/* ================= UPDATE SESSION ================= */

exports.updateSession = async (req, res) => {
  try {

    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }


    /* Upload banner */

    let bannerUrl = session.banner;

    if (req.file && req.file.buffer) {

      const base64 = req.file.buffer.toString("base64");

      const uploadRes = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64}`,
        {
          folder: "techzuno/sessions",
          resource_type: "auto",
        }
      );

      bannerUrl = uploadRes.secure_url;
    }


    /* Parse breakdown */

    let breakdown = session.priceBreakdown;

    if (req.body.priceBreakdown) {
      try {
        breakdown = JSON.parse(req.body.priceBreakdown);
      } catch (err) {
        console.error("Breakdown parse error:", err);
      }
    }


    /* Safe number */

    const safeNumber = (v) => {
      if (v === "" || v === undefined || v === null) return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };


    /* Update */

    await session.update({

      title: req.body.title || session.title,

      description: req.body.description || session.description,

      duration: safeNumber(req.body.duration) ?? session.duration,

      pricingType: req.body.pricingType || session.pricingType,

      price: safeNumber(req.body.price),

      minPrice: safeNumber(req.body.minPrice),

      maxPrice: safeNumber(req.body.maxPrice),

      locationType: req.body.locationType || session.locationType,

      meetingLink: req.body.meetingLink || session.meetingLink,

      address: req.body.address || session.address,

      pageUrl: req.body.pageUrl || session.pageUrl,

      hostTitle: req.body.hostTitle || session.hostTitle,

      hostBio: req.body.hostBio || session.hostBio,

      registrationQuestions: req.body.registrationQuestions
  ? JSON.parse(req.body.registrationQuestions)
  : session.registrationQuestions,

      isPaused:
        req.body.isPaused === "true"
          ? true
          : req.body.isPaused === "false"
          ? false
          : session.isPaused,

      banner: bannerUrl,

      availability: req.body.availability
  ? JSON.parse(req.body.availability)
  : session.availability,

reminderEnabled:
  req.body.reminderEnabled === "true"
    ? true
    : req.body.reminderEnabled === "false"
    ? false
    : session.reminderEnabled,

      priceBreakdown: breakdown,
    });


    res.json(session);

  } catch (err) {

    console.error("UPDATE SESSION ERROR:", err);

    res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
};



/* ================= DELETE SESSION ================= */

exports.deleteSession = async (req, res) => {

  const session = await Session.findByPk(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Not found" });
  }

  await Product.destroy({
    where: { id: session.productId },
  });

  res.json({ message: "Deleted" });
};



/* ================= GET BOOKINGS ================= */

exports.getBookings = async (req, res) => {

  const bookings = await SessionBooking.findAll({
    where: { sessionId: req.params.id },
    include: [User],
  });

  res.json(bookings);
};



/* ================= BOOK SESSION ================= */

exports.bookSession = async (req, res) => {

  try {

    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }


    /* Check existing booking */

    const existing = await SessionBooking.findOne({
      where: {
        sessionId: session.id,
        userId: req.user.id,
      },
    });


    /* If paused & not booked → block */

    if (session.isPaused && !existing) {

      return res.status(403).json({
        message: "Booking is closed",
      });
    }


    /* If already booked → return */

    if (existing) {
      return res.json(existing);
    }


    /* Create */

    const booking = await SessionBooking.create({

      sessionId: session.id,
      userId: req.user.id,

      bookingDate: req.body.date,
      answers: req.body.answers,
    });


    /* EMAIL */

    const { day, start, end } = req.body.slot || {};

const html = emailLayout(
  "Session Confirmed",
  `
  <h2>✅ Booking Confirmed</h2>

  <p><strong>Session:</strong> ${session.title}</p>

  <p><strong>Duration:</strong> ${session.duration} mins</p>

  ${
    day
      ? `<p><strong>Schedule:</strong> ${day}, ${start} - ${end}</p>`
      : ""
  }

  <p>
    <strong>Location:</strong>
    ${session.meetingLink || session.address}
  </p>
  `
);


    mailer.sendMail(
      req.user.email,
      "Your Session is Confirmed",
      html
    );


    res.json(booking);

  } catch (err) {

    console.error("BOOK SESSION ERROR:", err);

    res.status(500).json({
      message: "Booking failed",
    });
  }
};

/* ================= GET PUBLIC SESSION ================= */

exports.getPublicSession = async (req, res) => {
  try {

    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    let hasBooked = false;

    /* ✅ If logged in, check booking */
    if (req.user) {

      const booking = await SessionBooking.findOne({
        where: {
          sessionId: session.id,
          userId: req.user.id,
        },
      });

      hasBooked = !!booking;
    }

    res.json({
      ...session.toJSON(),
      hasBooked, // 🔥 THIS FIXES YOUR ISSUE
    });

  } catch (err) {

    console.error("GET PUBLIC SESSION ERROR:", err);

    res.status(500).json({
      message: "Failed to load session",
    });
  }
};

/* ================= GET PUBLIC SESSIONS ================= */

exports.getPublicSessions = async (req, res) => {
  try {

    const sessions = await Session.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(sessions);

  } catch (err) {

    console.error("GET PUBLIC SESSIONS ERROR:", err);

    res.status(500).json({
      message: "Failed to load sessions",
    });
  }
};