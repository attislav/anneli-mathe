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

// ============ STREAK / COMBO SYSTEM ============
let currentStreak = 0;

function resetStreak() {
  currentStreak = 0;
  renderStreak();
}

function incrementStreak() {
  currentStreak++;
  renderStreak();
  if (currentStreak >= 3) {
    soundStreak();
  }
}

function breakStreak() {
  currentStreak = 0;
  renderStreak();
}

function getStreakMultiplier() {
  if (currentStreak >= 5) return 3;
  if (currentStreak >= 3) return 2;
  return 1;
}

function renderStreak() {
  const el = document.getElementById("streak-display");
  const countEl = document.getElementById("streak-count");
  if (!el || !countEl) return;

  if (currentStreak >= 2) {
    el.classList.remove("hidden");
    countEl.textContent = currentStreak;
    // Show multiplier if active
    const existing = el.querySelector(".streak-multiplier");
    if (existing) existing.remove();
    const mult = getStreakMultiplier();
    if (mult > 1) {
      const span = document.createElement("span");
      span.className = "streak-multiplier";
      span.textContent = `×${mult} Sterne`;
      el.appendChild(span);
    }
  } else {
    el.classList.add("hidden");
  }
}

function soundStreak() {
  playTone(880, 0.08, 0, "sine", 0.2);
  playTone(1047, 0.08, 0.06, "sine", 0.2);
  playTone(1319, 0.12, 0.12, "sine", 0.2);
}

// ============ LEVEL / XP SYSTEM ============
const LEVELS = [
  { name: "Mathe-Anfänger", mascot: "🐣", xpNeeded: 0 },
  { name: "Rechen-Entdecker", mascot: "🐱", xpNeeded: 20 },
  { name: "Zahlen-Fuchs", mascot: "🦊", xpNeeded: 50 },
  { name: "Rechen-Held", mascot: "🦁", xpNeeded: 100 },
  { name: "Mathe-Profi", mascot: "🦄", xpNeeded: 200 },
  { name: "Zahlen-Champion", mascot: "🐉", xpNeeded: 350 },
  { name: "Mathe-Genie", mascot: "👑", xpNeeded: 500 },
];

let totalXP = parseInt(localStorage.getItem("mathe-xp") || "0", 10);

function getCurrentLevel() {
  let lvl = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpNeeded) {
      lvl = i;
      break;
    }
  }
  return lvl;
}

function addXP(amount) {
  const oldLevel = getCurrentLevel();
  totalXP += amount;
  localStorage.setItem("mathe-xp", totalXP.toString());
  const newLevel = getCurrentLevel();
  renderLevel();

  if (newLevel > oldLevel) {
    celebrateLevelUp(newLevel);
  }
}

function renderLevel() {
  const lvl = getCurrentLevel();
  const level = LEVELS[lvl];
  const nextLevel = LEVELS[lvl + 1];

  const mascotEl = document.getElementById("level-mascot");
  const nameEl = document.getElementById("level-name");
  const fillEl = document.getElementById("xp-fill");
  const textEl = document.getElementById("xp-text");

  if (mascotEl) mascotEl.textContent = level.mascot;
  if (nameEl) nameEl.textContent = level.name;

  if (nextLevel) {
    const xpInLevel = totalXP - level.xpNeeded;
    const xpForLevel = nextLevel.xpNeeded - level.xpNeeded;
    const percent = Math.min((xpInLevel / xpForLevel) * 100, 100);
    if (fillEl) fillEl.style.width = percent + "%";
    if (textEl) textEl.textContent = `${totalXP} / ${nextLevel.xpNeeded} XP`;
  } else {
    if (fillEl) fillEl.style.width = "100%";
    if (textEl) textEl.textContent = `${totalXP} XP — Max Level!`;
  }
}

function celebrateLevelUp(lvl) {
  const level = LEVELS[lvl];
  const el = document.getElementById("level-display");
  if (el) {
    el.classList.add("level-up");
    setTimeout(() => el.classList.remove("level-up"), 1000);
  }

  // Level-up sound
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    playTone(freq, 0.25, i * 0.15, "sine", 0.3);
  });

  // Show level-up toast
  showToast(level.mascot, "Level Up!", level.name);
  launchConfetti();
}

// ============ ACHIEVEMENTS SYSTEM ============
const ACHIEVEMENTS = [
  { id: "first_star", icon: "⭐", name: "Erster Stern", desc: "Verdiene deinen ersten Stern" },
  { id: "ten_stars", icon: "🌟", name: "10 Sterne", desc: "Sammle 10 Sterne" },
  { id: "fifty_stars", icon: "💫", name: "50 Sterne", desc: "Sammle 50 Sterne" },
  { id: "hundred_stars", icon: "🏅", name: "100 Sterne", desc: "Sammle 100 Sterne" },
  { id: "first_perfect", icon: "🎯", name: "Perfekt!", desc: "Erste perfekte Runde" },
  { id: "five_perfect", icon: "🏆", name: "5× Perfekt", desc: "5 perfekte Runden" },
  { id: "ten_perfect", icon: "👑", name: "10× Perfekt", desc: "10 perfekte Runden" },
  { id: "streak_3", icon: "🔥", name: "3er Streak", desc: "3 richtige in Folge" },
  { id: "streak_5", icon: "🔥", name: "5er Streak", desc: "5 richtige in Folge" },
  { id: "streak_10", icon: "💥", name: "10er Streak", desc: "10 richtige in Folge" },
  { id: "try_medium", icon: "📗", name: "Mittel", desc: "Spiele auf Mittel" },
  { id: "try_hard", icon: "📕", name: "Schwer", desc: "Spiele auf Schwer" },
  { id: "try_luecken", icon: "🧩", name: "Lücken-Meister", desc: "Spiele Lücken-Aufgaben" },
  { id: "try_zehner", icon: "🔟", name: "Zehner-Profi", desc: "Spiele Zehnerzerlegung" },
  { id: "level_3", icon: "🦊", name: "Zahlen-Fuchs", desc: "Erreiche Level 3" },
  { id: "level_5", icon: "🦄", name: "Mathe-Profi", desc: "Erreiche Level 5" },
  { id: "level_max", icon: "🐉", name: "Mathe-Genie", desc: "Erreiche das höchste Level" },
];

let unlockedAchievements = JSON.parse(localStorage.getItem("mathe-achievements") || "[]");
let perfectRounds = parseInt(localStorage.getItem("mathe-perfect-rounds") || "0", 10);

function unlockAchievement(id) {
  if (unlockedAchievements.includes(id)) return;
  unlockedAchievements.push(id);
  localStorage.setItem("mathe-achievements", JSON.stringify(unlockedAchievements));

  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (achievement) {
    showToast(achievement.icon, "Abzeichen freigeschaltet!", achievement.name);
  }
}

function checkAchievements() {
  // Star milestones
  if (totalStars >= 1) unlockAchievement("first_star");
  if (totalStars >= 10) unlockAchievement("ten_stars");
  if (totalStars >= 50) unlockAchievement("fifty_stars");
  if (totalStars >= 100) unlockAchievement("hundred_stars");

  // Perfect rounds
  if (perfectRounds >= 1) unlockAchievement("first_perfect");
  if (perfectRounds >= 5) unlockAchievement("five_perfect");
  if (perfectRounds >= 10) unlockAchievement("ten_perfect");

  // Streak milestones
  if (currentStreak >= 3) unlockAchievement("streak_3");
  if (currentStreak >= 5) unlockAchievement("streak_5");
  if (currentStreak >= 10) unlockAchievement("streak_10");

  // Difficulty/mode milestones
  if (currentDifficulty === "mittel") unlockAchievement("try_medium");
  if (currentDifficulty === "schwer") unlockAchievement("try_hard");
  if (currentOperation === "luecken") unlockAchievement("try_luecken");
  if (currentOperation === "zehner") unlockAchievement("try_zehner");

  // Level milestones
  const lvl = getCurrentLevel();
  if (lvl >= 2) unlockAchievement("level_3");
  if (lvl >= 4) unlockAchievement("level_5");
  if (lvl >= LEVELS.length - 1) unlockAchievement("level_max");
}

function renderAchievements() {
  const grid = document.getElementById("achievements-grid");
  if (!grid) return;
  grid.innerHTML = "";

  ACHIEVEMENTS.forEach((a) => {
    const unlocked = unlockedAchievements.includes(a.id);
    const card = document.createElement("div");
    card.className = `achievement-card ${unlocked ? "unlocked" : "locked"}`;
    card.innerHTML = `
      <span class="achievement-icon">${a.icon}</span>
      <span class="achievement-name">${a.name}</span>
    `;
    card.title = a.desc;
    grid.appendChild(card);
  });
}

// Achievement modal
document.getElementById("btn-achievements").addEventListener("click", () => {
  renderAchievements();
  document.getElementById("achievements-modal").classList.remove("hidden");
});

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("achievements-modal").classList.add("hidden");
});

document.getElementById("achievements-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add("hidden");
  }
});

// ============ TOAST NOTIFICATION ============
function showToast(icon, title, name) {
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-text">
      <span class="toast-title">${title}</span>
      <span class="toast-name">${name}</span>
    </span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
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
  resetStreak();

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

  // Check mode/difficulty achievements
  checkAchievements();
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
  let hadWrong = false;

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
        hadWrong = true;
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
        hadWrong = true;
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
      incrementStreak();
      soundCorrect();
    } else {
      div.className = "exercise wrong";
      feedback.textContent = "falsch";
      wrongCount++;
      hadWrong = true;
      soundWrong();
    }
  });

  // Break streak if any wrong answers
  if (hadWrong) {
    breakStreak();
  }

  // Stars with streak multiplier
  if (newCorrect > 0) {
    const mult = getStreakMultiplier();
    const earnedStars = newCorrect * mult;
    addStars(earnedStars);
    // XP: 1 XP per correct answer, multiplied by streak
    addXP(newCorrect * mult);
  }

  // Show summary
  const summary = document.getElementById("result-summary");
  summary.classList.remove("hidden");
  const checkBtn = document.getElementById("btn-check");
  const percent = correctCount / exercises.length;

  if (correctCount === exercises.length) {
    // Bonus stars for perfect round
    addStars(3);
    addXP(5);
    perfectRounds++;
    localStorage.setItem("mathe-perfect-rounds", perfectRounds.toString());
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

  // Check for new achievements
  checkAchievements();

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
renderLevel();
renderStreak();
generateExercises();
