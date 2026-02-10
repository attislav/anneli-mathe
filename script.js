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
      <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" autocomplete="off">
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
  let wrongCount = 0;

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
      wrongCount++;
      return;
    }

    const num = parseInt(userAnswer, 10);
    if (!isNaN(num) && num === ex.answer) {
      div.className = "exercise correct";
      feedback.textContent = "richtig";
      input.readOnly = true;
      correctCount++;
    } else {
      div.className = "exercise wrong";
      feedback.textContent = "falsch";
      wrongCount++;
    }
  });

  // Show summary
  const summary = document.getElementById("result-summary");
  summary.classList.remove("hidden");

  const checkBtn = document.getElementById("btn-check");

  if (correctCount === exercises.length) {
    summary.className = "perfect";
    summary.textContent = `Super! Alle ${exercises.length} Aufgaben richtig!`;
    checkBtn.textContent = "Alles richtig!";
    checkBtn.disabled = true;
    launchConfetti();
  } else {
    summary.className = "retry";
    summary.textContent = `${correctCount} von ${exercises.length} richtig. Versuch die anderen nochmal!`;
    checkBtn.textContent = "Nochmal pruefen";

    // Focus first non-correct input
    for (let i = 0; i < exercises.length; i++) {
      const div = document.getElementById(`answer-${i}`).closest(".exercise");
      if (!div.classList.contains("correct")) {
        document.getElementById(`answer-${i}`).focus();
        document.getElementById(`answer-${i}`).select();
        break;
      }
    }
  }

  checked = true;
}

// Confetti animation
function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const colors = ["#e84393", "#74b9ff", "#fd79a8", "#a29bfe", "#ffeaa7", "#55efc4", "#ff7675"];
  const pieces = [];

  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      drift: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 6 - 3,
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allDone = true;

    pieces.forEach((p) => {
      p.y += p.speed;
      p.x += p.drift;
      p.rotation += p.rotSpeed;

      if (p.y < canvas.height + 20) allDone = false;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frame++;
    if (!allDone && frame < 300) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  animate();
}

// Generate on load
generateExercises();
