const Event = require("../models/Event.model");
const Product = require("../models/Product.model");
const EventRegistration = require("../models/EventRegistration.model");


exports.canAccessEventRoom = async (req, res, next) => {

  try {

    const { eventId } = req.params;
    const userId = req.user.id;


    /* ================= GET EVENT ================= */

    const event = await Event.findOne({
      where: { id: eventId },
      include: [Product],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    /* ================= CHECK PUBLISHED ================= */

    if (event.Product.status !== "published") {
      return res.status(403).json({
        success: false,
        message: "Event not available",
      });
    }


    /* ================= ✅ ADMIN → ALWAYS ALLOWED ================= */

    if (req.user.role === "admin") {
      return next();
    }


    /* ================= ✅ HOST → ALWAYS ALLOWED ================= */

    if (event.hostId === userId) {
      return next();
    }


    /* ================= ✅ STUDENT → MUST BE APPROVED ================= */

    const registered = await EventRegistration.findOne({

      where: {
        userId,
        eventId,
        status: "approved", // 🔥 IMPORTANT FIX
      },

    });


    if (!registered) {
      return res.status(403).json({
        success: false,
        type: "NOT_APPROVED",
        message: "Wait for approval to access event room",
      });
    }


    /* ================= ✅ APPROVED STUDENT ================= */

    return next();


  } catch (err) {

    console.error("ROOM ACCESS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Access check failed",
    });
  }
};
