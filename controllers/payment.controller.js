const { v4: uuidv4 } = require("uuid");

const Course = require("../models/Course.model");
const Event = require("../models/Event.model");
const Session = require("../models/Session.model");
const Digital = require("../models/DigitalFile.model");
const Package = require("../models/Package.model");
const Membership = require("../models/Membership.model");
const User = require("../models/User.model");
const Business = require("../models/Business.model");
const Enrollment = require("../models/Enrollment.model");
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

/* =====================================================
   CREATE PAYMENT ORDER
===================================================== */

exports.createOrder = async (req, res) => {

  try {

    const { productId, productType } = req.body;
    const userId = req.user.id;

    if (!productId || !productType) {
      return res.status(400).json({
        message: "productId and productType required"
      });
    }

    let amount = 0;

    /* ================= COURSE ================= */

    if (productType === "course") {

      const course = await Course.findByPk(productId);

      if (!course) return res.status(404).json({ message: "Course not found" });

      amount = course.pricing?.price || 0;
    }

    /* ================= EVENT ================= */

    if (productType === "event") {

      const event = await Event.findByPk(productId);

      if (!event) return res.status(404).json({ message: "Event not found" });

      if (event.pricingType === "fixed") amount = event.pricing?.amount || 0;
      else if (event.pricingType === "flexible") amount = event.pricing?.min || 0;
    }

    /* ================= SESSION ================= */

    if (productType === "session") {

      const session = await Session.findByPk(productId);

      if (!session) return res.status(404).json({ message: "Session not found" });

      amount = session.price || 0;
    }

    /* ================= DIGITAL ================= */

    if (productType === "digital") {

      const digital = await Digital.findByPk(productId);

      if (!digital) return res.status(404).json({ message: "Digital product not found" });

      if (digital.pricingType === "fixed") amount = digital.pricing?.price || 0;
      else if (digital.pricingType === "flexible") amount = digital.pricing?.minPrice || 0;
      else if (digital.pricingType === "booking") amount = digital.pricing?.bookingAmount || 0;
    }

    /* ================= PACKAGE ================= */

    if (productType === "package") {

      const pack = await Package.findByPk(productId);

      if (!pack) return res.status(404).json({ message: "Package not found" });

      if (pack.pricingType === "fixed") amount = pack.pricing?.price || 0;
      else if (pack.pricingType === "flexible") amount = pack.pricing?.min || 0;
    }

    /* ================= MEMBERSHIP ================= */

    if (productType === "membership") {

      const membership = await Membership.findByPk(productId, {
        include: ["MembershipPricings"]
      });

      const plan = membership.MembershipPricings?.[0];

      amount = plan.price;
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid price"
      });
    }

    const orderId = "order_" + uuidv4();

    const order = await createOrder({
      orderId,
      orderAmount: amount,
      customerId: userId,
      customerEmail: req.user.email
    });

    await Payment.create({
      userId,
      productId,
      productType,
      orderId,
      amount,
      status: "created"
    });

    res.json({
      orderId,
      paymentSessionId: order.payment_session_id
    });

  } catch (err) {

    console.error("CREATE ORDER ERROR:", err);

    res.status(500).json({
      message: "Payment order failed"
    });

  }

};



/* =====================================================
   VERIFY PAYMENT
===================================================== */

exports.verifyPayment = async (req, res) => {

  try {

    const { orderId, paymentId } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ where: { orderId } });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status !== "paid") {

      payment.status = "paid";
      payment.paymentId = paymentId || null;

      await payment.save();
    }

    if (payment.productType === "course")
      await enrollCourse(userId, payment);

    if (payment.productType === "event")
      await registerEvent(userId, payment);

    if (payment.productType === "session")
      await bookSession(userId, payment);

    if (payment.productType === "digital")
      await grantDigitalAccess(userId, payment);

    if (payment.productType === "package")
      await activatePackage(userId, payment);

    if (payment.productType === "membership")
      await activateMembership(userId, payment);

    res.json({ message: "Payment verified successfully" });

  } catch (err) {

    console.error("VERIFY PAYMENT ERROR:", err);

    res.status(500).json({
      message: "Payment verification failed"
    });

  }

};



/* =====================================================
   SEND EMAIL + INVOICE HELPER
===================================================== */

async function sendPurchaseEmail(userId, itemName, amount, subject, htmlContent, orderId) {

  const user = await User.findByPk(userId);

   /* ================= GET BUSINESS ================= */

  const business = await Business.findOne({
    where: { userId }
  });

  const invoicePath = await generateInvoice({
    invoiceId: orderId,
    customerName: user.name,
    itemName,
    amount,
    business
  });

  const html = emailLayout(subject, htmlContent);

  await mailer.sendMail(
    user.email,
    subject,
    html,
    [
      {
        filename: "invoice.pdf",
        path: invoicePath
      }
    ]
  );

  fs.unlinkSync(invoicePath);

}



/* =====================================================
   PRODUCT HANDLERS
===================================================== */

async function enrollCourse(userId, payment) {

  const course = await Course.findByPk(payment.productId);

  await Enrollment.create({
    userId,
    courseId: course.id
  });

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
    course.name,
    payment.amount,
    "📘 Course Enrollment Successful",
    html,
    payment.orderId
  );

}



async function registerEvent(userId, payment) {

  const event = await Event.findByPk(payment.productId);

  await EventRegistration.create({
    userId,
    eventId: event.id,
    status: "approved"
  });

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
    event.title,
    payment.amount,
    "🎟 Event Registration Confirmed",
    html,
    payment.orderId
  );

}



async function bookSession(userId, payment) {

  const session = await Session.findByPk(payment.productId);

  await SessionBooking.create({
    userId,
    sessionId: session.id,
    status: "confirmed"
  });

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
    session.title,
    payment.amount,
    "🤝 Session Booking Confirmed",
    html,
    payment.orderId
  );

}



async function grantDigitalAccess(userId, payment) {

  const digital = await Digital.findByPk(payment.productId);

  await DigitalPurchase.create({
    userId,
    digitalFileId: digital.id
  });

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
    digital.title,
    payment.amount,
    "📁 Digital Purchase Successful",
    html,
    payment.orderId
  );

}



async function activatePackage(userId, payment) {

  const pack = await Package.findByPk(payment.productId);

  await PackagePurchase.create({
    userId,
    packageId: pack.id
  });

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
    pack.title,
    payment.amount,
    "📦 Package Purchase Successful",
    html,
    payment.orderId
  );

}



async function activateMembership(userId, payment) {

  const membership = await Membership.findByPk(payment.productId);

  await MembershipPurchase.create({
    userId,
    membershipId: membership.id,
    status: "approved"
  });

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
    membership.title,
    payment.amount,
    "👑 Membership Activated",
    html,
    payment.orderId
  );

}