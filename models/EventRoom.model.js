const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EventRoom = sequelize.define("EventRoom", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: "event_rooms",
  timestamps: true,
});

module.exports = EventRoom;
