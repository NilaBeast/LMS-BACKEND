const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MembershipAnswer = sequelize.define("MembershipAnswer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  purchaseId: DataTypes.UUID,
  questionId: DataTypes.UUID,
  answer: DataTypes.TEXT,
}, {
  tableName: "membership_answers",
  timestamps: false,
});

module.exports = MembershipAnswer;