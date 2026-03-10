const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AIAd = sequelize.define("AIAd", {

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
  },

  mediaType: {
  type: DataTypes.STRING,
  defaultValue: "image"
},

imageUrl: {
  type: DataTypes.TEXT
},

videoUrl: {
  type: DataTypes.TEXT
},

videoScript: {
  type: DataTypes.TEXT
},

  brand: {
    type: DataTypes.STRING,
  },

  headline: {
    type: DataTypes.STRING,
  },

  subheadline: {
    type: DataTypes.STRING,
  },

  primaryText: {
    type: DataTypes.TEXT,
  },

  description: {
    type: DataTypes.TEXT,
  },

  cta: {
    type: DataTypes.STRING,
  },

  imagePrompt: {
    type: DataTypes.TEXT,
  }

}, {
  timestamps: true
});

module.exports = AIAd;