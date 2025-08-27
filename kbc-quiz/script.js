// ---------- Prize Ladder (bottom-up) ----------
const PRIZES = [
    "₹1,000", "₹2,000", "₹3,000", "₹5,000", "₹10,000",
    "₹20,000", "₹40,000", "₹80,000", "₹1,60,000", "₹3,20,000",
    "₹6,40,000", "₹12,50,000", "₹25,00,000", "₹50,00,000", "₹1,00,00,000"
];

// ---------- Question Bank (easy -> medium -> hard) ----------
const BANK = {
    easy: [
        { q: "What is the capital of India?", a: ["Mumbai", "Delhi", "Kolkata", "Chennai"], c: "Delhi" },
        { q: "Which planet is called the 'Red Planet'?", a: ["Venus", "Mars", "Jupiter", "Saturn"], c: "Mars" },
        { q: "Who is known as the 'Father of the Nation' in India?", a: ["Nehru", "Mahatma Gandhi", "Sardar Patel", "Ambedkar"], c: "Mahatma Gandhi" },
        { q: "Which Indian festival is called the 'Festival of Lights'?", a: ["Holi", "Diwali", "Eid", "Baisakhi"], c: "Diwali" },
        { q: "The national animal of India is?", a: ["Lion", "Tiger", "Elephant", "Peacock"], c: "Tiger" },
        { q: "How many players are there in a cricket team?", a: ["9", "10", "11", "12"], c: "11" },
        { q: "Who was the first Prime Minister of India?", a: ["Mahatma Gandhi", "Subhash Bose", "Jawaharlal Nehru", "Rajendra Prasad"], c: "Jawaharlal Nehru" },
        { q: "Which is the largest state in India by area?", a: ["Madhya Pradesh", "Uttar Pradesh", "Rajasthan", "Maharashtra"], c: "Rajasthan" }
    ],
    medium: [
        { q: "Who wrote the book 'Discovery of India'?", a: ["Tagore", "Mahatma Gandhi", "Jawaharlal Nehru", "Sarojini Naidu"], c: "Jawaharlal Nehru" },
        { q: "Which is the smallest state of India by area?", a: ["Sikkim", "Goa", "Tripura", "Nagaland"], c: "Goa" },
        { q: "The dance form 'Bharatanatyam' belongs to which state?", a: ["Kerala", "Tamil Nadu", "Odisha", "Karnataka"], c: "Tamil Nadu" },
        { q: "What is the currency of the UK?", a: ["Dollar", "Euro", "Pound Sterling", "Yen"], c: "Pound Sterling" },
        { q: "Who was the first Indian woman in space?", a: ["Sunita Williams", "Kalpana Chawla", "Indira Gandhi", "Kiran Bedi"], c: "Kalpana Chawla" },
        { q: "Where is the famous Sun Temple located?", a: ["Konark", "Madurai", "Khajuraho", "Hampi"], c: "Konark" },
        { q: "Who invented the telephone?", a: ["Alexander Graham Bell", "Edison", "Tesla", "Marconi"], c: "Alexander Graham Bell" },
        { q: "Which river is called the 'Sorrow of Bihar'?", a: ["Ganga", "Kosi", "Yamuna", "Ghaghara"], c: "Kosi" }
    ],
    hard: [
        { q: "Who is known as the 'Missile Man of India'?", a: ["Vikram Sarabhai", "Homi Bhabha", "APJ Abdul Kalam", "Satish Dhawan"], c: "APJ Abdul Kalam" },
        { q: "Which country hosted the first modern Olympics (1896)?", a: ["France", "USA", "Greece", "UK"], c: "Greece" },
        { q: "In which year was the Indian Constitution adopted?", a: ["1947", "1949", "1950", "1952"], c: "1949" },
        { q: "Who composed 'Sare Jahan Se Achha'?", a: ["Bankim Chandra", "Tagore", "Muhammad Iqbal", "Bharati"], c: "Muhammad Iqbal" },
        { q: "What is the chemical symbol of Gold?", a: ["Au", "Ag", "Gd", "Pt"], c: "Au" },
        { q: "Which Mughal emperor built Jama Masjid?", a: ["Babur", "Akbar", "Shah Jahan", "Aurangzeb"], c: "Shah Jahan" },
        { q: "Which is the largest desert in the world?", a: ["Thar", "Sahara", "Gobi", "Antarctic Desert"], c: "Antarctic Desert" },
        { q: "Who was the first Indian to win a Nobel Prize?", a: ["CV Raman", "Amartya Sen", "Rabindranath Tagore", "Mother Teresa"], c: "Rabindranath Tagore" },
        { q: "Which gas is most abundant in Earth’s atmosphere?", a: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], c: "Nitrogen" },
        { q: "Which Indian city is called the 'City of Palaces'?", a: ["Hyderabad", "Mysuru", "Udaipur", "Jaipur"], c: "Mysuru" }
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
let gameQuestions = [];
let idx = 0;
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

    // timeLeft based on current idx (question number)
    if (idx <= 4) {
        timeLeft = 30;
    } else if (idx <= 9) {
        timeLeft = 60;
    } else {
        // No timer from question index 10 onwards
        timerEl.textContent = `No Time Limit`;
        return;
    }

    // Start countdown
    timerEl.textContent = `${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame("Time's up! Game Over.");
        }
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
            return setTimeout(() => endGame("Congratulations! You are a Crorepati!"), 900);
        }

        // Move to next question automatically
        setTimeout(() => renderQuestion(), 900);
    } else {
        endGame("Wrong Answer! Game Over.");
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
        "Audience Poll:\n" +
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

    alert(`Friend: I think it's "${suggestion}"`);
});

// ---------- Restart ----------
restartBtn.addEventListener("click", restart);

// ---------- Boot ----------
renderLadder();
restart(); // starts the game
