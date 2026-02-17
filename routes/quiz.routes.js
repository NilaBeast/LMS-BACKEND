const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getQuizByChapter,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/quiz.controller");

const {protect} = require("../middlewares/auth.middleware");

/* CREATE QUIZ */
router.post("/:chapterId", protect, createQuiz);

/* GET QUIZ */
router.get("/:chapterId", protect, getQuizByChapter);

/* ADD QUESTION */
router.post("/:quizId/question", protect, addQuestion);

// Update question
router.put("/question/:id", protect, updateQuestion);

// Delete question
router.delete("/question/:id", protect, deleteQuestion);

module.exports = router;
