// models/Coupon.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Coupon = sequelize.define("Coupon", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  code: {
    type: DataTypes.STRING,
    unique: true,
  },

  discountType: {
    type: DataTypes.ENUM("percentage", "fixed"),
  },

  value: {
    type: DataTypes.INTEGER,
  },

  expiry: {
    type: DataTypes.DATE,
  },
}, {
  tableName: "coupons",
  timestamps: true,
});

module.exports = Coupon;
