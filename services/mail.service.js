const transporter = require("../config/brevo");
const fs = require("fs");

/**
 * Universal mail sender
 * Supports optional attachments (PDF invoices)
 */
exports.sendMail = async (
  to,
  subject,
  html,
  attachments = []
) => {

  try {

    let formattedAttachments = [];

    /* ================= HANDLE ATTACHMENTS ================= */

    if (attachments.length) {

      formattedAttachments = attachments.map(file => {

        if (file.path && fs.existsSync(file.path)) {

          return {
            filename: file.filename || "file",
            content: fs.readFileSync(file.path)
          };

        }

        return null;

      }).filter(Boolean);

    }

    /* ================= SEND EMAIL ================= */

    await transporter.sendMail({

      from: `"TechZuno" <${process.env.MAIL_USER}>`,

      to,

      subject,

      html,

      attachments: formattedAttachments

    });

    console.log("✅ Mail sent →", to);

    return true;

  } catch (err) {

    console.error("❌ Mail Failed:", err.message);

    return false;

  }

};