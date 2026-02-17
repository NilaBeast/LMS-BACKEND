const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EventRegistrationAnswer = sequelize.define(
  "EventRegistrationAnswer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    registrationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    answer: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "event_registration_answers",
    timestamps: true,
  }
);

module.exports = EventRegistrationAnswer;
