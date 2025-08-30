const quotes = [
    "The quick brown fox jumps over the lazy dog.",
    "JavaScript makes web pages interactive and dynamic.",
    "Practice makes perfect when learning to code.",
    "Typing fast is not as important as typing accurately.",
    "A journey of a thousand miles begins with a single step."
];

const quoteEl = document.getElementById("quote");
const inputEl = document.getElementById("input");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

let timeLeft = 60;
let timer = null;
let currentQuote = "";
let typedChars = 0;
let correctChars = 0;
let started = false;

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function startGame() {
    if (started) return; // avoid multiple starts
    started = true;
    inputEl.disabled = false;
    inputEl.value = "";
    inputEl.focus();

    currentQuote = getRandomQuote();
    quoteEl.textContent = currentQuote;

    timeLeft = 60;
    timerEl.textContent = timeLeft;
    typedChars = 0;
    correctChars = 0;

    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timer);
    inputEl.disabled = true;
    started = false;
}

function resetGame() {
    clearInterval(timer);
    started = false;
    timeLeft = 60;
    timerEl.textContent = 60;
    wpmEl.textContent = 0;
    accuracyEl.textContent = 100;
    inputEl.value = "";
    inputEl.disabled = true;
    quoteEl.textContent = "Click Start to begin!";
}

function calculateStats() {
    typedChars = inputEl.value.length;

    let correct = 0;
    for (let i = 0; i < inputEl.value.length; i++) {
        if (inputEl.value[i] === currentQuote[i]) {
            correct++;
        }
    }
    correctChars = correct;

    // WPM = (characters/5) / (time spent in minutes)
    let timeSpent = 60 - timeLeft;
    let wpm = timeSpent > 0 ? Math.round((typedChars / 5) / (timeSpent / 60)) : 0;

    let accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100;

    wpmEl.textContent = wpm;
    accuracyEl.textContent = accuracy;
}

inputEl.addEventListener("input", calculateStats);
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

// Initial state
resetGame();
