// Responsive Quiz Script - vanilla JS
// Keep question set here - you can replace / extend
const QUESTIONS = [
  {
    id: 1,
    q: "Which planet is known as the Red Planet?",
    choices: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
    explanation: "Mars is often called the Red Planet due to iron oxide on its surface."
  },
  {
    id: 2,
    q: "What does CSS stand for?",
    choices: ["Cascading Style Sheets", "Computer Style Sheets", "Control Style Syntax", "Coded Style System"],
    correct: 0,
    explanation: "CSS stands for Cascading Style Sheets."
  },
  {
    id: 3,
    q: "Which language runs in the browser?",
    choices: ["Python", "C++", "JavaScript", "Swift"],
    correct: 2,
    explanation: "JavaScript is the language that runs natively in browsers."
  },
  {
    id: 4,
    q: "What is the smallest prime number?",
    choices: ["0", "1", "2", "3"],
    correct: 2,
    explanation: "2 is the smallest and only even prime number."
  },
  {
    id: 5,
    q: "Which HTML element is used for an external JavaScript file?",
    choices: ["<script>", "<link>", "<js>", "<src>"],
    correct: 0,
    explanation: "The <script> element with a src attribute is used."
  }
];

const app = {
  idx: 0,
  answers: new Array(QUESTIONS.length).fill(null),
  timerDuration: 5 * 60, // seconds (example: 5 minutes). Set to 0 to disable timer.
  timerId: null,
  timeLeft: 0,
  reviewAfterSubmit: false,
};

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const qTitle = document.getElementById("questionTitle");
  const answersForm = document.getElementById("answersForm");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const retryBtn = document.getElementById("retryBtn");
  const exportBtn = document.getElementById("exportBtn");
  const resultCard = document.getElementById("resultCard");
  const questionCard = document.getElementById("questionCard");
  const resultSummary = document.getElementById("resultSummary");
  const detailedResults = document.getElementById("detailedResults");
  const timerEl = document.getElementById("timer");
  const scoreMini = document.getElementById("scoreMini");
  const reviewMode = document.getElementById("reviewMode");

  // initialize
  function renderQuestion() {
    const item = QUESTIONS[app.idx];
    qTitle.textContent = item.q;
    progressText.textContent = `Question ${app.idx + 1} / ${QUESTIONS.length}`;
    progressBar.style.width = `${Math.round(((app.idx+1)/QUESTIONS.length)*100)}%`;
    answersForm.innerHTML = "";

    item.choices.forEach((c, i) => {
      const id = `q${item.id}_c${i}`;
      const wrapper = document.createElement("div");
      wrapper.className = "choice";
      wrapper.dataset.choiceIndex = i;

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${item.id}`;
      input.id = id;
      input.value = i;
      input.checked = app.answers[app.idx] === i;

      const label = document.createElement("label");
      label.htmlFor = id;
      label.innerHTML = `<strong>${String.fromCharCode(65 + i)}.</strong> ${c}`;

      input.addEventListener("change", () => {
        app.answers[app.idx] = i;
        scoreMini.textContent = `Score: ${calculateScore()}`;
      });

      wrapper.appendChild(input);
      wrapper.appendChild(label);
      answersForm.appendChild(wrapper);
    });

    // disable prev/next appropriately
    prevBtn.disabled = app.idx === 0;
    nextBtn.disabled = app.idx === QUESTIONS.length - 1;
  }

  function calculateScore() {
    return app.answers.reduce((sum, ans, i) => {
      return sum + ((ans !== null && ans === QUESTIONS[i].correct) ? 1 : 0);
    }, 0);
  }

  prevBtn.addEventListener("click", () => {
    if (app.idx > 0) {
      app.idx--;
      renderQuestion();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (app.idx < QUESTIONS.length - 1) {
      app.idx++;
      renderQuestion();
    }
  });

  submitBtn.addEventListener("click", () => {
    finishQuiz();
  });

  retryBtn.addEventListener("click", () => {
    app.idx = 0;
    app.answers = new Array(QUESTIONS.length).fill(null);
    resultCard.classList.add("hidden");
    questionCard.classList.remove("hidden");
    scoreMini.textContent = `Score: 0`;
    detailedResults.innerHTML = "";
    renderQuestion();
    if (app.timerDuration > 0) startTimer();
  });

  exportBtn.addEventListener("click", () => {
    const data = QUESTIONS.map((q, i) => ({
      question: q.q,
      choices: q.choices,
      correctIndex: q.correct,
      selectedIndex: app.answers[i],
      correct: app.answers[i] === q.correct,
      explanation: q.explanation || ""
    }));
    const blob = new Blob([JSON.stringify({score: calculateScore(), data}, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  reviewMode.addEventListener("change", (e) => {
    app.reviewAfterSubmit = e.target.checked;
  });

  function finishQuiz() {
    // stop timer
    stopTimer();
    // show result summary & details
    const score = calculateScore();
    questionCard.classList.add("hidden");
    resultCard.classList.remove("hidden");
    resultSummary.innerHTML = `You scored <strong>${score}</strong> out of <strong>${QUESTIONS.length}</strong>.`;
    detailedResults.innerHTML = "";

    QUESTIONS.forEach((q, i) => {
      const your = app.answers[i];
      const isCorrect = your === q.correct;
      const item = document.createElement("div");
      item.className = "result-item";
      let html = `<div style="display:flex;justify-content:space-between;align-items:center">
                    <div><strong>Q${i+1}.</strong> ${q.q}</div>
                    <div>${isCorrect ? '✅ Correct' : '❌ Wrong'}</div>
                  </div>
                  <div style="margin-top:.5rem">Your answer: <strong>${your === null ? 'No answer' : q.choices[your]}</strong></div>
                  <div>Correct answer: <strong>${q.choices[q.correct]}</strong></div>`;
      if (app.reviewAfterSubmit && q.explanation) {
        html += `<div style="margin-top:.4rem;color:var(--muted)">${q.explanation}</div>`;
      }
      item.innerHTML = html;
      detailedResults.appendChild(item);
    });
  }

  // TIMER (optional)
  function startTimer(){
    if (!app.timerDuration || app.timerDuration <= 0) {
      timerEl.textContent = "";
      return;
    }
    app.timeLeft = app.timerDuration;
    updateTimerDisplay();
    app.timerId = setInterval(() => {
      app.timeLeft--;
      if (app.timeLeft <= 0) {
        clearInterval(app.timerId);
        timerEl.textContent = "Time's up!";
        finishQuiz();
        return;
      }
      updateTimerDisplay();
    }, 1000);
  }
  function stopTimer(){
    if (app.timerId) clearInterval(app.timerId);
    app.timerId = null;
  }
  function updateTimerDisplay(){
    const mm = String(Math.floor(app.timeLeft / 60)).padStart(2,'0');
    const ss = String(app.timeLeft % 60).padStart(2,'0');
    timerEl.textContent = `Time: ${mm}:${ss}`;
  }

  // initialize view
  renderQuestion();
  scoreMini.textContent = `Score: ${calculateScore()}`;
  // start the timer only if configured
  if (app.timerDuration > 0) startTimer();
});
