const {DataTypes} = require("sequelize");
const {sequelize} = require("../config/db");

const CourseRoom = sequelize.define(
    "CourseRoom",
     {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "course_rooms",
    timestamps: true,
  }
);

module.exports = CourseRoom;