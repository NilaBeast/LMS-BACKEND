const transporter = require("../config/brevo");

/**
 * Safe mail sender
 */
exports.sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"TechZuno" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Mail sent →", to);
    return true;

  } catch (err) {
    console.error("❌ Mail Failed:", err.message);
    return false;
  }
};
