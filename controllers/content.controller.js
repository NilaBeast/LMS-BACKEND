const Content = require("../models/Content.model");
const { sequelize } = require("../config/db");

/* ================= CREATE CONTENT ================= */
exports.createContent = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { type, title, meta } = req.body;
    const file = req.file;

    if (!type || !title) {
      return res.status(400).json({ message: "Type and title required" });
    }

    const lastOrder =
      (await Content.max("order", { where: { chapterId } })) || 0;

    let data;

    // 🔹 FILE-BASED CONTENT
    if (["video", "assignment"].includes(type)) {
      if (!file) {
        return res.status(400).json({ message: "File required" });
      }

      data = {
        url: file.path,         // Cloudinary URL
        publicId: file.filename,
        mime: file.mimetype,
      };
    }

    // 🔹 JSON CONTENT
    if (["quiz", "form", "text"].includes(type)) {
      if (!meta) {
        return res.status(400).json({ message: "Meta required" });
      }
      data = JSON.parse(meta);
    }

    const content = await Content.create({
      chapterId,
      type,
      title: title.trim(),
      data,
      order: lastOrder + 1,
    });

    res.status(201).json(content);
  } catch (err) {
    console.error("CREATE CONTENT ERROR:", err);
    res.status(500).json({ message: "Failed to create content" });
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
  } catch (err) {
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
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ message: "Failed to reorder contents" });
  }
};
