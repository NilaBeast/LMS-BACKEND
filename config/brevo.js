const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/* Verify SMTP */
transporter.verify((err) => {
  if (err) {
    console.error("❌ Gmail SMTP Error:", err.message);
  } else {
    console.log("✅ Gmail SMTP Connected");
  }
});

module.exports = transporter;
