const questions = [
    {
        question: "Which language runs in a web browser?",
        answers: ["Java", "C", "Python", "JavaScript"],
        correct: "JavaScript"
    },
    {
        question: "What does CSS stand for?",
        answers: [
            "Central Style Sheets",
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style Sheets"
        ],
        correct: "Cascading Style Sheets"
    },
    {
        question: "What does HTML stand for?",
        answers: [
            "HyperText Markup Language",
            "HyperText Machine Language",
            "HyperTool Multi Language",
            "Hyperlinks Text Markup Language"
        ],
        correct: "HyperText Markup Language"
    },
    {
        question: "Which year was JavaScript launched?",
        answers: ["1996", "1995", "1994", "None of the above"],
        correct: "1995"
    }
];

const questionElement = document.getElementById('question');
const answerButton = document.querySelectorAll('.answer-btn');
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById('restart-btn');
const resultElement = document.getElementById('result');
const progressBar = document.getElementById('progress-bar');
const timerElement = document.getElementById('timer');

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;

function loadQuestions(){
    resetState();

    let currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    answerButton.forEach((btn, index) =>{
        btn.textContent = currentQuestion.answers[index];
        btn.classList.remove("correct", "wrong");
        btn.disabled = false;
        btn.onclick = () => selectAnswer(btn);
    });

    updateProgress();
    startTimer();
}

function selectAnswer(selectedBtn){
    let correct = questions[currentQuestionIndex].correct;

    if(selectedBtn.textContent === correct){
        selectedBtn.classList.add('correct');
        score++;
    }
    else{
        selectedBtn.classList.add('wrong');
        answerButton.forEach(btn => {
            if(btn.textContent === correct) btn.classList.add('correct');
        });
    }

    answerButton.forEach(btn => (btn.disabled = true))
    nextButton.classList.remove('hidden');
    clearInterval(timer);
}

function resetState() {
  nextButton.classList.add("hidden");
  clearInterval(timer);
  timeLeft = 10;
  timerElement.textContent = `Time left: ${timeLeft}s`;
}

function updateProgress() {
  let progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      nextButton.classList.remove("hidden");
      // show correct answer if time runs out
      let correct = questions[currentQuestionIndex].correct;
      answerButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) btn.classList.add("correct");
      });
    }
  }, 1000);
}

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestions();
  } else {
    showResult();
  }
});

function showResult() {
  document.getElementById("quiz").classList.add("hidden");
  nextButton.classList.add("hidden");
  timerElement.classList.add("hidden");
  progressBar.style.width = "100%";

  resultElement.classList.remove("hidden");
  resultElement.textContent = `You scored ${score} out of ${questions.length}! 🎉`;

  restartButton.classList.remove("hidden");
}

// Restart Quiz
restartButton.addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;
  resultElement.classList.add("hidden");
  restartButton.classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  timerElement.classList.remove("hidden");
  loadQuestions();
});

// Start quiz
loadQuestions();