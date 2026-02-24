const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DigitalPurchase = sequelize.define(
  "DigitalPurchase",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    digitalFileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    amount: DataTypes.FLOAT,

    /* ================= ACCESS SNAPSHOT ================= */

    isLimited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    accessType: {
      type: DataTypes.ENUM("days", "fixed_date"),
      allowNull: true,
    },

    accessDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    /* =================================================== */
  },
  {
    tableName: "digital_purchases",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["userId", "digitalFileId"],
      },
    ],
  }
);

module.exports = DigitalPurchase;