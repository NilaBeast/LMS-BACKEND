// const Product = require("../models/Product.model");
// const Event = require("../models/Event.model");
// const Business = require("../models/Business.model");

const { sequelize } = require("../config/db");

const {
  Event,
  User,
  Product,
  Business,
} = require("../models");

const EventRegistration =
  require("../models/EventRegistration.model");

const EventRegistrationQuestion =
  require("../models/EventRegistrationQuestion.model");

const EventRegistrationAnswer =
  require("../models/EventRegistrationAnswer.model");

const mailer = require("../services/mail.service");
const { emailLayout } =
  require("../utils/emailTemplate");


/* ================= HELPERS ================= */

const toBool = (v) => v === true || v === "true";

const toNum = (v) => Number(v) > 0 ? Number(v) : 0;


/* ================= MAIL ================= */

async function sendRegistrationMail(event, user) {

  const start = new Date(event.startAt).toLocaleString();
  const end = new Date(event.endAt).toLocaleString();

  /* MODE INFO */

  let modeInfo = "";

  if (event.mode === "online") {

    modeInfo = `
      <p><b>Mode:</b> Online</p>
      <p><b>Meeting Link:</b>
        <a href="${event.meetingLink}">
          ${event.meetingLink}
        </a>
      </p>
    `;

  } else if (event.mode === "in_person") {

    modeInfo = `
      <p><b>Mode:</b> In-Person</p>
      <p><b>Location:</b> ${event.locationAddress}</p>
    `;
  }


  /* WHATSAPP GROUP */

  let whatsappInfo = "";

  if (event.whatsappGroupUrl) {

    whatsappInfo = `
      <p>
        💬 <b>Join WhatsApp Group:</b><br/>
        <a href="${event.whatsappGroupUrl}">
          ${event.whatsappGroupUrl}
        </a>
      </p>
    `;
  }


  /* EMAIL TEMPLATE */

  const html = emailLayout(

    "Event Registration Confirmed",

    `
    <h2>🎟️ Registration Confirmed</h2>

    <p>Hello <b>${user.name}</b>,</p>

    <p>Your registration has been successfully approved.</p>

    <hr/>

    <div style="
      background:#f8fafc;
      padding:15px;
      border-radius:8px;
      margin:15px 0;
    ">

      <h3 style="margin-top:0">
        📌 ${event.title}
      </h3>

      <p><b>Start:</b> ${start}</p>
      <p><b>End:</b> ${end}</p>

      ${modeInfo}

      ${whatsappInfo}

    </div>

    <hr/>

    <p>
      Please keep this email for reference.
    </p>

    <p>
      If you have any questions, feel free to contact the host.
    </p>

    <p>
      See you at the event 🚀
    </p>
    `
  );


  /* SEND MAIL */

  await mailer.sendMail(
    user.email,
    "🎟️ Event Registration Confirmed",
    html
  );
}



/* ================= CREATE ================= */

exports.createEvent = async (req, res) => {

  const tx = await sequelize.transaction();

  try {

    let {
      title,
      description,
      startAt,
      endAt,

      sessionType,
      sessionConfig,

      mode,
      meetingLink,
      locationAddress,

      pricingType,
      pricing,
      pricingBreakdown,

      capacityEnabled,
      capacity,

      requireApproval,

      hostId,
      whatsappGroupUrl,
      businessId,
    } = req.body;


    if (!title || !pricingType || !businessId) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }


    /* BUSINESS */

    const business = await Business.findOne({
      where: {
        id: businessId,
        userId: req.user.id,
      },
    });

    if (!business) {
      return res.status(403).json({
        message: "Invalid business",
      });
    }


    /* PRODUCT */

    const product = await Product.create(
      {
        businessId,
        type: "event",
        status: "draft",
      },
      { transaction: tx }
    );


    /* NORMALIZE */

    const finalCapacityEnabled = toBool(capacityEnabled);
    const finalCapacity = finalCapacityEnabled
      ? toNum(capacity)
      : null;

    const finalRequireApproval = toBool(requireApproval);


    /* COVER */

    const coverType = req.file
      ? req.file.mimetype.startsWith("video")
        ? "video"
        : "image"
      : null;


    /* EVENT */

    const event = await Event.create(
      {

        productId: product.id,

        title,
        description,

        coverMedia: req.file?.path || null,
        coverType,

        startAt,
        endAt,

        sessionType: sessionType || "one_time",

        sessionConfig: sessionConfig
          ? JSON.parse(sessionConfig)
          : null,

        mode,

        meetingLink:
          mode === "online"
            ? meetingLink
            : null,

        locationAddress:
          mode === "in_person"
            ? locationAddress
            : null,

        pricingType,

        pricing: pricing
          ? JSON.parse(pricing)
          : null,

        pricingBreakdown: pricingBreakdown
          ? JSON.parse(pricingBreakdown)
          : null,

        capacityEnabled: finalCapacityEnabled,
        capacity: finalCapacity,

        requireApproval: finalRequireApproval,

        hostId:
          hostId && hostId !== "undefined"
            ? hostId
            : req.user.id,

        whatsappGroupUrl,

      },
      { transaction: tx }
    );


    await tx.commit();

    res.status(201).json(event);

  } catch (err) {

    await tx.rollback();

    console.error("CREATE EVENT:", err);

    res.status(500).json({
      message: "Create failed",
    });
  }
};


/* ================= REGISTER ================= */

exports.registerForEvent = async (req, res) => {

  const tx = await sequelize.transaction();

  try {

    const { eventId } = req.params;
    const userId = req.user.id;

    const { answers } = req.body;


    const event = await Event.findByPk(eventId, {
      include: [Product],
      lock: tx.LOCK.UPDATE,
      transaction: tx,
    });


    if (!event || event.Product.status !== "published") {

      await tx.rollback();

      return res.status(404).json({
        message: "Event not available",
      });
    }


    if (event.registrationClosed) {

      await tx.rollback();

      return res.status(403).json({
        message: "Registration closed",
      });
    }


    /* DUPLICATE */

    const exists = await EventRegistration.findOne({
      where: { userId, eventId },
      transaction: tx,
    });


    if (exists) {

      await tx.rollback();

      return res.json({
        message: "Already registered",
      });
    }


    /* CAPACITY */

    if (event.capacityEnabled) {

      const count = await EventRegistration.count({
        where: {
          eventId,
          status: "approved",
        },
        transaction: tx,
      });


      const max = toNum(event.capacity);


      if (max > 0 && count >= max) {

        await tx.rollback();

        return res.status(403).json({
          message: "Event is full",
        });
      }
    }


    /* QUESTIONS */

    const questions =
      await EventRegistrationQuestion.findAll({
        where: { eventId },
      });


    for (const q of questions) {

      if (q.required) {

        const found = answers?.find(
          (a) => a.questionId === q.id
        );

        if (!found || !found.answer) {

          await tx.rollback();

          return res.status(400).json({
            message: `Answer required: ${q.question}`,
          });
        }
      }
    }


    /* STATUS */

    const status = event.requireApproval
      ? "pending"
      : "approved";


    /* CREATE */

    const reg =
      await EventRegistration.create(
        {
          userId,
          eventId,
          status,
        },
        { transaction: tx }
      );


    /* SAVE ANSWERS */

    if (answers?.length) {

      for (const a of answers) {

        await EventRegistrationAnswer.create(
          {
            registrationId: reg.id,
            questionId: a.questionId,
            answer: a.answer,
          },
          { transaction: tx }
        );
      }
    }


    await tx.commit();


    if (status === "approved") {
      await sendRegistrationMail(event, req.user);
    }


    res.json({
      success: true,
      message:
        status === "pending"
          ? "Waiting for approval"
          : "Registered successfully",
    });

  } catch (err) {

    await tx.rollback();

    console.error("REGISTER:", err);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};


/* ================= APPROVE ================= */

exports.approveRegistration = async (req, res) => {

  try {

    const { id } = req.params;


    const reg =
      await EventRegistration.findByPk(id, {
        include: [Event, User],
      });


    if (!reg) {
      return res.status(404).json({
        message: "Not found",
      });
    }


    if (reg.Event.hostId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }


    if (reg.status === "approved") {
      return res.json({
        message: "Already approved",
      });
    }


    /* CAPACITY AGAIN */

    if (reg.Event.capacityEnabled) {

      const count =
        await EventRegistration.count({

          where: {
            eventId: reg.eventId,
            status: "approved",
          },
        });


      const max = toNum(reg.Event.capacity);


      if (max > 0 && count >= max) {

        return res.status(403).json({
          message: "Event full",
        });
      }
    }


    await reg.update({
      status: "approved",
    });


    await sendRegistrationMail(
      reg.Event,
      reg.User
    );


    res.json({
      success: true,
    });

  } catch (err) {

    console.error("APPROVE:", err);

    res.status(500).json({
      message: "Approval failed",
    });
  }
};


/* ================= GET MY EVENTS ================= */

exports.getMyEvents = async (req, res) => {

  try {

    const events = await Event.findAll({

      include: [

        {
          model: Product,
          required: true,

          include: [
            {
              model: Business,
              where: {
                userId: req.user.id,
              },
            },
          ],
        },

        {
          model: User,
          as: "host",
          attributes: ["id", "name", "email"],
        },

      ],

      order: [["createdAt", "DESC"]],
    });


    res.json(events);

  } catch (err) {

    console.error("MY EVENTS:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
};


/* ================= PUBLIC ================= */

exports.getPublicEvents = async (req, res) => {

  try {

    const events = await Event.findAll({

      include: [
        {
          model: Product,
          where: { status: "published" },
        },
        {
          model: User,
          as: "host",
          attributes: ["id", "name"],
        },
      ],

      order: [["startAt", "ASC"]],
    });


    res.json(events);

  } catch (err) {

    console.error("PUBLIC:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
};


exports.getPublicEventById = async (req, res) => {

  try {

    const event = await Event.findOne({

      where: { id: req.params.id },

      include: [
        {
          model: Product,
          where: { status: "published" },
        },
        {
          model: User,
          as: "host",
          attributes: ["id", "name"],
        },
      ],
    });


    if (!event) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json(event);

  } catch (err) {

    console.error("PUBLIC ID:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
};


/* ================= HOST EVENT ================= */

exports.getEventByIdForHost = async (req, res) => {

  try {

    const event = await Event.findOne({

      where: { id: req.params.id },

      include: [Product],
    });


    if (!event) {
      return res.status(404).json({
        message: "Not found",
      });
    }


    if (event.hostId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }


    res.json(event);

  } catch (err) {

    console.error("HOST EVENT:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
};


/* ================= UPDATE ================= */

exports.updateEvent = async (req, res) => {

  try {

    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Not found",
      });
    }


    if (event.hostId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }


    await event.update(req.body);

    res.json({ success: true, event });

  } catch (err) {

    console.error("UPDATE:", err);

    res.status(500).json({
      message: "Update failed",
    });
  }
};


/* ================= DELETE ================= */

exports.deleteEvent = async (req, res) => {

  try {

    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Not found",
      });
    }


    if (event.productId) {
      await Product.destroy({
        where: { id: event.productId },
      });
    }


    await event.destroy();

    res.json({ success: true });

  } catch (err) {

    console.error("DELETE:", err);

    res.status(500).json({
      message: "Delete failed",
    });
  }
};


/* ================= REGISTRATIONS ================= */

exports.getMyRegistrations = async (req, res) => {

  try {

    const data = await EventRegistration.findAll({

      where: {
        userId: req.user.id,
      },

      include: [
        {
          model: Event,
          include: [Product],
        },
      ],

      order: [["createdAt", "DESC"]],
    });


    res.json(data);

  } catch (err) {

    console.error("MY REG:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
};


exports.checkEventRegistration = async (req, res) => {

  try {

    const found = await EventRegistration.findOne({
      where: {
        userId: req.user.id,
        eventId: req.params.eventId,
      },
    });


    res.json({ registered: !!found });

  } catch (err) {

    console.error("CHECK:", err);

    res.status(500).json({
      message: "Check failed",
    });
  }
};


/* ================= SETTINGS ================= */

exports.updateEventSettings = async (req, res) => {

  try {

    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Not found",
      });
    }


    if (event.hostId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }


    await event.update({

      registrationClosed: toBool(req.body.registrationClosed),

      hideAttendeeList: toBool(req.body.hideAttendeeList),

      requireApproval: toBool(req.body.requireApproval),

      capacityEnabled: toBool(req.body.capacityEnabled),

      capacity: toBool(req.body.capacityEnabled)
        ? toNum(req.body.capacity)
        : null,

    });


    res.json({
      success: true,
      event,
    });

  } catch (err) {

    console.error("SETTINGS:", err);

    res.status(500).json({
      message: "Update failed",
    });
  }
};
