// ============ CONFIG ============
const DIFFICULTY = {
  leicht: { maxNumber: 5, maxResult: 10, count: 5, zehnerTargets: [5, 6, 7, 8] },
  mittel: { maxNumber: 10, maxResult: 10, count: 8, zehnerTargets: [6, 7, 8, 9, 10] },
  schwer: { maxNumber: 10, maxResult: 20, count: 10, zehnerTargets: [10, 12, 14, 16, 18, 20] },
};

let currentDifficulty = "leicht";
let currentOperation = "gemischt";
let exercises = [];
let checked = false;

// ============ SOUND SYSTEM (Web Audio API) ============
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, delay, type, volume) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.value = volume || 0.3;
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function soundCorrect() {
  playTone(523, 0.12, 0, "sine", 0.25);
  playTone(659, 0.15, 0.1, "sine", 0.25);
}

function soundWrong() {
  playTone(220, 0.25, 0, "triangle", 0.15);
}

function soundPerfect() {
  const notes = [523, 587, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playTone(freq, 0.2, i * 0.12, "sine", 0.25);
  });
}

// ============ STARS SYSTEM ============
let totalStars = parseInt(localStorage.getItem("mathe-sterne") || "0", 10);

function saveStars() {
  localStorage.setItem("mathe-sterne", totalStars.toString());
  renderStars();
}

function renderStars() {
  const el = document.getElementById("star-count");
  if (el) el.textContent = totalStars;
}

function addStars(count) {
  totalStars += count;
  saveStars();
  animateStars();
}

function animateStars() {
  const el = document.getElementById("star-display");
  if (!el) return;
  el.classList.add("star-bounce");
  setTimeout(() => el.classList.remove("star-bounce"), 500);
}

// ============ SETTING BUTTONS ============
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

document.getElementById("btn-generate").addEventListener("click", generateExercises);
document.getElementById("btn-check").addEventListener("click", checkAnswers);

// ============ HELPERS ============
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============ EXERCISE GENERATION ============
function generateExercises() {
  const config = DIFFICULTY[currentDifficulty];
  exercises = [];
  checked = false;

  if (currentOperation === "luecken") {
    generateLuecken(config);
  } else if (currentOperation === "zehner") {
    generateZehner(config);
  } else {
    generateNormal(config);
  }

  renderExercises();
  document.getElementById("actions").classList.remove("hidden");
  document.getElementById("result-summary").classList.add("hidden");
  document.getElementById("result-summary").className = "hidden";

  const checkBtn = document.getElementById("btn-check");
  checkBtn.textContent = "Antworten prüfen";
  checkBtn.disabled = false;
}

function generateNormal(config) {
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
      if (b < 1) b = 1;
    } else {
      a = randomInt(2, config.maxResult);
      b = randomInt(1, a);
      if (b > config.maxNumber) b = config.maxNumber;
      if (a <= b) a = b + 1;
      if (a > config.maxResult) a = config.maxResult;
    }

    exercises.push({
      type: "normal",
      a, b, op,
      answer: op === "+" ? a + b : a - b,
    });
  }
}

function generateLuecken(config) {
  for (let i = 0; i < config.count; i++) {
    const op = Math.random() < 0.5 ? "+" : "-";
    let a, b, result;

    if (op === "+") {
      a = randomInt(1, config.maxNumber);
      b = randomInt(1, config.maxResult - a);
      if (b < 1) b = 1;
      result = a + b;
    } else {
      a = randomInt(2, config.maxResult);
      b = randomInt(1, a);
      if (b > config.maxNumber) b = config.maxNumber;
      if (a <= b) a = b + 1;
      if (a > config.maxResult) a = config.maxResult;
      result = a - b;
    }

    // Randomly choose which position is the gap
    const gapPositions = ["left", "right"];
    const gap = pickRandom(gapPositions);

    if (gap === "left") {
      // ___ + b = result  → answer is a
      exercises.push({
        type: "luecke",
        display: { left: null, op, right: b, result },
        answer: a,
      });
    } else {
      // a + ___ = result  → answer is b
      exercises.push({
        type: "luecke",
        display: { left: a, op, right: null, result },
        answer: b,
      });
    }
  }
}

function generateZehner(config) {
  for (let i = 0; i < config.count; i++) {
    const target = pickRandom(config.zehnerTargets);
    exercises.push({
      type: "zehner",
      target,
    });
  }
}

// ============ RENDERING ============
function renderExercises() {
  const container = document.getElementById("exercises");
  container.innerHTML = "";

  exercises.forEach((ex, i) => {
    const div = document.createElement("div");
    div.className = "exercise";
    div.dataset.index = i;

    if (ex.type === "normal") {
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">${ex.a} ${ex.op} ${ex.b} =</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" autocomplete="off">
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "luecke") {
      const d = ex.display;
      const leftPart = d.left === null
        ? `<input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" class="inline-input" autocomplete="off">`
        : d.left;
      const rightPart = d.right === null
        ? `<input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" class="inline-input" autocomplete="off">`
        : d.right;
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">${leftPart} ${d.op} ${rightPart} = ${d.result}</span>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "zehner") {
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}-a" class="inline-input" autocomplete="off">
          +
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}-b" class="inline-input" autocomplete="off">
          = ${ex.target}
        </span>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    }

    container.appendChild(div);
  });

  // Focus first input
  const firstInput = container.querySelector("input");
  if (firstInput) firstInput.focus();

  // Enter key navigation
  const inputs = container.querySelectorAll("input");
  inputs.forEach((input, idx) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const allInputs = container.querySelectorAll("input");
        const nextInput = allInputs[idx + 1];
        if (nextInput) {
          nextInput.focus();
        } else {
          checkAnswers();
        }
      }
    });
  });
}

// ============ ANSWER CHECKING ============
function checkAnswers() {
  let correctCount = 0;
  let newCorrect = 0;
  let wrongCount = 0;

  exercises.forEach((ex, i) => {
    const div = document.querySelector(`.exercise[data-index="${i}"]`);
    const feedback = document.getElementById(`feedback-${i}`);

    // Skip already correct
    if (div.classList.contains("correct")) {
      correctCount++;
      return;
    }

    let isCorrect = false;

    if (ex.type === "normal" || ex.type === "luecke") {
      const input = document.getElementById(`answer-${i}`);
      const val = input.value.trim();

      if (val === "") {
        div.className = "exercise retry";
        feedback.textContent = "?";
        wrongCount++;
        return;
      }

      const num = parseInt(val, 10);
      isCorrect = !isNaN(num) && num === ex.answer;

      if (isCorrect) {
        input.readOnly = true;
      }
    } else if (ex.type === "zehner") {
      const inputA = document.getElementById(`answer-${i}-a`);
      const inputB = document.getElementById(`answer-${i}-b`);
      const valA = inputA.value.trim();
      const valB = inputB.value.trim();

      if (valA === "" || valB === "") {
        div.className = "exercise retry";
        feedback.textContent = "?";
        wrongCount++;
        return;
      }

      const numA = parseInt(valA, 10);
      const numB = parseInt(valB, 10);
      isCorrect = !isNaN(numA) && !isNaN(numB) && numA > 0 && numB > 0 && numA + numB === ex.target;

      if (isCorrect) {
        inputA.readOnly = true;
        inputB.readOnly = true;
      }
    }

    if (isCorrect) {
      div.className = "exercise correct";
      feedback.textContent = "richtig";
      correctCount++;
      newCorrect++;
      soundCorrect();
    } else {
      div.className = "exercise wrong";
      feedback.textContent = "falsch";
      wrongCount++;
      soundWrong();
    }
  });

  // Stars
  if (newCorrect > 0) {
    addStars(newCorrect);
  }

  // Show summary
  const summary = document.getElementById("result-summary");
  summary.classList.remove("hidden");
  const checkBtn = document.getElementById("btn-check");
  const percent = correctCount / exercises.length;

  if (correctCount === exercises.length) {
    // Bonus stars for perfect round
    addStars(3);
    summary.className = "perfect";
    summary.innerHTML = `<img src="super.png" class="result-image" alt="Super!"><br>Super! Alle ${exercises.length} Aufgaben richtig!`;
    checkBtn.textContent = "Alles richtig!";
    checkBtn.disabled = true;
    soundPerfect();
    launchConfetti();
  } else if (percent >= 0.5) {
    summary.className = "good";
    summary.innerHTML = `<img src="gut.png" class="result-image" alt="Gut gemacht!"><br>${correctCount} von ${exercises.length} richtig. Gut gemacht! Versuch die anderen nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
    focusFirstWrong();
  } else if (correctCount === 0) {
    summary.className = "retry";
    summary.innerHTML = `<video src="pizza-falsch.mp4" class="result-video" autoplay playsinline></video><br>Noch keine richtig. Versuch es nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
    focusFirstWrong();
  } else {
    summary.className = "retry";
    summary.innerHTML = `<img src="nochmal.png" class="result-image" alt="Nochmal versuchen"><br>${correctCount} von ${exercises.length} richtig. Versuch es nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
    focusFirstWrong();
  }

  checked = true;
}

function focusFirstWrong() {
  const container = document.getElementById("exercises");
  for (let i = 0; i < exercises.length; i++) {
    const div = container.querySelector(`.exercise[data-index="${i}"]`);
    if (!div.classList.contains("correct")) {
      const input = div.querySelector("input");
      if (input) {
        input.focus();
        input.select();
      }
      break;
    }
  }
}

// ============ CONFETTI ============
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
        x: burst.x, y: burst.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 10 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5,
        gravity: 0.15, opacity: 1,
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

// ============ INIT ============
renderStars();
generateExercises();
