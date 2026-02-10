const DIFFICULTY = {
  leicht: { maxNumber: 5, maxResult: 10, count: 5 },
  mittel: { maxNumber: 10, maxResult: 10, count: 8 },
  schwer: { maxNumber: 10, maxResult: 20, count: 10 },
};

let currentDifficulty = "leicht";
let currentOperation = "gemischt";
let exercises = [];
let checked = false;

// Setting buttons
document.querySelectorAll("#difficulty .btn-setting").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#difficulty .btn-setting").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.value;
  });
});

document.querySelectorAll("#operation .btn-setting").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#operation .btn-setting").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentOperation = btn.dataset.value;
  });
});

// Generate exercises
document.getElementById("btn-generate").addEventListener("click", generateExercises);
document.getElementById("btn-check").addEventListener("click", checkAnswers);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateExercises() {
  const config = DIFFICULTY[currentDifficulty];
  exercises = [];
  checked = false;

  for (let i = 0; i < config.count; i++) {
    let op;
    if (currentOperation === "plus") {
      op = "+";
    } else if (currentOperation === "minus") {
      op = "-";
    } else {
      op = Math.random() < 0.5 ? "+" : "-";
    }

    let a, b;
    if (op === "+") {
      a = randomInt(1, config.maxNumber);
      b = randomInt(1, config.maxResult - a);
      // Ensure b is at least 1
      if (b < 1) b = 1;
    } else {
      // Subtraction: result must be >= 0
      a = randomInt(2, config.maxResult);
      b = randomInt(1, a);
      // Limit b to maxNumber
      if (b > config.maxNumber) b = config.maxNumber;
      // Ensure a > b so result is positive
      if (a <= b) a = b + 1;
      if (a > config.maxResult) a = config.maxResult;
    }

    exercises.push({ a, b, op, answer: op === "+" ? a + b : a - b });
  }

  renderExercises();
  document.getElementById("actions").classList.remove("hidden");
  document.getElementById("result-summary").classList.add("hidden");
  document.getElementById("result-summary").className = "hidden";
}

function renderExercises() {
  const container = document.getElementById("exercises");
  container.innerHTML = "";

  exercises.forEach((ex, i) => {
    const div = document.createElement("div");
    div.className = "exercise";
    div.dataset.index = i;

    div.innerHTML = `
      <span class="number">${i + 1}.</span>
      <span class="task">${ex.a} ${ex.op} ${ex.b} =</span>
      <input type="number" id="answer-${i}" autocomplete="off">
      <span class="feedback" id="feedback-${i}"></span>
    `;

    container.appendChild(div);
  });

  // Focus first input
  const firstInput = document.getElementById("answer-0");
  if (firstInput) firstInput.focus();

  // Enter key moves to next input
  container.querySelectorAll("input").forEach((input, i) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextInput = document.getElementById(`answer-${i + 1}`);
        if (nextInput) {
          nextInput.focus();
        } else {
          checkAnswers();
        }
      }
    });
  });
}

function checkAnswers() {
  let correctCount = 0;
  let hasRetry = false;

  exercises.forEach((ex, i) => {
    const input = document.getElementById(`answer-${i}`);
    const feedback = document.getElementById(`feedback-${i}`);
    const div = input.closest(".exercise");
    const userAnswer = input.value.trim();

    // Skip already correct answers
    if (div.classList.contains("correct")) {
      correctCount++;
      return;
    }

    if (userAnswer === "") {
      div.className = "exercise retry";
      feedback.textContent = "?";
      hasRetry = true;
      return;
    }

    const num = parseInt(userAnswer, 10);
    if (num === ex.answer) {
      div.className = "exercise correct";
      feedback.textContent = "\u2705";
      input.readOnly = true;
      correctCount++;
    } else {
      div.className = "exercise wrong";
      feedback.textContent = "\u274C";
      hasRetry = true;
    }
  });

  // Show summary
  const summary = document.getElementById("result-summary");
  summary.classList.remove("hidden");

  if (correctCount === exercises.length) {
    summary.className = "perfect";
    summary.textContent = `Super! Alle ${exercises.length} Aufgaben richtig! \u2B50`;
    document.getElementById("btn-check").textContent = "Alles richtig!";
    document.getElementById("btn-check").disabled = true;
  } else if (hasRetry) {
    const wrong = exercises.length - correctCount;
    summary.className = "retry";
    summary.textContent = `${correctCount} von ${exercises.length} richtig. Versuch die anderen nochmal!`;
    document.getElementById("btn-check").textContent = "Nochmal pruefen";

    // Focus first non-correct input
    for (let i = 0; i < exercises.length; i++) {
      const div = document.getElementById(`answer-${i}`).closest(".exercise");
      if (!div.classList.contains("correct")) {
        document.getElementById(`answer-${i}`).focus();
        break;
      }
    }
  }

  checked = true;
}

// Generate on load
generateExercises();
