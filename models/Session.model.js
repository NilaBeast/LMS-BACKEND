const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Session = sequelize.define("Session", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  title: DataTypes.STRING,

  description: DataTypes.TEXT,

  coverMedia: DataTypes.STRING,

  duration: DataTypes.INTEGER, // minutes

  pricingType: {
    type: DataTypes.ENUM("fixed", "flexible", "member_free", "free"),
  },

 price: {
  type: DataTypes.FLOAT,
  allowNull: true,
},

minPrice: {
  type: DataTypes.FLOAT,
  allowNull: true,
},

maxPrice: {
  type: DataTypes.FLOAT,
  allowNull: true,
},

priceBreakdown: {
  type: DataTypes.JSON,
  allowNull: true,
},

availability: {
  type: DataTypes.JSON,
  allowNull: true,
},

registrationQuestions: {
  type: DataTypes.JSON,
  allowNull: true,
},

reminderEnabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},


  minPrice: DataTypes.FLOAT,

  suggestedPrice: DataTypes.FLOAT,

  locationType: {
    type: DataTypes.ENUM("online", "offline"),
  },

  meetingLink: DataTypes.STRING,

  address: DataTypes.STRING,

  slugUrl: DataTypes.STRING,

  isPaused: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  banner: {
  type: DataTypes.STRING,
  allowNull: true,
},


  minNotice: DataTypes.INTEGER,

  bufferTime: DataTypes.INTEGER,

  hostTitle: DataTypes.STRING,

  hostBio: DataTypes.TEXT,

});
module.exports = Session;
