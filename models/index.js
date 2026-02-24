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
const Bookmark = require("./Bookmark.model");
const Event = require("./Event.model");
const EventRegistration = require("./EventRegistration.model");
const EventRoom = require("./EventRoom.model");
const EventRoomMessage = require("./EventRoomMessage.model");
const EventRegistrationQuestion = require("./EventRegistrationQuestion.model");
const EventRegistrationAnswer = require("./EventRegistrationAnswer.model");
const Session = require("./Session.model");
const SessionBooking = require("./SessionBooking.model");
const DigitalFile = require("./DigitalFile.model");
const DigitalFileContent = require("./DigitalFileContent.model");
const DigitalPurchase = require("./DigitalPurchase.model");

/* ✅ NEW */
const Quiz = require("./Quiz.model");
const QuizQuestion = require("./QuizQuestion.model");


/* ================= BUSINESS ================= */

User.hasMany(Business, { foreignKey: "userId" });
Business.belongsTo(User, { foreignKey: "userId" });


/* ================= PRODUCT ================= */

Business.hasMany(Product, { foreignKey: "businessId" });
Product.belongsTo(Business, { foreignKey: "businessId" });


/* ================= COURSE ================= */

Product.hasOne(Course, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});

Course.belongsTo(Product, {
  foreignKey: "productId",
});


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

Enrollment.belongsTo(User, { foreignKey: "userId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

Course.hasMany(Enrollment, { foreignKey: "courseId" });
User.hasMany(Enrollment, { foreignKey: "userId" });


/* ================= COURSE STRUCTURE ================= */

Course.hasMany(Chapter, {
  foreignKey: "courseId",
  onDelete: "CASCADE",
});

Chapter.belongsTo(Course, {
  foreignKey: "courseId",
});

Chapter.hasMany(Content, {
  foreignKey: "chapterId",
  onDelete: "CASCADE",
});

Content.belongsTo(Chapter, {
  foreignKey: "chapterId",
});


/* ================= QUIZ SYSTEM ================= */

Chapter.hasOne(Quiz, {
  foreignKey: "chapterId",
  onDelete: "CASCADE",
});

Quiz.belongsTo(Chapter, {
  foreignKey: "chapterId",
});

Quiz.hasMany(QuizQuestion, {
  foreignKey: "quizId",
  onDelete: "CASCADE",
});

QuizQuestion.belongsTo(Quiz, {
  foreignKey: "quizId",
});


/* ================= EVENT ================= */

Product.hasOne(Event, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});

Event.belongsTo(Product, {
  foreignKey: "productId",
});


/* ================= EVENT QUESTIONS ================= */

Event.hasMany(EventRegistrationQuestion, {
  foreignKey: "eventId",
});

EventRegistrationQuestion.belongsTo(Event, {
  foreignKey: "eventId",
});


/* ================= EVENT ANSWERS ================= */

EventRegistration.hasMany(EventRegistrationAnswer, {
  foreignKey: "registrationId",
});

EventRegistrationAnswer.belongsTo(EventRegistration, {
  foreignKey: "registrationId",
});

EventRegistrationAnswer.belongsTo(EventRegistrationQuestion, {
  foreignKey: "questionId",
});


/* ================= EVENT REGISTRATION ================= */

User.belongsToMany(Event, {
  through: EventRegistration,
  foreignKey: "userId",
});

Event.belongsToMany(User, {
  through: EventRegistration,
  foreignKey: "eventId",
});

EventRegistration.belongsTo(Event, {
  foreignKey: "eventId",
});

EventRegistration.belongsTo(User, {
  foreignKey: "userId",
});

Event.hasMany(EventRegistration, {
  foreignKey: "eventId",
});

User.hasMany(EventRegistration, {
  foreignKey: "userId",
});


/* ================= EVENT ROOM ================= */

Event.hasOne(EventRoom, {
  foreignKey: "eventId",
});

EventRoom.belongsTo(Event, {
  foreignKey: "eventId",
});

EventRoom.hasMany(EventRoomMessage, {
  foreignKey: "roomId",
});

EventRoomMessage.belongsTo(EventRoom, {
  foreignKey: "roomId",
});

EventRoomMessage.belongsTo(User, {
  foreignKey: "userId",
});


/* ================= EVENT HOST ================= */

Event.belongsTo(User, {
  foreignKey: "hostId",
  as: "host",
});

User.hasMany(Event, {
  foreignKey: "hostId",
  as: "hostedEvents",
});


/* ================= COURSE ROOM ================= */

Course.hasOne(CourseRoom, {
  foreignKey: "courseId",
});

CourseRoom.belongsTo(Course, {
  foreignKey: "courseId",
});

CourseRoom.hasMany(RoomMessage, {
  foreignKey: "roomId",
});

RoomMessage.belongsTo(CourseRoom, {
  foreignKey: "roomId",
});

RoomMessage.belongsTo(User, {
  foreignKey: "userId",
});


/* ================= BOOKMARK ================= */

User.hasMany(Bookmark, {
  foreignKey: "userId",
});

Bookmark.belongsTo(User, {
  foreignKey: "userId",
});

Course.hasMany(Bookmark, {
  foreignKey: "courseId",
});

Bookmark.belongsTo(Course, {
  foreignKey: "courseId",
});


/* ================= SESSION ================= */

/* PRODUCT → SESSION */

Product.hasOne(Session, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});

Session.belongsTo(Product, {
  foreignKey: "productId", // ✅ IMPORTANT FIX
});


/* SESSION → BOOKINGS */

Session.hasMany(SessionBooking, {
  foreignKey: "sessionId",
});

SessionBooking.belongsTo(Session, {
  foreignKey: "sessionId",
});

User.hasMany(SessionBooking, {
  foreignKey: "userId",
});

SessionBooking.belongsTo(User, {
  foreignKey: "userId",
});

/* ================= DIGITAL FILE ================= */

Product.hasOne(DigitalFile, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});

DigitalFile.belongsTo(Product, {
  foreignKey: "productId",
});

DigitalFile.hasMany(DigitalFileContent, {
  foreignKey: "digitalFileId",
  onDelete: "CASCADE",
});

DigitalFileContent.belongsTo(DigitalFile, {
  foreignKey: "digitalFileId",
});

User.belongsToMany(DigitalFile, {
  through: DigitalPurchase,
  foreignKey: "userId",
});

DigitalFile.belongsToMany(User, {
  through: DigitalPurchase,
  foreignKey: "digitalFileId",
});

// Each purchase belongs to a user
DigitalPurchase.belongsTo(User, {
  foreignKey: "userId",
  as: "User",
});

// A user can have many purchases
User.hasMany(DigitalPurchase, {
  foreignKey: "userId",
  as: "Purchases",
});





/* ================= EXPORT ================= */

module.exports = {
  User,
  Business,
  Product,
  Course,
  Event,
  Coupon,
  Enrollment,
  CourseRoom,
  RoomMessage,
  Bookmark,
  EventRoom,
  EventRoomMessage,
  EventRegistration,
  EventRegistrationQuestion,
  EventRegistrationAnswer,

  /* ✅ NEW EXPORTS */
  Quiz,
  QuizQuestion,
  Session,
  SessionBooking,
  DigitalFile,
DigitalFileContent,
DigitalPurchase,
};
