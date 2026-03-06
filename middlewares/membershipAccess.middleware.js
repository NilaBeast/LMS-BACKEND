const Product = require("../models/Product.model");
const checkMembershipAccess = require("../utils/checkMembershipAccess");

module.exports = async function membershipAccess(req, res, next) {

  try {

    let productId = null;

    if (req.product) {
      productId = req.product.id;
    }

    if (!productId && req.body?.productId) {
      productId = req.body.productId;
    }

    if (!productId && req.params?.productId) {
      productId = req.params.productId;
    }

    /* COURSE */
    if (!productId && req.params?.courseId) {

      const Course = require("../models/Course.model");
      const course = await Course.findByPk(req.params.courseId);

      if (course) productId = course.productId;
    }

    /* EVENT */
    if (!productId && req.params?.eventId) {

      const Event = require("../models/Event.model");
      const event = await Event.findByPk(req.params.eventId);

      if (event) productId = event.productId;
    }

    /* GENERIC ID (session / digital / package) */
    if (!productId && req.params?.id) {

      const Session = require("../models/Session.model");
      const DigitalFile = require("../models/DigitalFile.model");
      const Package = require("../models/Package.model");

      const session = await Session.findByPk(req.params.id);

      if (session) {
        productId = session.productId;
      } else {

        const digital = await DigitalFile.findByPk(req.params.id);

        if (digital) {
          productId = digital.productId;
        } else {

          const pack = await Package.findByPk(req.params.id);

          if (pack) productId = pack.productId;
        }
      }
    }

    if (!productId) return next();

    const product = await Product.findByPk(productId);

    const allowed = await checkMembershipAccess(product, req.user);

    if (!allowed) {

      return res.status(403).json({
        message: "This content requires an active membership plan",
      });

    }

    next();

  } catch (err) {

    console.error("MEMBERSHIP MIDDLEWARE ERROR:", err);

    res.status(500).json({
      message: "Membership validation failed",
    });

  }
};