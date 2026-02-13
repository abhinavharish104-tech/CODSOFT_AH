const Quiz = require("../models/quiz");
const Result = require("../models/Result");


// Create Quiz (Protected)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Title and questions are required" });
    }

    const quiz = await Quiz.create({
      title,
      description,
      questions,
      createdBy: req.user
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get All Quizzes (Public - Hide Correct Answers)
exports.getAllQuizzes = async (req, res) => {
  try {

    const quizzes = await Quiz.find()
      .populate("createdBy", "name email")
      .lean();

    const sanitizedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options
      }))
    }));

    res.json(sanitizedQuizzes);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Submit Quiz (Protected + Save Result)
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({ message: "Quiz ID and answers required" });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: "Invalid number of answers" });
    }

  let score = 0;

quiz.questions.forEach((question, index) => {
  console.log("Correct:", question.correctAnswer);
  console.log("User:", answers[index]);

  if (Number(question.correctAnswer) === Number(answers[index])) {
    score++;
  }
});



    const result = await Result.create({
      user: req.user,
      quiz: quizId,
      score,
      totalQuestions: quiz.questions.length
    });

    res.json({
      message: "Quiz submitted successfully",
      totalQuestions: quiz.questions.length,
      score,
      resultId: result._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get My Results (Protected)
exports.getMyResults = async (req, res) => {
  try {

    const results = await Result.find({ user: req.user })
      .populate("quiz", "title description")
      .sort({ createdAt: -1 });

    res.json(results);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
