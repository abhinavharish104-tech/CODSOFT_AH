const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getAllQuizzes,
  submitQuiz,
  getMyResults
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");

// Public route
router.get("/", getAllQuizzes);

// Protected route - create quiz
router.post("/", protect, createQuiz);

// Protected route - submit quiz
router.post("/submit", protect, submitQuiz);

// Protected route - get my results
router.get("/my-results", protect, getMyResults);

module.exports = router;
