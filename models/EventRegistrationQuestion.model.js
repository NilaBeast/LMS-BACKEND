const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EventRegistrationQuestion = sequelize.define(
  "EventRegistrationQuestion",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        "text",
        "number",
        "url",
        "single_select",
        "multi_select"
      ),
      allowNull: false,
    },

    options: {
      type: DataTypes.JSON,
      allowNull: true, // For select type
    },

    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "event_registration_questions",
    timestamps: true,
  }
);

module.exports = EventRegistrationQuestion;
