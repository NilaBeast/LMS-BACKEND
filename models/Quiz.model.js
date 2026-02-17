const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Quiz = sequelize.define("Quiz", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  chapterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Quiz;
