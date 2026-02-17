const Chapter = require("../models/Chapter.model");
const Content = require("../models/Content.model");
const Quiz = require("../models/Quiz.model"); // ✅ NEW

const { sequelize } = require("../config/db");

/* ================= GET COURSE STRUCTURE ================= */

exports.getCourseChapters = async (req, res) => {
  try {
    const { courseId } = req.params;

    const chapters = await Chapter.findAll({
      where: { courseId },
      order: [["order", "ASC"]],
      include: [
        {
          model: Content,
          order: [["order", "ASC"]],
        },
      ],
    });

    res.json(chapters);

  } catch (err) {
    console.error("GET COURSE CHAPTERS ERROR:", err);
    res.status(500).json({
      message: "Failed to load course structure",
    });
  }
};


/**
 * ================= CREATE CHAPTER =================
 * POST /api/chapters/:courseId
 */
exports.createChapter = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { title, type } = req.body;
    const { courseId } = req.params;

    if (!title || !type) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Title and type are required",
      });
    }

    const lastOrder =
      (await Chapter.max("order", {
        where: { courseId },
      })) || 0;

    /* CREATE CHAPTER */
    const chapter = await Chapter.create({
  courseId,
  title: title.trim(),
  type,
  order: lastOrder + 1,
});

/* ✅ AUTO CREATE QUIZ CONTENT */
if (type === "quiz") {
  await Content.create({
    chapterId: chapter.id,
    title: "Quiz",
    type: "quiz",
    order: 1,
    data: {},
  });
}

    await transaction.commit();

    res.status(201).json(chapter);

  } catch (err) {
    await transaction.rollback();
    console.error("CREATE CHAPTER ERROR:", err);
    res.status(500).json({
      message: "Failed to create chapter",
    });
  }
};


/**
 * ================= GET CHAPTERS BY COURSE =================
 * GET /api/chapters/:courseId
 */
exports.getChaptersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const chapters = await Chapter.findAll({
      where: { courseId },
      order: [["order", "ASC"]],
    });

    res.json(chapters);

  } catch (err) {
    console.error("GET CHAPTERS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch chapters",
    });
  }
};


/**
 * ================= REORDER CHAPTERS =================
 * PATCH /api/chapters/:courseId/reorder
 */
exports.reorderChapters = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { chapters } = req.body;

    if (!Array.isArray(chapters)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Invalid chapters payload",
      });
    }

    for (const c of chapters) {
      await Chapter.update(
        { order: c.order },
        {
          where: { id: c.id },
          transaction,
        }
      );
    }

    await transaction.commit();

    res.json({
      message: "Chapters reordered successfully",
    });

  } catch (err) {
    await transaction.rollback();
    console.error("REORDER CHAPTERS ERROR:", err);
    res.status(500).json({
      message: "Failed to reorder chapters",
    });
  }
};
