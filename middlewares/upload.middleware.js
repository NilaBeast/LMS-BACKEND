const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
  params: {
    folder: "business-logos",
    allowed_formats: [
  "jpg", "jpeg", "png", "webp",
  "gif", "bmp", "tiff", "svg",
  "avif", "heic", "ico", "jfif"
],

  },
});

const upload = multer({storage});

module.exports = upload;