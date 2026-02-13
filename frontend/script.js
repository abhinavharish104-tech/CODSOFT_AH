const API_URL = "http://localhost:5000/api";

/* =========================
   AUTH SECTION
========================= */

// Register
async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    document.getElementById("regMessage").innerText = data.message;
}

// Login
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "quizzes.html";
    } else {
        document.getElementById("loginMessage").innerText = data.message;
    }
}

// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

/* =========================
   QUIZ LISTING
========================= */

async function loadQuizzes() {
    const res = await fetch(`${API_URL}/quizzes`);
    const quizzes = await res.json();

    const container = document.getElementById("quizList");
    container.innerHTML = "";

    quizzes.forEach(q => {
        const div = document.createElement("div");
        div.className = "container";

        div.innerHTML = `
            <h3>${q.title}</h3>
            <p>${q.description}</p>
            <button onclick="startQuiz('${q._id}')">Start Quiz</button>
        `;

        container.appendChild(div);
    });
}

function startQuiz(id) {
    localStorage.setItem("quizId", id);
    window.location.href = "attempt.html";
}

function goToResults() {
    window.location.href = "my-results.html";
}

function goBack() {
    window.location.href = "quizzes.html";
}

/* =========================
   ONE QUESTION AT A TIME MODE
========================= */

let currentQuestionIndex = 0;
let selectedAnswers = [];
let quizData = null;

async function loadQuizForAttempt() {
    const quizId = localStorage.getItem("quizId");

    const res = await fetch(`${API_URL}/quizzes`);
    const quizzes = await res.json();

    quizData = quizzes.find(q => q._id === quizId);

    const container = document.getElementById("quizContainer");

    if (!quizData) {
        container.innerHTML = "Quiz not found.";
        return;
    }

    currentQuestionIndex = 0;
    selectedAnswers = [];

    showQuestion();
}

function showQuestion() {
    const container = document.getElementById("quizContainer");

    if (currentQuestionIndex >= quizData.questions.length) {
        submitQuiz();
        return;
    }

    const question = quizData.questions[currentQuestionIndex];

    container.innerHTML = `
        <h2>${quizData.title}</h2>
        <p><strong>Question ${currentQuestionIndex + 1} of ${quizData.questions.length}</strong></p>
        <p>${question.questionText}</p>
        <div class="options">
            ${question.options.map((opt, i) => `
                <label>
                    <input type="radio" name="option" value="${i}">
                    ${opt}
                </label>
            `).join("")}
        </div>
        <button onclick="nextQuestion()">Next</button>
    `;
}

function nextQuestion() {
    const selected = document.querySelector('input[name="option"]:checked');
    selectedAnswers.push(selected ? parseInt(selected.value) : -1);

    currentQuestionIndex++;
    showQuestion();
}

async function submitQuiz() {
    const quizId = localStorage.getItem("quizId");
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/quizzes/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            quizId,
            answers: selectedAnswers
        })
    });

    const data = await res.json();

    localStorage.setItem("resultData", JSON.stringify(data));
    window.location.href = "result.html";
}

/* =========================
   RESULT PAGE (Instant Result)
========================= */

function loadResult() {
    const data = JSON.parse(localStorage.getItem("resultData"));
    const container = document.getElementById("resultContainer");

    if (!data) {
        container.innerHTML = "No result found.";
        return;
    }

    const percentage = Math.round((data.score / data.totalQuestions) * 100);

    container.innerHTML = `
        <h2>Score: ${data.score} / ${data.totalQuestions}</h2>
        <h3>Percentage: ${percentage}%</h3>
    `;
}

/* =========================
   MY RESULTS PAGE (History)
========================= */

async function loadMyResults() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const res = await fetch(`${API_URL}/quizzes/my-results`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const results = await res.json();
    const container = document.getElementById("resultContainer");
    container.innerHTML = "";

    if (!results.length) {
        container.innerHTML = "<p>No attempts yet.</p>";
        return;
    }

    results.forEach(r => {
        const percentage = Math.round((r.score / r.totalQuestions) * 100);

        const div = document.createElement("div");
        div.className = "container";

        div.innerHTML = `
            <h3>${r.quiz.title}</h3>
            <p>Score: ${r.score} / ${r.totalQuestions}</p>
            <p>Percentage: ${percentage}%</p>
            <p>Date: ${new Date(r.createdAt).toLocaleString()}</p>
        `;

        container.appendChild(div);
    });
}

/* =========================
   QUIZ CREATION
========================= */

let questionsArray = [];

function addQuestion() {
    const questionText = document.getElementById("questionText").value;
    const options = [
        document.getElementById("option1").value,
        document.getElementById("option2").value,
        document.getElementById("option3").value,
        document.getElementById("option4").value
    ];
    const correctAnswer = parseInt(document.getElementById("correctIndex").value);

    questionsArray.push({
        questionText,
        options,
        correctAnswer
    });

    alert("Question Added!");
}

async function submitNewQuiz() {
    const token = localStorage.getItem("token");

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    const res = await fetch(`${API_URL}/quizzes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            description,
            questions: questionsArray
        })
    });

    const data = await res.json();
    if (res.ok) {
    alert("Quiz Created Successfully!");
    window.location.href = "quizzes.html";
} else {
    document.getElementById("message").innerText = data.message;
}
}