const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SessionBooking = sequelize.define("SessionBooking", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  bookingDate: DataTypes.DATE,

  status: {
    type: DataTypes.ENUM("confirmed", "cancelled"),
    defaultValue: "confirmed",
  },

  answers: DataTypes.JSON,

});

module.exports = SessionBooking;
