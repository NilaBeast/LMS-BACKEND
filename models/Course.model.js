const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: DataTypes.TEXT,

  coverImage: DataTypes.STRING,

  pricingType: {
    type: DataTypes.ENUM("fixed", "flexible", "installment"),
    allowNull: false,
  },

  pricing: {
    type: DataTypes.JSON,
    /*
      fixed: { price }
      flexible: { min, max }
      installment: {
        bookingAmount,
        installments: [{ amount, dueInDays }]
      }
    */
  },

  pricingBreakdown: {
    type: DataTypes.JSON,
    /*
      {
        gstPercent: 18,
        platformFeePercent: 5,
        showBreakdown: true
      }
    */
  },

  viewBreakdown: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  hasRoom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  

  roomConfig: {
    type: DataTypes.JSON,
    /*
      {
        type: "chat",
        allowFiles: true,
        allowLinks: true
      }
    */
  },
}, {
  tableName: "courses",
  timestamps: true,
});

module.exports = Course;
