const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EventRoomMessage = sequelize.define("EventRoomMessage", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "event_room_messages",
  timestamps: true,
});

module.exports = EventRoomMessage;
