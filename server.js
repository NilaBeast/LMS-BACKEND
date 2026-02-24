require("dotenv").config();
const express = require("express");
const cors = require("cors");

// ROUTES
const authRoutes = require("./routes/auth.routes");
const businessRoutes = require("./routes/business.routes");
const productRoutes = require("./routes/product.routes");
const courseRoutes = require("./routes/course.routes");
const adminRoutes = require("./routes/admin.routes");     // 🔥 NEW
const publicRoutes = require("./routes/public.routes");   // 🔥 NEW
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
const purchaseRoutes = require("./routes/purchase.routes");

// DB
const { connectDB, sequelize } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * 🔹 MIDDLEWARES
 */
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite frontend
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


/**
 * 🔹 ROUTES
 */
app.use("/api/auth", authRoutes);

// 🔐 ADMIN / AUTHENTICATED
app.use("/api/business", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enroll", enrollmentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/enroll", enrollmentRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/event-rooms", eventRoomRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/digital-files", digitalFileRoutes);
app.use("/api/purchase", purchaseRoutes);


// 👑 ADMIN PANEL
app.use("/api/admin", adminRoutes);

// 🌍 PUBLIC (NO AUTH)
app.use("/api/public", publicRoutes);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

/**
 * 🔹 SERVER START
 */
(async () => {
  try {
    // 1️⃣ Connect DB ONCE
    await connectDB();

    // 2️⃣ Register Sequelize associations (CRITICAL)
    require("./models");

    // 3️⃣ Sync DB (DEV ONLY)
    // ⚠️ Use migrations in production
    await sequelize.sync({alter: true});

    // 4️⃣ Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
})();
