const User = require("./User.model");
const Business = require("./Business.model");
const Product = require("./Product.model");
const Course = require("./Course.model");
const Coupon = require("./Coupon.model");
const Enrollment = require("./Enrollment.model");
const CourseRoom = require("./CourseRoom.model");
const RoomMessage = require("./RoomMessage.model");
const Chapter = require("./Chapter.model");
const Content = require("./Content.model");

/* ================= BUSINESS ================= */
User.hasMany(Business, { foreignKey: "userId" });
Business.belongsTo(User, { foreignKey: "userId" });

/* ================= PRODUCT ================= */
Business.hasMany(Product, { foreignKey: "businessId" });
Product.belongsTo(Business, { foreignKey: "businessId" });

/* ================= COURSE ================= */
Product.hasOne(Course, { foreignKey: "productId" });
Course.belongsTo(Product, { foreignKey: "productId" });

/* ================= COUPON ================= */
Course.hasMany(Coupon, { foreignKey: "courseId" });
Coupon.belongsTo(Course, { foreignKey: "courseId" });

/* ================= ENROLLMENT ================= */
User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: "userId",
});
Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: "courseId",
});

/* ================= COURSE STRUCTURE ================= */

Course.hasMany(Chapter, { foreignKey: "courseId", onDelete: "CASCADE" });
Chapter.belongsTo(Course, { foreignKey: "courseId" });

Chapter.hasMany(Content, { foreignKey: "chapterId", onDelete: "CASCADE" });
Content.belongsTo(Chapter, { foreignKey: "chapterId" });

/* ================= ROOM ================= */
Course.hasOne(CourseRoom, { foreignKey: "courseId" });
CourseRoom.belongsTo(Course, { foreignKey: "courseId" });

CourseRoom.hasMany(RoomMessage, { foreignKey: "roomId" });
RoomMessage.belongsTo(CourseRoom, { foreignKey: "roomId" });

Enrollment.belongsTo(User, { foreignKey: "userId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

Course.hasMany(Enrollment, { foreignKey: "courseId" });
User.hasMany(Enrollment, { foreignKey: "userId" });


RoomMessage.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  Business,
  Product,
  Course,
  Coupon,
  Enrollment,
  CourseRoom,
  RoomMessage,
};
