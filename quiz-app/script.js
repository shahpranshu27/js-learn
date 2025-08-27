// Question bank
const questions = [
    { question: "Which language runs in a web browser?", answers: ["Java", "C", "Python", "JavaScript"], correct: "JavaScript" },
    { question: "Which company developed JavaScript?", answers: ["Microsoft", "Netscape", "Google", "Oracle"], correct: "Netscape" },
    { question: "Which symbol is used for comments in JavaScript?", answers: ["//", "<!-- -->", "#", "/* */"], correct: "//" },
    { question: "Which HTML tag is used to link a JavaScript file?", answers: ["<link>", "<script>", "<js>", "<javascript>"], correct: "<script>" },

    { question: "Who is known as the Father of the Nation in India?", answers: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "Subhas Chandra Bose"], correct: "Mahatma Gandhi" },
    { question: "Which is the largest continent?", answers: ["Africa", "Asia", "Europe", "North America"], correct: "Asia" },
    { question: "Who was the first man to step on the Moon?", answers: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "Michael Collins"], correct: "Neil Armstrong" },
    { question: "Which country has the most population in 2025?", answers: ["India", "China", "USA", "Brazil"], correct: "India" },

    { question: "What is the chemical symbol for Gold?", answers: ["Ag", "Au", "Gd", "Go"], correct: "Au" },
    { question: "Which planet is known as the Red Planet?", answers: ["Venus", "Mars", "Jupiter", "Mercury"], correct: "Mars" },
    { question: "Speed of light is approximately?", answers: ["300,000 km/s", "150,000 km/s", "30,000 km/s", "1,000 km/s"], correct: "300,000 km/s" },
    { question: "Water boils at what temperature (at sea level)?", answers: ["90°C", "100°C", "110°C", "120°C"], correct: "100°C" },

    { question: "Which country won the Cricket World Cup 2011?", answers: ["India", "Australia", "Sri Lanka", "Pakistan"], correct: "India" },
    { question: "Which footballer is known as 'CR7'?", answers: ["Lionel Messi", "Cristiano Ronaldo", "Neymar", "Kylian Mbappe"], correct: "Cristiano Ronaldo" },
    { question: "Olympics are held every how many years?", answers: ["2", "3", "4", "5"], correct: "4" },
    { question: "Which country hosted FIFA World Cup 2022?", answers: ["Russia", "Brazil", "Qatar", "USA"], correct: "Qatar" },

    { question: "Which is the highest-grossing movie of all time (as of 2025)?", answers: ["Avatar", "Avengers: Endgame", "Titanic", "Frozen 2"], correct: "Avatar" },
    { question: "Who is the singer of the hit song 'Shape of You'?", answers: ["Ed Sheeran", "Justin Bieber", "Shawn Mendes", "Charlie Puth"], correct: "Ed Sheeran" },
    { question: "Which animal is known as the King of the Jungle?", answers: ["Tiger", "Lion", "Elephant", "Leopard"], correct: "Lion" },
    { question: "Which board game has pieces called King and Queen?", answers: ["Checkers", "Chess", "Carrom", "Ludo"], correct: "Chess" }
];


// DOM elements
const questionElement = document.getElementById("question");
const answerList = document.getElementById("answer-list");
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");
const resultElement = document.getElementById("result");
const highscoreElement = document.getElementById("highscore");
const progressBar = document.getElementById("progress-bar");
const timerElement = document.getElementById("timer");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let highscore = localStorage.getItem("quizHighscore") || 0;

// Shuffle helper
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Load question
function loadQuestion() {
    resetState();

    let currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    let shuffledAnswers = shuffle([...currentQuestion.answers]);
    shuffledAnswers.forEach(answer => {
        const btn = document.createElement("button");
        btn.textContent = answer;
        btn.classList.add("answer-btn");
        btn.onclick = () => selectAnswer(btn, currentQuestion.correct);
        answerList.appendChild(btn);
    });

    updateProgress();
    startTimer();
}

// Handle answer selection
function selectAnswer(selectedBtn, correctAnswer) {
    if (selectedBtn.textContent === correctAnswer) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("wrong");
        Array.from(answerList.children).forEach(btn => {
            if (btn.textContent === correctAnswer) btn.classList.add("correct");
        });
    }

    Array.from(answerList.children).forEach(btn => btn.disabled = true);
    nextButton.classList.remove("hidden");
    clearInterval(timer);
}

// Reset state
function resetState() {
    nextButton.classList.add("hidden");
    clearInterval(timer);
    timeLeft = 15;
    timerElement.textContent = `⏳ Time left: ${timeLeft}s`;
    answerList.innerHTML = "";
}

// Progress bar
function updateProgress() {
    let progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `⏳ Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            nextButton.classList.remove("hidden");
            let correct = questions[currentQuestionIndex].correct;
            Array.from(answerList.children).forEach(btn => {
                btn.disabled = true;
                if (btn.textContent === correct) btn.classList.add("correct");
            });
        }
    }, 1000);
}

// Next button
nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
});

// Show result
function showResult() {
    document.getElementById("quiz").classList.add("hidden");
    nextButton.classList.add("hidden");
    timerElement.classList.add("hidden");
    progressBar.style.width = "100%";

    let percentage = Math.round((score / questions.length) * 100);
    let message = percentage >= 80 ? "Excellent!" : percentage >= 50 ? "Good!" : "Keep Practicing!";
    resultElement.classList.remove("hidden");
    resultElement.textContent = `You scored ${score}/${questions.length} (${percentage}%) - ${message}`;

    if (score > highscore) {
        localStorage.setItem("quizHighscore", score);
        highscore = score;
    }

    highscoreElement.classList.remove("hidden");
    highscoreElement.textContent = `High Score: ${highscore}/${questions.length}`;

    restartButton.classList.remove("hidden");
}

// Restart
restartButton.addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    resultElement.classList.add("hidden");
    highscoreElement.classList.add("hidden");
    restartButton.classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
    timerElement.classList.remove("hidden");
    loadQuestion();
});

// Start quiz
shuffle(questions);
loadQuestion();