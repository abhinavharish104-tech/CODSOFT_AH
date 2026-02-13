const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);

// Quiz Routes
app.use("/api/quizzes", quizRoutes);

// Protected Test Route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed protected route",
    userId: req.user
  });
});

// Root Test Route
app.get("/", (req, res) => {
  res.send("Quiz API Running");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo Error:", err.message));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
