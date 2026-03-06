const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MembershipPurchase = sequelize.define("MembershipPurchase", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  userId: DataTypes.UUID,
  membershipId: DataTypes.UUID,
  pricingId: DataTypes.UUID,

  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
}, {
  tableName: "membership_purchases",
  timestamps: true,
});

module.exports = MembershipPurchase;