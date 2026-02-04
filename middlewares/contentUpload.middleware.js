const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let resourceType = "auto";

    // 🔥 FORCE PDF AS IMAGE (for preview)
    if (file.mimetype === "application/pdf") {
      resourceType = "image";
    }

    return {
      folder: "course-contents",
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const uploadContent = multer({ storage });

module.exports = uploadContent;
