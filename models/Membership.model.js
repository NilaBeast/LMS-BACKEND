const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Membership = sequelize.define("Membership", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  cover: DataTypes.STRING,

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: DataTypes.TEXT,

  welcomeMessage: DataTypes.TEXT,

  requireApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "memberships",
  timestamps: true,
});

module.exports = Membership;