const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    let resourceType = "auto";

    // Force video for video files
    if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }

    if (file.mimetype === "application/pdf") {
      resourceType = "raw";
    }

    return {
      folder: "course-contents",
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const uploadContent = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

module.exports = uploadContent;
