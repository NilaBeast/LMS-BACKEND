const Content = require("../models/Content.model");
const { sequelize } = require("../config/db");

/* ================= CREATE CONTENT ================= */
exports.createContent = async (req, res) => {
  try {
    const {
      title,
      duration,
      pages,
      meta,
      allowBookmark,
    } = req.body;

    const chapterId = req.params.chapterId;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title required",
      });
    }

    /* ORDER */
    const last = await Content.findOne({
      where: { chapterId },
      order: [["order", "DESC"]],
    });

    const nextOrder = last ? last.order + 1 : 1;

    /* TYPE DETECTION */
    let contentType = "text";

    if (req.file) {
      if (req.file.mimetype.startsWith("video/")) {
        contentType = "video";
      } else if (req.file.mimetype.startsWith("image/")) {
        contentType = "image";
      } else if (
        req.file.mimetype === "application/pdf"
      ) {
        contentType = "pdf";
      }
    }

    /* DATA */
    let data = {};

    if (meta) data = JSON.parse(meta);

    if (req.file) {
      data.url = req.file.path;
      data.publicId = req.file.filename;
      data.mime = req.file.mimetype;
    }

    /* CREATE */
    const content = await Content.create({
      chapterId,
      title,
      type: contentType,

      duration: Number(duration) || 0,
      pages: Number(pages) || 0,

      order: nextOrder,

      allowBookmark:
        allowBookmark === "false" ? false : true,

      data,
    });

    res.json(content);

  } catch (err) {
    console.error("CREATE CONTENT ERROR:", err);
    res.status(500).json({ message: "Create failed" });
  }
};

/* ================= GET BY CHAPTER ================= */

exports.getContentsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const contents = await Content.findAll({
      where: { chapterId },
      order: [["order", "ASC"]],
    });

    res.json(contents);
  } catch {
    res.status(500).json({ message: "Failed to load contents" });
  }
};

/* ================= REORDER ================= */

exports.reorderContents = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { contents } = req.body;

    for (const c of contents) {
      await Content.update(
        { order: c.order, chapterId: c.chapterId },
        { where: { id: c.id }, transaction }
      );
    }

    await transaction.commit();

    res.json({ message: "Contents reordered" });

  } catch {
    await transaction.rollback();
    res.status(500).json({ message: "Failed to reorder contents" });
  }
};
