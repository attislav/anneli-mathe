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

  const checkBtn = document.getElementById("btn-check");
  checkBtn.textContent = "Antworten prüfen";
  checkBtn.disabled = false;
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

  const percent = correctCount / exercises.length;

  if (correctCount === exercises.length) {
    summary.className = "perfect";
    summary.innerHTML = `<img src="super.png" class="result-image" alt="Super!"><br>Super! Alle ${exercises.length} Aufgaben richtig!`;
    checkBtn.textContent = "Alles richtig!";
    checkBtn.disabled = true;
    launchConfetti();
  } else if (percent >= 0.5) {
    summary.className = "good";
    summary.innerHTML = `<img src="gut.png" class="result-image" alt="Gut gemacht!"><br>${correctCount} von ${exercises.length} richtig. Gut gemacht! Versuch die anderen nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
  } else {
    summary.className = "retry";
    summary.innerHTML = `<img src="nochmal.png" class="result-image" alt="Nochmal versuchen"><br>${correctCount} von ${exercises.length} richtig. Versuch es nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";

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

// Confetti explosion
function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const colors = ["#e84393", "#74b9ff", "#fd79a8", "#a29bfe", "#ffeaa7", "#55efc4", "#ff7675", "#f368e0", "#0abde3", "#feca57"];
  const pieces = [];
  const shapes = ["rect", "circle", "star"];

  // Multiple burst points for explosion effect
  const bursts = [
    { x: canvas.width * 0.5, y: canvas.height * 0.4 },
    { x: canvas.width * 0.3, y: canvas.height * 0.3 },
    { x: canvas.width * 0.7, y: canvas.height * 0.3 },
    { x: canvas.width * 0.2, y: canvas.height * 0.5 },
    { x: canvas.width * 0.8, y: canvas.height * 0.5 },
  ];

  bursts.forEach((burst) => {
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      pieces.push({
        x: burst.x,
        y: burst.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 10 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5,
        gravity: 0.15,
        opacity: 1,
        fade: Math.random() * 0.005 + 0.002,
      });
    }
  });

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.opacity -= p.fade;

      if (p.opacity <= 0) return;
      alive = true;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "star") {
        drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      }

      ctx.restore();
    });

    frame++;
    if (alive && frame < 400) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  animate();
}

// Generate on load
generateExercises();
