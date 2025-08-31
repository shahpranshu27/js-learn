/* small word bank — expand as desired */
const WORDS = (
    "the of and to in is you that it he was for on are as with his they I at be this " +
    "from or one had by word but not what all were we when your can said there use an each " +
    "which she do how their if will up other about out many then them these so some her would " +
    "make like him into time has look two more write go see number no way could people my than " +
    "first water been call who oil its now find long down day did get come made may part " +
    "after back think over only little work know place year live me give most very our just " +
    "name good sentence man great where help through much before line right too means old any " +
    "same tell boy follow came want show also around form three small set put end does another " +
    "well large must big even such because turn here why ask went men read need land different " +
    "home us move try kind hand picture again change off play spell air away animal house point " +
    "page letter mother answer found study still learn should America world high every near add " +
    "food between own below country plant last school father keep tree never start city earth eye " +
    "light thought head under story saw left don't few while along might close something seem next " +
    "hard open example begin life always those both paper together got group often run important " +
    "until children side feet car mile night walk white sea began grow took river four carry state " +
    "once book hear stop without second later miss idea enough eat face watch far Indian real almost " +
    "let above girl sometimes mountains cut young talk soon list song being leave family it's don't " +
    "I'm you're we've they've can't won't didn't couldn't shouldn't doesn't hasn't let's that's"
).split(" ");


/* UI refs */
const wordsEl = document.getElementById('words');
const typingArea = document.getElementById('typingArea');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const timeEl = document.getElementById('time');
const cpmEl = document.getElementById('cpm');
const correctCountEl = document.getElementById('correctCount');
const errorsCountEl = document.getElementById('errorsCount');

const finalOverlay = document.getElementById('overlay');
const finalWPM = document.getElementById('finalWPM');
const finalAccuracy = document.getElementById('finalAccuracy');
const finalCPM = document.getElementById('finalCPM');
const finalErrors = document.getElementById('finalErrors');
const closeBtn = document.getElementById('closeBtn');
const retryBtn = document.getElementById('retryBtn');
const restartBtn = document.getElementById('restart');

let timeLimit = 30;
let timeLeft = 30;
let timerId = null;
let started = false;

/* test state */
let wordList = [];         // array of words for the test
let currentWordIndex = 0;
let charIndexInWord = 0;   // pointer in current word
let correctChars = 0;
let totalTypedChars = 0;
let errors = 0;
let correctWords = 0;

/* viewport config */
const VISIBLE_LINES = 6;   // number of lines visible at once
let cachedLineHeight = null; // px
let innerWrapperSelector = '.words-inner';

/* ---------- helpers to work with inner wrapper ---------- */
function getInner() {
    const inner = wordsEl.querySelector(innerWrapperSelector);
    return inner ? inner : wordsEl;
}
function getWordEl(idx) {
    const inner = getInner();
    return inner.children[idx];
}

/* generate word list based on seconds */
function generateWords(seconds) {
    const desiredWords = Math.ceil(seconds * 2.5);
    const out = [];
    for (let i = 0; i < desiredWords; i++) {
        out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    return out;
}

/* render words into an inner wrapper (so we can translate it) */
function renderWords() {
    // clear container and create inner wrapper
    wordsEl.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'words-inner';
    inner.style.transition = 'transform 160ms linear';
    inner.style.willChange = 'transform';

    wordList.forEach((w, wi) => {
        const span = document.createElement('span');
        span.className = 'word' + (wi === currentWordIndex ? ' current-word' : '');
        for (let ci = 0; ci < w.length; ci++) {
            const ch = document.createElement('span');
            ch.className = 'char';
            ch.dataset.char = w[ci];
            ch.textContent = w[ci];
            span.appendChild(ch);
        }
        // trailing space char
        const space = document.createElement('span');
        space.className = 'char';
        space.textContent = ' ';
        span.appendChild(space);

        inner.appendChild(span);
    });

    wordsEl.appendChild(inner);

    // ensure viewport height is set to ~VISIBLE_LINES
    computeAndSetViewport();
    setCursor(); // show initial cursor
    // position inner so first lines visible (reset)
    translateInner(0);
}

/* compute line height and set visible height on wordsEl */
function computeAndSetViewport() {
    const inner = getInner();
    // need at least two child words to compute line height
    if (!inner || inner.children.length === 0) {
        cachedLineHeight = parseFloat(window.getComputedStyle(wordsEl).fontSize || 18) * 1.6;
    } else {
        // find first element on a different line to compute line height
        const firstTop = inner.children[0].offsetTop;
        let secondTop = null;
        for (let i = 1; i < inner.children.length; i++) {
            if (inner.children[i].offsetTop > firstTop) {
                secondTop = inner.children[i].offsetTop;
                break;
            }
        }
        if (secondTop === null) {
            // fallback: use font size * line-height assumption
            const fs = parseFloat(window.getComputedStyle(wordsEl).fontSize || 18);
            cachedLineHeight = fs * 1.6;
        } else {
            cachedLineHeight = secondTop - firstTop;
        }
    }

    // set fixed container height to show VISIBLE_LINES lines and hide overflow
    wordsEl.style.height = (cachedLineHeight * VISIBLE_LINES) + 'px';
    wordsEl.style.overflow = 'hidden';
    wordsEl.style.position = 'relative';
}

/* translate inner wrapper vertically to keep current word visible */
function translateInner(desiredPx) {
    const inner = getInner();
    const maxTranslate = Math.max(0, inner.scrollHeight - wordsEl.clientHeight);
    const clamped = Math.min(Math.max(0, desiredPx), maxTranslate);
    inner.style.transform = `translateY(-${clamped}px)`;
}

/* compute and scroll so current word is visible with context */
function scrollToCurrentWord() {
    const inner = getInner();
    const curWordEl = getWordEl(currentWordIndex);
    if (!curWordEl) return;
    // compute line index
    const curTop = curWordEl.offsetTop; // offset within inner
    const lineIndex = Math.floor(curTop / (cachedLineHeight || 1));
    // place current line roughly at 3rd visible line for context
    const targetTopLine = Math.max(0, lineIndex - 2);
    const translateY = targetTopLine * (cachedLineHeight || 1);
    translateInner(translateY);
}

/* show cursor (current char) */
function setCursor() {
    // clear previous marker
    const allChars = getInner().querySelectorAll('.char');
    allChars.forEach(c => c.classList.remove('current'));
    const currentWordEl = getWordEl(currentWordIndex);
    if (!currentWordEl) return;
    const charEls = currentWordEl.querySelectorAll('.char');
    const target = charEls[Math.min(charIndexInWord, charEls.length - 1)];
    if (target) target.classList.add('current');

    // scroll inner so this word is visible (monkeytype-like)
    scrollToCurrentWord();
}

/* mark correct/incorrect char */
function markChar(wordIndex, charPos, correct) {
    const wordEl = getWordEl(wordIndex);
    if (!wordEl) return;
    const charEls = wordEl.querySelectorAll('.char');
    const el = charEls[charPos];
    if (!el) return;
    el.classList.remove('correct', 'incorrect');
    el.classList.add(correct ? 'correct' : 'incorrect');
}

/* recalc correct counts after backspace */
function recalcCorrectCounts() {
    let c = 0, t = 0, err = 0;
    const inner = getInner();
    for (let wi = 0; wi < wordList.length; wi++) {
        const wordEl = inner.children[wi];
        if (!wordEl) continue;
        const charEls = wordEl.querySelectorAll('.char');
        for (let ci = 0; ci < charEls.length - 1; ci++) {
            const el = charEls[ci];
            if (el.classList.contains('correct')) c++;
            if (el.classList.contains('incorrect')) err++;
            if (el.classList.contains('correct') || el.classList.contains('incorrect')) t++;
        }
    }
    correctChars = c;
    totalTypedChars = t;
    errors = err;
}

/* timer */
function startTimer() {
    if (timerId) clearInterval(timerId);
    timeLeft = timeLimit;
    timeEl.textContent = `${timeLeft}s`;
    timerId = setInterval(() => {
        timeLeft--;
        timeEl.textContent = `${timeLeft}s`;
        updateLiveStats();
        if (timeLeft <= 0) {
            clearInterval(timerId);
            finishTest();
        }
    }, 1000);
}

/* update live stats */
function updateLiveStats() {
    const elapsed = Math.max(1, timeLimit - timeLeft);
    const cpm = Math.round((totalTypedChars / elapsed) * 60);
    const wpm = Math.round((totalTypedChars / 5 / elapsed) * 60);
    const accuracy = totalTypedChars > 0 ? Math.round((correctChars / totalTypedChars) * 100) : 100;
    wpmEl.textContent = wpm;
    cpmEl.textContent = cpm;
    accuracyEl.textContent = accuracy + '%';
    correctCountEl.textContent = correctChars;
    errorsCountEl.textContent = errors;
}

/* keyboard handler (global) */
function handleKey(e) {
    if (finalOverlay.style.display === 'flex') return;
    // start on first meaningful key
    if (!started && (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ')) {
        started = true;
        startTimer();
    }
    if (e.key === ' ') { e.preventDefault(); } // prevent page scroll

    const currentWord = wordList[currentWordIndex];
    if (!currentWord) return;

    if (e.key === 'Backspace') {
        if (charIndexInWord > 0) {
            charIndexInWord--;
            // remove marking
            const charEls = getWordEl(currentWordIndex).querySelectorAll('.char');
            if (charEls[charIndexInWord]) charEls[charIndexInWord].classList.remove('correct', 'incorrect');
            totalTypedChars = Math.max(0, totalTypedChars - 1);
            recalcCorrectCounts();
        } else if (charIndexInWord === 0 && currentWordIndex > 0) {
            // if at start of word, move back to previous word's last character
            currentWordIndex--;
            // place cursor at end of previous word (before the trailing space)
            const prevWordLen = Math.max(0, wordList[currentWordIndex].length);
            charIndexInWord = prevWordLen;
            // remove trailing markings for that char if exist
            const prevCharEls = getWordEl(currentWordIndex).querySelectorAll('.char');
            if (prevCharEls[charIndexInWord]) prevCharEls[charIndexInWord].classList.remove('correct', 'incorrect');
            recalcCorrectCounts();
        }
        setCursor();
        updateLiveStats();
        return;
    }

    // printable char
    if (e.key.length === 1 && e.key !== ' ') {
        const expectedChar = currentWord[charIndexInWord] || '';
        const typed = e.key;
        const correct = typed === expectedChar;
        markChar(currentWordIndex, charIndexInWord, correct);
        totalTypedChars++;
        if (correct) correctChars++; else errors++;
        charIndexInWord++;
        setCursor();
        updateLiveStats();
        return;
    }

    // space -> move to next word
    if (e.key === ' ') {
        const currentWordEl = getWordEl(currentWordIndex);
        const charEls = currentWordEl.querySelectorAll('.char');
        let allCorrect = true;
        const lettersCount = Math.max(0, currentWord.length);
        for (let i = 0; i < lettersCount; i++) {
            const el = charEls[i];
            if (!el.classList.contains('correct')) { allCorrect = false; break; }
        }
        if (allCorrect) correctWords++;
        currentWordIndex++;
        charIndexInWord = 0;
        setCursor();
        updateLiveStats();
        return;
    }
}

/* finish test and show modal */
function finishTest() {
    if (timerId) clearInterval(timerId);
    const elapsed = timeLimit;
    const finalCPMVal = Math.round((totalTypedChars / elapsed) * 60);
    const finalWPMVal = Math.round((totalTypedChars / 5 / elapsed) * 60);
    const finalAccuracyVal = totalTypedChars > 0 ? Math.round((correctChars / totalTypedChars) * 100) : 100;

    finalWPM.textContent = `${finalWPMVal} WPM`;
    finalAccuracy.textContent = finalAccuracyVal + '%';
    finalCPM.textContent = finalCPMVal;
    finalErrors.textContent = errors;

    finalOverlay.style.display = 'flex';
}

/* reset */
function resetTest() {
    if (timerId) clearInterval(timerId);
    started = false;
    currentWordIndex = 0;
    charIndexInWord = 0;
    correctChars = 0;
    totalTypedChars = 0;
    errors = 0;
    correctWords = 0;
    wordList = generateWords(timeLimit);
    renderWords();
    wpmEl.textContent = '0';
    cpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    correctCountEl.textContent = '0';
    errorsCountEl.textContent = '0';
    timeEl.textContent = timeLimit + 's';
    finalOverlay.style.display = 'none';
}

/* init */
function init() {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            timeLimit = parseInt(btn.dataset.time, 10);
            timeLeft = timeLimit;
            timeEl.textContent = timeLimit + 's';
            resetTest();
        });
    });

    typingArea.addEventListener('click', () => typingArea.focus());
    window.addEventListener('keydown', handleKey);

    restartBtn.addEventListener('click', () => resetTest());
    closeBtn.addEventListener('click', () => { finalOverlay.style.display = 'none'; });
    retryBtn.addEventListener('click', () => { finalOverlay.style.display = 'none'; resetTest(); });

    wordList = generateWords(timeLimit);
    renderWords();
    timeEl.textContent = timeLimit + 's';
}

/* run */
init();
