const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MembershipQuestionOption = sequelize.define("MembershipQuestionOption", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  questionId: DataTypes.UUID,

  value: DataTypes.STRING,
}, {
  tableName: "membership_question_options",
  timestamps: false,
});

module.exports = MembershipQuestionOption;