const Bookmark = require("../models/Bookmark.model");

/* ================= SAVE / UPDATE ================= */

exports.saveBookmark = async (req, res) => {
  try {
    const {
      courseId,
      chapterId,
      contentId,
      progress ,
    } = req.body;

    const userId = req.user.id;

    let bookmark = await Bookmark.findOne({
      where: { userId, courseId },
    });

    if (bookmark) {
      await bookmark.update({
        chapterId,
        contentId,
        progress,
      });
    } else {
      bookmark = await Bookmark.create({
        userId,
        courseId,
        chapterId,
        contentId,
        progress,
      });
    }

    res.json(bookmark);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Bookmark save failed",
    });
  }
};

/* ================= GET ================= */

exports.getMyBookmark = async (req, res) => {
  try {
    const { courseId } = req.params;

    const bookmark = await Bookmark.findOne({
      where: {
        userId: req.user.id,
        courseId,
      },
    });

    res.json(bookmark);
  } catch (err) {
    res.status(500).json({
      message: "Bookmark fetch failed",
    });
  }
};

/* ================= DELETE ================= */

exports.clearBookmark = async (req, res) => {
  const { courseId } = req.params;

  await Bookmark.destroy({
    where: {
      userId: req.user.id,
      courseId,
    },
  });

  res.json({ cleared: true });
};
