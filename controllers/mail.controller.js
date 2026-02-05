const mailer = require("../services/mail.service");

exports.sendCustomMail = async (req, res) => {
  const { to, subject, message } = req.body;

  await mailer.sendMail(
    to,
    subject,
    `<p>${message}</p>`
  );

  res.json({ success: true });
};
