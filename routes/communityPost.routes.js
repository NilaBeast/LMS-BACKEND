const router = require("express").Router();

const postController = require("../controllers/communityPost.controller");
const commentController = require("../controllers/communityComment.controller");

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

/* ================= POSTS ================= */

/* CREATE POST */
router.post(
  "/:communityId",
  protect,
  upload.single("media"), // VERY IMPORTANT
  postController.createPost
);
router.put(
  "/post/:postId",
  protect,
  upload.single("media"), // ✅ IMPORTANT
  postController.editPost
);
/* GET FEED */
router.get(
  "/:communityId/feed",
  protect,
  postController.getFeed
);

router.patch(
  "/post/:postId/approve",
  protect,
  postController.approvePost
);
/* LIKE POST */
router.post(
  "/post/:postId/like",
  protect,
  postController.toggleLike
);

/* ADD COMMENT */
router.post(
  "/post/:postId/comment",
  protect,
  commentController.addComment
);

/* DELETE COMMENT */
router.delete(
  "/comment/:commentId",
  protect,
  commentController.deleteComment
);

/* DELETE POST */
router.delete(
  "/post/:postId",
  protect,
  postController.deletePost
);

module.exports = router;