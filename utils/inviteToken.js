const crypto = require("crypto");

exports.generateInviteToken = () => {
  return crypto.randomBytes(24).toString("hex");
};