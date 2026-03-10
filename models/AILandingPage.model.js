const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AILandingPage = sequelize.define("AILandingPage", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  topic: DataTypes.STRING,
  audience: DataTypes.STRING,
  painPoints: DataTypes.TEXT,
  promise: DataTypes.TEXT,
  dateTime: DataTypes.STRING,
  duration: DataTypes.STRING,

  headlineOptions: DataTypes.JSON,
  subheadlineOptions: DataTypes.JSON,
  topicsCovered: DataTypes.JSON,
  moralReason: DataTypes.JSON,
  whatYouTeach: DataTypes.JSON,
  whoFor: DataTypes.JSON,
  whoNotFor: DataTypes.JSON,
  unique: DataTypes.JSON,
  testimonials: DataTypes.JSON,
  faqs: DataTypes.JSON,
  cta: DataTypes.JSON,
  bonuses: DataTypes.JSON

},{
  timestamps:true
});

module.exports = AILandingPage;