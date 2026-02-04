const Chapter = require("../models/Chapter.model");
const Content = require("../models/Content.model");

const { sequelize } = require("../config/db");

exports.getCourseChapters = async (req, res) => {
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
};
/**
 * CREATE CHAPTER
 * POST /api/chapters/:courseId
 */
exports.createChapter = async (req, res) => {
  try {
    const { title } = req.body;
    const { courseId } = req.params;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const lastOrder =
      (await Chapter.max("order", { where: { courseId } })) || 0;

    const chapter = await Chapter.create({
      courseId,
      title: title.trim(),
      order: lastOrder + 1,
    });

    res.status(201).json(chapter);
  } catch (err) {
    console.error("CREATE CHAPTER ERROR:", err);
    res.status(500).json({ message: "Failed to create chapter" });
  }
};

/**
 * GET CHAPTERS BY COURSE (ORDERED)
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
    res.status(500).json({ message: "Failed to fetch chapters" });
  }
};

/**
 * REORDER CHAPTERS
 * PATCH /api/chapters/:courseId/reorder
 */
exports.reorderChapters = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { chapters } = req.body;

    if (!Array.isArray(chapters)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid chapters payload" });
    }

    for (const c of chapters) {
      await Chapter.update(
        { order: c.order },
        { where: { id: c.id }, transaction }
      );
    }

    await transaction.commit();
    res.json({ message: "Chapters reordered successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error("REORDER CHAPTERS ERROR:", err);
    res.status(500).json({ message: "Failed to reorder chapters" });
  }
};
