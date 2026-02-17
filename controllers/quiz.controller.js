const Quiz = require("../models/Quiz.model");
const QuizQuestion = require("../models/QuizQuestion.model");

/* ================= CREATE QUIZ ================= */

exports.createQuiz = async (req, res) => {
  try {
    const { title } = req.body;
    const { chapterId } = req.params;

    if (!title) {
      return res.status(400).json({
        message: "Quiz title required",
      });
    }

    const quiz = await Quiz.create({
      chapterId,
      title,
    });

    res.json(quiz);
  } catch (err) {
    console.error("CREATE QUIZ ERROR:", err);
    res.status(500).json({ message: "Create quiz failed" });
  }
};

/* ================= GET QUIZ ================= */

exports.getQuizByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    /* FIND QUIZ */
    let quiz = await Quiz.findOne({
      where: { chapterId },
      include: [
        {
          model: QuizQuestion,
          order: [["order", "ASC"]],
        },
      ],
    });

    /* ✅ AUTO CREATE IF MISSING */
    if (!quiz) {
      quiz = await Quiz.create({
        chapterId,
        title: "Untitled Quiz",
      });
    }

    /* RELOAD WITH QUESTIONS */
    quiz = await Quiz.findOne({
      where: { chapterId },
      include: [
        {
          model: QuizQuestion,
          order: [["order", "ASC"]],
        },
      ],
    });

    res.json(quiz);

  } catch (err) {
    console.error("GET QUIZ ERROR:", err);
    res.status(500).json({
      message: "Load quiz failed",
    });
  }
};


/* ================= ADD QUESTION ================= */

exports.addQuestion = async (req, res) => {
  try {
    const data = req.body;
    const { quizId } = req.params;

    const last =
      (await QuizQuestion.max("order", {
        where: { quizId },
      })) || 0;

    const question = await QuizQuestion.create({
      ...data,
      quizId,
      order: last + 1,
    });

    res.json(question);
  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);
    res.status(500).json({ message: "Add question failed" });
  }
};

/* ================= UPDATE QUESTION ================= */

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const question = await QuizQuestion.findByPk(id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await question.update({
      type: data.type,
      subject: data.subject,
      topic: data.topic,
      difficulty: data.difficulty,
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      marks: data.marks,
      negativeMarks: data.negativeMarks,
    });

    res.json(question);

  } catch (err) {
    console.error("UPDATE QUESTION ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};


/* ================= DELETE QUESTION ================= */

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await QuizQuestion.findByPk(id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await question.destroy();

    res.json({ message: "Question deleted" });

  } catch (err) {
    console.error("DELETE QUESTION ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};