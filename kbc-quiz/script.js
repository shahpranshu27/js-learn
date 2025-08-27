// ---------- Prize Ladder (bottom-up) ----------
const PRIZES = [
    "₹1,000", "₹2,000", "₹3,000", "₹5,000", "₹10,000",
    "₹20,000", "₹40,000", "₹80,000", "₹1,60,000", "₹3,20,000",
    "₹6,40,000", "₹12,50,000", "₹25,00,000", "₹50,00,000", "₹1,00,00,000"
]; // index 0 is the bottom (₹1,000)

// ---------- Question Bank (easy -> medium -> hard) ----------
const BANK = {
    easy: [
        { q: "What is the capital of India?", a: ["Mumbai", "Delhi", "Kolkata", "Chennai"], c: "Delhi" },
        { q: "2 + 2 = ?", a: ["3", "4", "5", "6"], c: "4" },
        { q: "Which gas do plants absorb?", a: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], c: "Carbon Dioxide" },
        { q: "Which is a web language?", a: ["Python", "C++", "JavaScript", "Java"], c: "JavaScript" },
        { q: "Largest mammal?", a: ["Elephant", "Blue Whale", "Giraffe", "Hippo"], c: "Blue Whale" },
        { q: "How many days in a week?", a: ["5", "6", "7", "8"], c: "7" },
    ],
    medium: [
        { q: "Red Planet is?", a: ["Earth", "Venus", "Mars", "Jupiter"], c: "Mars" },
        { q: "Largest ocean?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], c: "Pacific" },
        { q: "Author of Indian National Anthem?", a: ["Tagore", "Bankim Chandra", "Gandhi", "Tilak"], c: "Tagore" },
        { q: "First PM of India?", a: ["Patel", "Nehru", "Shastri", "Indira Gandhi"], c: "Nehru" },
        { q: "H2O is?", a: ["Hydrogen Peroxide", "Water", "Oxygen", "Salt"], c: "Water" },
        { q: "CPU stands for?", a: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Control Processing Unit"], c: "Central Processing Unit" },
    ],
    hard: [
        { q: "Theory of Relativity by?", a: ["Newton", "Einstein", "Tesla", "Edison"], c: "Einstein" },
        { q: "Great Barrier Reef is in?", a: ["USA", "Australia", "India", "South Africa"], c: "Australia" },
        { q: "Longest river (commonly cited)?", a: ["Amazon", "Nile", "Yangtze", "Mississippi"], c: "Nile" },
        { q: "Who wrote 'Hamlet'?", a: ["Homer", "Shakespeare", "Dickens", "Tolstoy"], c: "Shakespeare" },
        { q: "Currency of Japan?", a: ["Yen", "Won", "Ringgit", "Baht"], c: "Yen" },
        { q: "Vitamin C chemical name?", a: ["Retinol", "Ascorbic Acid", "Calciferol", "Cobalamin"], c: "Ascorbic Acid" },
        { q: "Smallest prime number?", a: ["0", "1", "2", "3"], c: "2" },
        { q: "Which year did WW2 end?", a: ["1942", "1945", "1947", "1950"], c: "1945" },
    ]
};

// ---------- DOM ----------
const ladderEl = document.getElementById("ladder");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const timerEl = document.getElementById("timer");
const moneyEl = document.getElementById("money-earned");
const gameOverBox = document.getElementById("game-over");
const resultText = document.getElementById("result-text");
const restartBtn = document.getElementById("restartBtn");

const fiftyBtn = document.getElementById("fiftyBtn");
const audienceBtn = document.getElementById("audienceBtn");
const phoneBtn = document.getElementById("phoneBtn");

// ---------- State ----------
let gameQuestions = [];       // prebuilt list of 15 questions (increasing difficulty)
let idx = 0;                  // current question index (0 → bottom prize)
let moneyWon = 0;
let timer = null;
let timeLeft = 30;
let lifelines = { fifty: false, audience: false, phone: false };

// ---------- Helpers ----------
const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);

function sampleWithoutReplacement(arr, n) {
    const pool = shuffle(arr);
    return pool.slice(0, Math.min(n, pool.length));
}

function buildGameQuestions() {
    // 5 easy, 5 medium, 5 hard to match 15 prize steps
    const easy = sampleWithoutReplacement(BANK.easy, 5);
    const med = sampleWithoutReplacement(BANK.medium, 5);
    const hard = sampleWithoutReplacement(BANK.hard, 5);

    // If a bank is short, pad from itself shuffled (rare)
    function pad(list, bank, need) {
        while (list.length < need) list.push(shuffle(bank)[0]);
        return list;
    }
    pad(easy, BANK.easy, 5);
    pad(med, BANK.medium, 5);
    pad(hard, BANK.hard, 5);

    return [...easy, ...med, ...hard];
}

function renderLadder() {
    // We render in ascending order; CSS flips it bottom-up with column-reverse
    ladderEl.innerHTML = PRIZES
        .map((amt, i) => `<li data-step="${i}">${amt}</li>`)
        .join("");
    highlightStep();
}

function highlightStep() {
    Array.from(ladderEl.children).forEach(li => li.classList.remove("active"));
    const currentLi = ladderEl.querySelector(`li[data-step="${idx}"]`);
    if (currentLi) currentLi.classList.add("active");
}

function setTimer() {
    clearInterval(timer);
    // 30s up to ₹10,000 (idx 0..4), then 60s from ₹20,000 (idx 5) onwards
    timeLeft = idx < 5 ? 30 : 60;
    timerEl.textContent = `⏳ ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `⏳ ${timeLeft}s`;
        if (timeLeft <= 0) return endGame("⏰ Time's up! Game Over.");
    }, 1000);
}

function renderQuestion() {
    const q = gameQuestions[idx];
    questionEl.textContent = q.q;
    optionsEl.innerHTML = "";
    shuffle(q.a).forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.addEventListener("click", () => selectAnswer(btn, q.c));
        optionsEl.appendChild(btn);
    });
    highlightStep();
    setTimer();
}

function lockOptions() {
    Array.from(optionsEl.children).forEach(b => (b.disabled = true));
}

function selectAnswer(btn, correct) {
    clearInterval(timer);
    const chosen = btn.textContent;
    const isCorrect = chosen === correct;

    // Reveal correctness
    Array.from(optionsEl.children).forEach(b => {
        if (b.textContent === correct) b.classList.add("correct");
        if (b === btn && !isCorrect) b.classList.add("wrong");
        b.disabled = true;
    });

    if (isCorrect) {
        moneyWon = PRIZES[idx];
        moneyEl.textContent = `Money Won: ${moneyWon}`;
        idx++;

        if (idx >= PRIZES.length) {
            // Crorepati!
            return setTimeout(() => endGame("🎉 Congratulations! You are a Crorepati!"), 900);
        }

        // Move to next question automatically
        setTimeout(() => renderQuestion(), 900);
    } else {
        endGame("❌ Wrong Answer! Game Over.");
    }
}

function endGame(message) {
    clearInterval(timer);
    lockOptions();
    questionEl.textContent = message;
    resultText.textContent = `You won: ${moneyWon || "₹0"}`;
    gameOverBox.classList.remove("hidden");
    // disable lifelines
    fiftyBtn.disabled = true;
    audienceBtn.disabled = true;
    phoneBtn.disabled = true;
}

function restart() {
    // reset state
    idx = 0;
    moneyWon = 0;
    lifelines = { fifty: false, audience: false, phone: false };
    gameOverBox.classList.add("hidden");
    fiftyBtn.disabled = false;
    audienceBtn.disabled = false;
    phoneBtn.disabled = false;
    moneyEl.textContent = "Money Won: ₹0";
    gameQuestions = buildGameQuestions();  // fresh random set
    renderLadder();
    renderQuestion();
}

// ---------- Lifelines ----------
fiftyBtn.addEventListener("click", () => {
    if (lifelines.fifty) return;
    lifelines.fifty = true;
    fiftyBtn.disabled = true;

    const q = gameQuestions[idx];
    const wrong = shuffle(q.a.filter(x => x !== q.c)).slice(0, 2);
    Array.from(optionsEl.children).forEach(b => {
        if (wrong.includes(b.textContent)) b.style.display = "none";
    });
});

audienceBtn.addEventListener("click", () => {
    if (lifelines.audience) return;
    lifelines.audience = true;
    audienceBtn.disabled = true;

    const q = gameQuestions[idx];
    const options = shuffle(q.a);
    // Weighted random: correct gets higher %
    let remaining = 100;
    const scores = {};
    options.forEach((opt, i) => {
        let p = opt === q.c ? Math.floor(Math.random() * 31) + 40 : Math.floor(Math.random() * 21) + 5;
        scores[opt] = p;
        remaining -= p;
    });
    // Adjust to total 100
    const last = options[options.length - 1];
    scores[last] += remaining;

    alert(
        "📊 Audience Poll:\n" +
        options.map(o => `${o}: ${scores[o]}%`).join("\n")
    );
});

phoneBtn.addEventListener("click", () => {
    if (lifelines.phone) return;
    lifelines.phone = true;
    phoneBtn.disabled = true;

    const q = gameQuestions[idx];
    // 80% chance friend suggests correct
    const suggestCorrect = Math.random() < 0.8;
    const suggestion = suggestCorrect ? q.c : shuffle(q.a.filter(x => x !== q.c))[0];

    alert(`📞 Friend: I think it's "${suggestion}"`);
});

// ---------- Restart ----------
restartBtn.addEventListener("click", restart);

// ---------- Boot ----------
renderLadder();
restart(); // starts the game
