require("dotenv").config();
const express = require("express");
const cors = require("cors");

/* ================= ROUTES ================= */

const authRoutes = require("./routes/auth.routes");
const businessRoutes = require("./routes/business.routes");
const productRoutes = require("./routes/product.routes");
const courseRoutes = require("./routes/course.routes");
const packageRoutes = require("./routes/package.routes");
const membershipRoutes = require("./routes/membership.routes"); // ✅ ADD THIS
const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const roomRoutes = require("./routes/room.routes");
const chapterRoutes = require("./routes/chapter.routes");
const contentRoutes = require("./routes/content.routes");
const bookmarkRoutes = require("./routes/bookmark.routes");
const eventRoutes = require("./routes/event.routes");
const eventRoomRoutes = require("./routes/eventRoom.routes");
const quizRoutes = require("./routes/quiz.routes");
const sessionRoutes = require("./routes/session.routes");
const digitalFileRoutes = require("./routes/digitalFile.routes");
const purchaseRoutes = require("./routes/packagePurchase.routes");
const membershipPurchaseRoutes = require("./routes/membershipPurchase.routes");
const DigitalPurchase = require("./routes/purchase.routes");
/* ================= DB ================= */

const { connectDB, sequelize } = require("./config/db");

/* ================= APP ================= */

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC ================= */

app.use("/uploads", express.static("uploads"));

/* ================= ROUTES ================= */

/* AUTH */
app.use("/api/auth", authRoutes);

/* ADMIN / AUTH */
app.use("/api/business", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/memberships", membershipRoutes); // ✅ ADD THIS
app.use("/api/enroll", enrollmentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/event-rooms", eventRoomRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/digital-files", digitalFileRoutes);
app.use("/api/purchase", DigitalPurchase);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/membership-purchase", membershipPurchaseRoutes);
/* ADMIN PANEL */
app.use("/api/admin", adminRoutes);

/* PUBLIC */
app.use("/api/public", publicRoutes);

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

/* ================= SERVER ================= */

(async () => {
  try {
    await connectDB();

    require("./models");

    await sequelize.sync({ alter: true });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
})();