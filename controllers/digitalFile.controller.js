const Product = require("../models/Product.model");
const DigitalFile = require("../models/DigitalFile.model");
const DigitalFileContent = require("../models/DigitalFileContent.model");
const DigitalPurchase = require("../models/DigitalPurchase.model");
const Business = require("../models/Business.model");

/* ================= CREATE ================= */

exports.createDigitalFile = async (req, res) => {
  try {

    const {
      title,
      description,
      pricingType,
      pricing,
      pricingBreakdown,
      businessId,

      accessType,
      accessDays,
      expiryDate, // ✅ FIXED
    } = req.body;

    const business = await Business.findOne({
      where: {
        id: businessId,
        userId: req.user.id,
      },
    });

    if (!business) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const product = await Product.create({
      businessId,
      type: "digital",
      status: "draft",
    });

    const digital = await DigitalFile.create({

      productId: product.id,

      title,
      description,

      banner: req.file?.path || null,

      pricingType,

      pricing: pricing ? JSON.parse(pricing) : null,

      pricingBreakdown: pricingBreakdown
        ? JSON.parse(pricingBreakdown)
        : null,

      /* ✅ ACCESS */

      isLimited: !!accessType,

      accessType: accessType || null,

      accessDays:
        accessType === "days"
          ? Number(accessDays) || null
          : null,

      expiryDate:
        accessType === "fixed_date"
          ? expiryDate || null
          : null,
    });

    res.status(201).json(digital);

  } catch (err) {
    console.error("CREATE DIGITAL ERROR:", err);

    res.status(500).json({ message: "Create failed" });
  }
};



/* ================= DASHBOARD ================= */

exports.getMyDigitalFiles = async (req, res) => {

  const businesses = await Business.findAll({
    where: { userId: req.user.id },
  });

  const ids = businesses.map(b => b.id);

  const products = await Product.findAll({
    where: {
      businessId: ids,
      type: "digital",
    },
  });

  const productIds = products.map(p => p.id);

  const files = await DigitalFile.findAll({
    where: { productId: productIds },
    order: [["createdAt", "DESC"]],
  });

  res.json(files);
};


/* ================= SINGLE ================= */

exports.getDigitalFile = async (req, res) => {
  try {

    const file = await DigitalFile.findByPk(
      req.params.id,
      { include: [Product] }
    );

    if (!file) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    let isPurchased = false;
    let purchase = null;

    if (req.user) {

      purchase = await DigitalPurchase.findOne({
        where: {
          digitalFileId: req.params.id,
          userId: req.user.id,
        },
      });

      if (purchase) {
        isPurchased = true;
      }
    }

    /* ================= ACCESS LOGIC ================= */

    let accessType = file.accessType;
    let accessDays = file.accessDays;
    let expiryDate = file.expiryDate;
    let purchaseDate = null;
    let isExpired = false;

    if (purchase) {

      purchaseDate = purchase.createdAt;

      // 🔹 Snapshot logic
      accessType =
        purchase.accessType ?? file.accessType;

      accessDays =
        purchase.accessDays ?? file.accessDays;

      expiryDate =
        purchase.expiryDate ?? file.expiryDate;
    }

    // 🔹 Lifetime override (affects everyone)
    if (!file.accessType) {
      accessType = null;
      accessDays = null;
      expiryDate = null;
    }

    /* ================= EXPIRY CHECK ================= */

    if (purchase && accessType) {

      const now = new Date();

      if (accessType === "days") {

        const expire = new Date(purchaseDate);
        expire.setDate(expire.getDate() + accessDays);

        if (now > expire) {
          isExpired = true;
        }
      }

      if (accessType === "fixed_date") {

        if (now > new Date(expiryDate)) {
          isExpired = true;
        }
      }
    }

    const result = file.toJSON();

    result.isPurchased = isPurchased;
    result.purchaseDate = purchaseDate;
    result.accessType = accessType;
    result.accessDays = accessDays;
    result.expiryDate = expiryDate;
    result.isExpired = isExpired;

    res.json(result);

  } catch (err) {

    console.error("GET DIGITAL ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
};


/* ================= UPDATE ================= */

exports.updateDigitalFile = async (req, res) => {
  try {

    const file = await DigitalFile.findByPk(
      req.params.id
    );

    if (!file) {
      return res.status(404).json();
    }

    /* ================= BASIC ================= */

    file.title =
      req.body.title ?? file.title;

    file.description =
      req.body.description ?? file.description;

    if (req.file) {
      file.banner = req.file.path;
    }

    if (req.body.pricing) {
      file.pricing = JSON.parse(req.body.pricing);
    }

    file.pricingType =
      req.body.pricingType ??
      file.pricingType;

    /* ================= LIMITED ACCESS ================= */

   if (req.body.accessType !== undefined) {

  if (!req.body.accessType) {

    // Lifetime
    file.isLimited = false;
    file.accessType = null;
    file.accessDays = null;
    file.expiryDate = null;

  } else {

    file.isLimited = true;
    file.accessType = req.body.accessType;

    if (req.body.accessType === "days") {

      file.accessDays =
        Number(req.body.accessDays) || null;

      file.expiryDate = null;

    }

    if (req.body.accessType === "fixed_date") {

      file.expiryDate =
        req.body.expiryDate || null;

      file.accessDays = null;
    }
  }
}

    /* ================= SAVE ================= */

    await file.save();

    res.json(file);

  } catch (err) {

    console.error("UPDATE DIGITAL ERROR:", err);

    res.status(500).json({
      message: "Update failed",
    });
  }
};


/* ================= DELETE ================= */

exports.deleteDigitalFile = async (req, res) => {

  const file = await DigitalFile.findByPk(req.params.id, {
    include: [Product],
  });

  if (!file) return res.status(404).json();

  await file.Product.destroy();

  res.json({ message: "Deleted" });
};


/* ==================================================
   ================= MANAGE =========================
   ================================================== */

/* ================= ADD CONTENT ================= */

exports.addContent = async (req, res) => {
  try {

    const mainFile =
      req.file ||
      req.files?.file?.[0];

    const bannerFile =
      req.files?.banner?.[0];

    if (!mainFile) {
      return res.status(400).json({
        message: "Main file required",
      });
    }

    // ✅ Get max order
    const maxOrder = await DigitalFileContent.max(
      "order",
      {
        where: {
          digitalFileId: req.params.id,
        },
      }
    );

    const nextOrder =
      (maxOrder || 0) + 1;

    const originalName =
      mainFile.originalname || null;

    const extension =
      originalName?.split(".").pop() || null;

    const content = await DigitalFileContent.create({

      digitalFileId: req.params.id,

      heading: req.body.heading || "",

      fileUrl:
        mainFile.secure_url ||
        mainFile.path,

      fileType: mainFile.mimetype,

      banner:
        bannerFile?.secure_url ||
        bannerFile?.path ||
        null,

      originalName,
      extension,

      // ✅ NEW
      order: nextOrder,
    });

    res.json(content);

  } catch (err) {

    console.error("ADD CONTENT ERROR:", err);

    res.status(500).json({
      message: "Upload failed",
    });
  }
};

/* ================= GET CONTENTS ================= */

exports.getContents = async (req, res) => {

  const contents = await DigitalFileContent.findAll({
    where: {
      digitalFileId: req.params.id,
    },

    // ✅ ORDER BY position
    order: [["order", "ASC"]],
  });

  res.json(contents);
};


/* ================= DELETE CONTENT ================= */

exports.deleteContent = async (req, res) => {

  await DigitalFileContent.destroy({
    where: { id: req.params.contentId },
  });

  res.json({ success: true });
};


/* ================= UPDATE CONTENT ================= */

exports.updateContent = async (req, res) => {
  try {

    const content = await DigitalFileContent.findByPk(
      req.params.contentId
    );

    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    const mainFile =
      req.file ||
      req.files?.file?.[0];

    const bannerFile =
      req.files?.banner?.[0];

    if (req.body.heading !== undefined) {
      content.heading = req.body.heading;
    }

    if (mainFile) {

      const originalName =
        mainFile.originalname || null;

      const extension =
        originalName?.split(".").pop() || null;

      content.fileUrl =
        mainFile.secure_url ||
        mainFile.path;

      content.fileType =
        mainFile.mimetype;

      // ✅ NEW SAFE FIELDS
      content.originalName = originalName;
      content.extension = extension;
    }

    if (bannerFile) {
      content.banner =
        bannerFile.secure_url ||
        bannerFile.path;
    }

    await content.save();

    res.json(content);

  } catch (err) {

    console.error("UPDATE CONTENT ERROR:", err);

    res.status(500).json({
      message: "Update failed",
    });
  }
};


/* ================= AUDIENCE TAB ================= */

exports.getBuyers = async (req, res) => {
  try {

    const buyers = await DigitalPurchase.findAll({

      where: {
        digitalFileId: req.params.id, // ✅ FIX HERE
      },

      include: [
        {
          model: require("../models/User.model"),
          as: "User",
          attributes: ["id", "name", "email"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    res.json(buyers);

  } catch (err) {

    console.error("GET BUYERS ERROR:", err);

    res.status(500).json({
      message: "Failed to load buyers",
    });
  }
};

exports.reorderContents = async (req, res) => {
  try {

    const { orders } = req.body;
    // [{id:1, order:1},{id:2,order:2}]

    for (const item of orders) {

      await DigitalFileContent.update(
        { order: item.order },
        { where: { id: item.id } }
      );
    }

    res.json({ success: true });

  } catch (err) {

    console.error("REORDER ERROR:", err);

    res.status(500).json({
      message: "Reorder failed",
    });
  }
};