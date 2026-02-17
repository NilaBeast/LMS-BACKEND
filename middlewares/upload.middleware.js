const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* ===============================
   FILE FILTER (SECURITY)
================================ */
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    "video/mp4",
    "video/quicktime", // mov (optional)
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, PNG, WEBP, GIF, and MP4 videos are allowed"),
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
    const isVideo = file.mimetype.startsWith("video");

    return {
      folder: "events/media", // ✅ Dedicated folder

      resource_type: isVideo ? "video" : "image",

      format: isVideo ? "mp4" : "jpg",

      public_id: `event_${Date.now()}`,

      transformation: isVideo
        ? [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ]
        : [
            {
              width: 1200,
              height: 630,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
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
    fileSize: 50 * 1024 * 1024, // ✅ 50MB (videos allowed)
  },
});

module.exports = upload;
