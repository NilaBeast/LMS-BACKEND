const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");


/* ===============================
   FILE FILTER
================================ */

const fileFilter = (req, file, cb) => {

  const allowed = [

    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    // Videos
    "video/mp4",
    "video/quicktime",

    // ✅ PDFs
    "application/pdf",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only images, videos, and PDFs are allowed"),
      false
    );
  }
};


/* ===============================
   CLOUDINARY STORAGE
================================ */

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    const isVideo =
      file.mimetype.startsWith("video");

    const isPdf =
      file.mimetype === "application/pdf";

    return {

      folder: "digital-files",

      // ✅ IMPORTANT
      resource_type: isVideo
        ? "video"
        : isPdf
        ? "raw"
        : "image",

      // ❌ DO NOT FORCE FORMAT
      // Cloudinary will decide

      public_id: `digital_${Date.now()}`,

      transformation:
        !isVideo && !isPdf
          ? [
              {
                width: 1200,
                height: 630,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto",
              },
            ]
          : undefined,
    };
  },
});


/* ===============================
   MULTER CONFIG
================================ */

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;