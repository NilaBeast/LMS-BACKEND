const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Payment = sequelize.define("Payment", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  productType: {
    type: DataTypes.STRING,
  },

  productId: {
    type: DataTypes.UUID,
  },

  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  paymentId: {
    type: DataTypes.STRING,
  },

  amount: {
    type: DataTypes.FLOAT,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "created",
  },

  gateway: {
    type: DataTypes.STRING,
    defaultValue: "cashfree",
  },

});

module.exports = Payment;