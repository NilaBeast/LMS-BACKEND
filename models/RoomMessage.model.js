const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const RoomMessage = sequelize.define(
  "RoomMessage",
  {
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
  },
  {
    tableName: "room_messages",
    timestamps: true,
  }
);

module.exports = RoomMessage;
