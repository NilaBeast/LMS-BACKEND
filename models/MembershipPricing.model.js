const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MembershipPricing = sequelize.define("MembershipPricing", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  membershipId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  interval: {
    type: DataTypes.ENUM(
      "free",
      "weekly",
      "monthly",
      "quarterly",
      "halfYearly",
      "yearly"
    ),
  },

  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },

  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },

  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  hasDiscount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  discountType: {
    type: DataTypes.ENUM("percentage", "fixed"),
    allowNull: true,
  },

  discountValue: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }

}, {
  tableName: "membership_pricing",
  timestamps: true,
});

module.exports = MembershipPricing;