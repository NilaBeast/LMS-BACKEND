const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AIChat = sequelize.define("AIChat", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  prompt: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  type: {
    type: DataTypes.STRING,
    defaultValue: "ad",
  }

}, {
  timestamps: true
});

module.exports = AIChat;