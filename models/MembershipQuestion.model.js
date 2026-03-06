const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MembershipQuestion = sequelize.define("MembershipQuestion", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  membershipId: DataTypes.UUID,

  question: DataTypes.STRING,

  type: {
    type: DataTypes.ENUM(
      "text",
      "number",
      "url",
      "single",
      "multi"
    ),
  },
}, {
  tableName: "membership_questions",
  timestamps: true,
});

module.exports = MembershipQuestion;