const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EventRegistration = sequelize.define("EventRegistration", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  status: {
      type: DataTypes.ENUM("pending", "approved"),
      defaultValue: "approved",
    },

  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "event_registrations",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["userId", "eventId"],
    },
  ],
});

module.exports = EventRegistration;
