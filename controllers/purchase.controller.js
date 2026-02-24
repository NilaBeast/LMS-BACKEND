const DigitalPurchase = require("../models/DigitalPurchase.model");
const DigitalFile = require("../models/DigitalFile.model");
const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");

exports.buyDigitalFile = async (req, res) => {

  const { digitalFileId, amount } = req.body;

  const file = await DigitalFile.findByPk(digitalFileId);

  if (!file) return res.status(404).json();

  const exists = await DigitalPurchase.findOne({
    where: {
      userId: req.user.id,
      digitalFileId,
    },
  });

  if (exists) {
    return res.json({ message: "Already purchased" });
  }

  /* ================= SNAPSHOT ACCESS ================= */

  await DigitalPurchase.create({

  userId: req.user.id,
  digitalFileId,
  amount,

  // ✅ SNAPSHOT
  isLimited: file.isLimited,
  accessType: file.accessType,
  accessDays: file.accessDays,
  expiryDate: file.expiryDate,
});

  /* ================= MAIL ================= */

  const isLimited = file.isLimited;

  const html = emailLayout(
    "Purchase Confirmed",
    `
    <h2 style="color:#16a34a;">✅ Purchase Successful</h2>

    <p>Hello ${req.user.name || ""},</p>

    <p>You purchased:</p>

    <div style="
      background:#f8fafc;
      padding:15px;
      border-radius:8px;
      margin:15px 0;
    ">
      <h3>${file.title}</h3>

      ${
        isLimited
          ? `
          <p style="color:#dc2626; font-weight:600;">
            ⚠️ Limited Access
          </p>

          ${
            file.accessType === "days"
              ? `<p>Access Duration: ${file.accessDays} days</p>`
              : ""
          }

          ${
            file.accessType === "fixed_date"
              ? `<p>Expires On: ${new Date(
                  file.expiryDate
                ).toLocaleDateString()}</p>`
              : ""
          }
          `
          : `
          <p style="color:#16a34a; font-weight:600;">
            🎉 Lifetime Access
          </p>
          `
      }
    </div>

    <p>Enjoy your content 🚀</p>
    `
  );

  await mailer.sendMail(
    req.user.email,
    "Digital File Purchase",
    html
  );

  res.json({ success: true });
};