const { v4: uuidv4 } = require("uuid");
const Community = require("../models/Community.model");
const CommunityMember = require("../models/CommunityMember.model");
const Product = require("../models/Product.model");
const Course = require("../models/Course.model");
const Event = require("../models/Event.model");
const Session = require("../models/Session.model");
const Digital = require("../models/DigitalFile.model");
const Package = require("../models/Package.model");
const Membership = require("../models/Membership.model");
const MembershipPricing = require("../models/MembershipPricing.model");
const MembershipAnswer = require("../models/MembershipAnswer.model");
const User = require("../models/User.model");
const Business = require("../models/Business.model");
const Enrollment = require("../models/Enrollment.model");
const CourseRoom = require("../models/CourseRoom.model");
const EventRegistration = require("../models/EventRegistration.model");
const DigitalPurchase = require("../models/DigitalPurchase.model");
const MembershipPurchase = require("../models/MembershipPurchase.model");
const PackagePurchase = require("../models/PackagePurchase.model");
const SessionBooking = require("../models/SessionBooking.model");

const Payment = require("../models/Payment.model");

const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");
const { generateInvoice } = require("../utils/invoiceGenerator");

const { createOrder } = require("../services/cashfree.service");

const fs = require("fs");

function toAmount(...values) {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) {
      return num;
    }
  }

  return 0;
}

/* =====================================================
   CREATE PAYMENT ORDER
===================================================== */

exports.createOrder = async (req, res) => {
  try {
    const { productId, productType, pricingId } = req.body;
    const userId = req.user.id;

    if (!productId || !productType) {
      return res.status(400).json({
        message: "productId and productType required",
      });
    }

    let amount = 0;

    /* ================= COURSE ================= */

    if (productType === "course") {
      const course = await Course.findByPk(productId);

      if (!course) return res.status(404).json({ message: "Course not found" });

      if (course.pricingType === "fixed") {
        amount = toAmount(course.pricing?.price, course.pricing?.fixed?.price);
      } else if (course.pricingType === "flexible") {
        amount = toAmount(
          course.pricing?.min,
          course.pricing?.minPrice,
          course.pricing?.flexible?.min
        );
      } else if (course.pricingType === "installment") {
        amount = toAmount(
          course.pricing?.total,
          course.pricing?.installment?.total
        );
      }
    }

    /* ================= EVENT ================= */

    if (productType === "event") {
      const event = await Event.findByPk(productId);

      if (!event) return res.status(404).json({ message: "Event not found" });

      if (event.pricingType === "fixed") {
        amount = toAmount(event.pricing?.amount, event.pricing?.fixed?.price);
      }
      else if (event.pricingType === "flexible")
        amount = toAmount(event.pricing?.min, event.pricing?.flexible?.min);
    }

    /* ================= SESSION ================= */

    if (productType === "session") {
      const session = await Session.findByPk(productId);

      if (!session)
        return res.status(404).json({ message: "Session not found" });

      amount = session.price || 0;
    }

    /* ================= DIGITAL ================= */

    if (productType === "digital") {
      const digital = await Digital.findByPk(productId);

      if (!digital)
        return res.status(404).json({ message: "Digital product not found" });

      if (digital.pricingType === "fixed") {
        amount = toAmount(digital.pricing?.price, digital.pricing?.fixed?.price);
      }
      else if (digital.pricingType === "flexible")
        amount = toAmount(digital.pricing?.minPrice, digital.pricing?.flexible?.min);
      else if (digital.pricingType === "booking")
        amount = toAmount(digital.pricing?.bookingAmount);
      else if (digital.pricingType === "installment")
        amount = toAmount(
          digital.pricing?.total,
          digital.pricing?.installment?.total
        );
    }

    /* ================= PACKAGE ================= */

    if (productType === "package") {
      const pack = await Package.findByPk(productId);

      if (!pack) return res.status(404).json({ message: "Package not found" });

      if (pack.pricingType === "fixed") {
        amount = toAmount(pack.pricing?.price, pack.pricing?.fixed?.price);
      } else if (pack.pricingType === "flexible") {
        amount = toAmount(pack.pricing?.min, pack.pricing?.flexible?.min);
      } else if (pack.pricingType === "installment") {
        amount = toAmount(
          pack.pricing?.total,
          pack.pricing?.installment?.total
        );
      }
    }

    /* ================= MEMBERSHIP ================= */

    if (productType === "membership") {
      const membership = await Membership.findByPk(productId, {
        include: [MembershipPricing],
      });

      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      let plan = null;

      if (pricingId) {
        plan = membership.MembershipPricings?.find((item) => item.id === pricingId);
      }

      if (!plan) {
        plan = membership.MembershipPricings?.[0];
      }

      if (!plan) {
        return res.status(400).json({ message: "Membership pricing not found" });
      }

      amount = plan.price;
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    const orderId = "order_" + uuidv4();

    const order = await createOrder({
      orderId,
      orderAmount: amount,
      customerId: userId,
      customerEmail: req.user.email,
    });

    await Payment.create({
      userId,
      productId,
      productType,
      orderId,
      amount,
      status: "created",
    });

    res.json({
      orderId,
      paymentSessionId: order.payment_session_id,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);

    res.status(500).json({
      message: "Payment order failed",
    });
  }
};

/* =====================================================
   VERIFY PAYMENT
===================================================== */

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, pricingId, answers } = req.body;

    const payment = await Payment.findOne({
      where: {
        orderId,
        userId: req.user.id,
      },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status !== "paid") {
      payment.status = "paid";
      payment.paymentId = paymentId || null;
      await payment.save();
    }

    if (payment.productType === "course") {
      await enrollCourse(payment.userId, payment);
    }

    if (payment.productType === "event") {
      await registerEvent(payment.userId, payment);
    }

    if (payment.productType === "session") {
      await bookSession(payment.userId, payment);
    }

    if (payment.productType === "digital") {
      await grantDigitalAccess(payment.userId, payment);
    }

    if (payment.productType === "package") {
      await activatePackage(payment.userId, payment);
    }

    if (payment.productType === "membership") {
      await activateMembership(payment.userId, payment, {
        pricingId,
        answers,
      });
    }

    res.json({
      message:
        payment.status === "paid"
          ? "Payment verified successfully"
          : "Payment already verified",
    });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

/* =====================================================
   SEND EMAIL + INVOICE HELPER
===================================================== */

async function sendPurchaseEmail(
  userId,
  businessId,
  itemName,
  amount,
  subject,
  htmlContent,
  orderId,
) {
  const user = await User.findByPk(userId);
  if (!user?.email) {
    return false;
  }

  const html = emailLayout(subject, htmlContent);
  const business = businessId ? await Business.findByPk(businessId) : null;
  let invoicePath = null;
  let attachments = [];

  try {
    invoicePath = await generateInvoice({
      invoiceId: orderId,
      customerName: user.name,
      itemName,
      amount,
      business,
    });

    attachments = [
      {
        filename: "invoice.pdf",
        path: invoicePath,
      },
    ];
  } catch (err) {
    console.error("INVOICE GENERATION FAILED:", err.message);
  }

  const sent = await mailer.sendMail(user.email, subject, html, attachments);

  if (invoicePath && fs.existsSync(invoicePath)) {
    fs.unlinkSync(invoicePath);
  }

  return sent;
}

/* =====================================================
   ADD USER TO COMMUNITY
===================================================== */

async function addUserToCommunity(userId, businessId, membershipId = null) {

  const community = await Community.findOne({
    where: { businessId }
  });

  if (!community) return;

  const existing = await CommunityMember.findOne({
    where: {
      communityId: community.id,
      userId
    }
  });

  if (existing) return;

  await CommunityMember.create({
    communityId: community.id,
    userId,
    role: "member",
    membershipId
  });

}

/* =====================================================
   PRODUCT HANDLERS
===================================================== */

/* ================= COURSE ================= */

async function enrollCourse(userId, payment) {
  const course = await Course.findByPk(payment.productId);
  if (!course) {
    throw new Error("Course not found while processing a paid order");
  }

  if (!course) {
    console.log("❌ Course not found");
    return;
  }

  const product = await Product.findByPk(course.productId);

  if (!product) {
    console.log("❌ Product not found (Course)");
    return;
  }

  const existing = await Enrollment.findOne({
    where: {
      userId,
      courseId: course.id,
    },
  });

  if (existing) {
    await addUserToCommunity(userId, product.businessId);
    return;
  }

  let expiresAt = null;

  if (course.isLimited) {
    if (course.accessType === "fixed_date") {
      expiresAt = course.expiryDate;
    }

    if (course.accessType === "days" && course.accessDays) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + Number(course.accessDays));
      expiresAt = expiry;
    }
  }

  await Enrollment.create({
    userId,
    courseId: course.id,
    businessId: product.businessId,
    expiresAt,
  });

  if (course.hasRoom) {
    const existingRoom = await CourseRoom.findOne({
      where: { courseId: course.id },
    });

    if (!existingRoom) {
      await CourseRoom.create({
        courseId: course.id,
        businessId: product.businessId,
      });
    }
  }

  await addUserToCommunity(userId, product.businessId);

  const html = `
    <h2 style="color:#0f172a;">🎉 Course Enrollment Confirmed</h2>
    <p>Hello,</p>
    <p>You successfully enrolled in:</p>
    <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
      <p><strong>Course:</strong> ${course.name}</p>
      <p><strong>Purchase Date:</strong> ${new Date().toDateString()}</p>
      <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
    </div>
    <p>Happy Learning 🚀</p>
  `;

  await sendPurchaseEmail(
    userId,
    product.businessId,
    course.name,
    payment.amount,
    "📘 Course Enrollment Successful",
    html,
    payment.orderId,
  );
}



/* ================= EVENT ================= */

async function registerEvent(userId, payment) {
  const event = await Event.findByPk(payment.productId);

  if (!event) {
    console.log("❌ Event not found");
    return;
  }

  const product = await Product.findByPk(event.productId);

  if (!product) {
    console.log("❌ Product not found (Event)");
    return;
  }

  const existingEventRegistration = await EventRegistration.findOne({
    where: {
      userId,
      eventId: event.id,
    },
  });

  if (existingEventRegistration) {
    await addUserToCommunity(userId, product.businessId);
    return;
  }

  await EventRegistration.create({
    userId,
    eventId: event.id,
    status: "approved",
  });

  await addUserToCommunity(userId, product.businessId);

  const html = `
    <h2 style="color:#0f172a;">🎟 Event Registration Confirmed</h2>
    <p>Hello,</p>
    <p>You successfully registered for:</p>
    <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
      <p><strong>Event:</strong> ${event.title}</p>
      <p><strong>Date:</strong> ${event.startAt ? new Date(event.startAt).toLocaleString() : "TBA"}</p>
      <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
    </div>
    <p>We look forward to seeing you there 🎉</p>
  `;

  await sendPurchaseEmail(
    userId,
    product.businessId,
    event.title,
    payment.amount,
    "🎟 Event Registration Confirmed",
    html,
    payment.orderId,
  );
}



/* ================= SESSION ================= */

async function bookSession(userId, payment) {
  const session = await Session.findByPk(payment.productId);

  if (!session) {
    console.log("❌ Session not found");
    return;
  }

  const product = await Product.findByPk(session.productId);

  if (!product) {
    console.log("❌ Product not found (Session)");
    return;
  }

  const existingSessionBooking = await SessionBooking.findOne({
    where: {
      userId,
      sessionId: session.id,
    },
  });

  if (existingSessionBooking) {
    await addUserToCommunity(userId, product.businessId);
    return;
  }

  await SessionBooking.create({
    userId,
    sessionId: session.id,
    status: "confirmed",
  });

  await addUserToCommunity(userId, product.businessId);

  const html = `
    <h2 style="color:#0f172a;">🤝 Session Booked</h2>
    <p>Hello,</p>
    <p>Your session booking is confirmed:</p>
    <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
      <p><strong>Session:</strong> ${session.title}</p>
      <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
    </div>
    <p>We look forward to meeting you.</p>
  `;

  await sendPurchaseEmail(
    userId,
    product.businessId,
    session.title,
    payment.amount,
    "🤝 Session Booking Confirmed",
    html,
    payment.orderId,
  );
}



/* ================= DIGITAL ================= */

async function grantDigitalAccess(userId, payment) {
  const digital = await Digital.findByPk(payment.productId);

  if (!digital) {
    console.log("❌ Digital not found");
    return;
  }

  const product = await Product.findByPk(digital.productId);

  if (!product) {
    console.log("❌ Product not found (Digital)");
    return;
  }

  const existingDigitalPurchase = await DigitalPurchase.findOne({
    where: {
      userId,
      digitalFileId: digital.id,
    },
  });

  if (existingDigitalPurchase) {
    await addUserToCommunity(userId, product.businessId);
    return;
  }

  await DigitalPurchase.create({
    userId,
    digitalFileId: digital.id,
  });

  await addUserToCommunity(userId, product.businessId);

  const html = `
    <h2 style="color:#0f172a;">📁 Digital Purchase Successful</h2>
    <p>Hello,</p>
    <p>You successfully purchased:</p>
    <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
      <p><strong>Product:</strong> ${digital.title}</p>
      <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
    </div>
    <p>You can now download the file from your dashboard.</p>
  `;

  await sendPurchaseEmail(
    userId,
    product.businessId,
    digital.title,
    payment.amount,
    "📁 Digital Purchase Successful",
    html,
    payment.orderId,
  );
}



/* ================= PACKAGE ================= */

async function activatePackage(userId, payment) {
  const pack = await Package.findByPk(payment.productId);

  if (!pack) {
    console.log("❌ Package not found");
    return;
  }

  const product = await Product.findByPk(pack.productId);

  if (!product) {
    console.log("❌ Product not found (Package)");
    return;
  }

  const existingPackagePurchase = await PackagePurchase.findOne({
    where: {
      userId,
      packageId: pack.id,
    },
  });

  if (existingPackagePurchase) {
    await addUserToCommunity(userId, product.businessId);
    return;
  }

  await PackagePurchase.create({
    userId,
    packageId: pack.id,
  });

  await addUserToCommunity(userId, product.businessId);

  const html = `
    <h2 style="color:#0f172a;">📦 Package Purchase Successful</h2>
    <p>Hello,</p>
    <p>You successfully purchased:</p>
    <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
      <p><strong>Package:</strong> ${pack.title}</p>
      <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
    </div>
    <p>All included courses are now unlocked 🚀</p>
  `;

  await sendPurchaseEmail(
    userId,
    product.businessId,
    pack.title,
    payment.amount,
    "📦 Package Purchase Successful",
    html,
    payment.orderId,
  );
}



/* ================= MEMBERSHIP ================= */

async function activateMembership(userId, payment, meta = {}) {
  const membership = await Membership.findByPk(payment.productId);

  if (!membership) {
    console.log("❌ Membership not found");
    return;
  }

  const product = await Product.findByPk(membership.productId);

  if (!product) {
    console.log("❌ Product not found (Membership)");
    return;
  }

  let selectedPricingId = meta.pricingId || null;

  if (selectedPricingId) {
    const pricing = await MembershipPricing.findOne({
      where: {
        id: selectedPricingId,
        membershipId: membership.id,
      },
    });

    if (!pricing) {
      selectedPricingId = null;
    }
  }

  if (!selectedPricingId) {
    const firstPricing = await MembershipPricing.findOne({
      where: { membershipId: membership.id },
      order: [["createdAt", "ASC"]],
    });

    selectedPricingId = firstPricing?.id || null;
  }

  const existingMembershipPurchase = await MembershipPurchase.findOne({
    where: {
      userId,
      membershipId: membership.id,
      status: "approved",
    },
  });

  if (existingMembershipPurchase) {
    await addUserToCommunity(
      userId,
      product.businessId,
      membership.id
    );
    return;
  }

  const purchase = await MembershipPurchase.create({
    userId,
    membershipId: membership.id,
    pricingId: selectedPricingId,
    status: "approved",
  });

  if (Array.isArray(meta.answers) && meta.answers.length) {
    for (const answer of meta.answers) {
      if (!answer?.questionId) continue;

      await MembershipAnswer.create({
        purchaseId: purchase.id,
        questionId: answer.questionId,
        answer: Array.isArray(answer.answer)
          ? JSON.stringify(answer.answer)
          : answer.answer,
      });
    }
  }

  await addUserToCommunity(
    userId,
    product.businessId,
    membership.id
  );

  const html = `
    <h2 style="color:#0f172a;">👑 Membership Activated</h2>
    <p>Hello,</p>
    <p>Your membership is now active:</p>
    <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
      <p><strong>Membership:</strong> ${membership.title}</p>
      <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
    </div>
    <p>Enjoy premium access 🚀</p>
  `;

  await sendPurchaseEmail(
    userId,
    product.businessId,
    membership.title,
    payment.amount,
    "👑 Membership Activated",
    html,
    payment.orderId,
  );
}
