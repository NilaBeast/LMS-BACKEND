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
      "weekly",
      "monthly",
      "quarterly",
      "halfYearly",
      "yearly"
    ),
  },

  duration: DataTypes.INTEGER, // number of weeks/months/etc

  price: DataTypes.FLOAT,

  hasDiscount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  discountType: {
    type: DataTypes.ENUM("percentage", "fixed"),
    allowNull: true,
  },

  discountValue: DataTypes.FLOAT,
}, {
  tableName: "membership_pricing",
  timestamps: true,
});

module.exports = MembershipPricing;