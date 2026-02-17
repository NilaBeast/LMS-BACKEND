const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const QuizQuestion = sequelize.define("QuizQuestion", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM(
      "single",
      "multiple",
      "numeric",
      "match",
      "subjective"
    ),
    allowNull: false,
  },

  subject: DataTypes.STRING,
  topic: DataTypes.STRING,

  difficulty: {
    type: DataTypes.ENUM("easy", "medium", "hard"),
    defaultValue: "medium",
  },

  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  options: {
    type: DataTypes.JSON,
  },

  correctAnswer: {
    type: DataTypes.JSON,
  },

  explanation: DataTypes.TEXT,

  marks: {
    type: DataTypes.FLOAT,
    defaultValue: 1,
  },

  negativeMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  order: DataTypes.INTEGER,
});

module.exports = QuizQuestion;
