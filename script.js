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

// ============ LEARNING PATH ============
const LEARNING_PATH = [
  { id: 0,  name: "Plus bis 5",       icon: "🌱", diff: "leicht", op: "plus",     passScore: 0.8 },
  { id: 1,  name: "Minus bis 5",      icon: "🍃", diff: "leicht", op: "minus",    passScore: 0.8 },
  { id: 2,  name: "Gemischt bis 10",  icon: "🌻", diff: "leicht", op: "gemischt", passScore: 0.8 },
  { id: 3,  name: "Plus bis 10",      icon: "🌿", diff: "mittel", op: "plus",     passScore: 0.8 },
  { id: 4,  name: "Minus bis 10",     icon: "🌲", diff: "mittel", op: "minus",    passScore: 0.8 },
  { id: 5,  name: "Gemischt bis 10",  icon: "🔥", diff: "mittel", op: "gemischt", passScore: 0.8 },
  { id: 6,  name: "Lücken leicht",    icon: "🧩", diff: "leicht", op: "luecken",  passScore: 0.8 },
  { id: 7,  name: "Plus bis 20",      icon: "💪", diff: "schwer", op: "plus",     passScore: 0.8 },
  { id: 8,  name: "Minus bis 20",     icon: "🧗", diff: "schwer", op: "minus",    passScore: 0.8 },
  { id: 9,  name: "Gemischt bis 20",  icon: "🏔️", diff: "schwer", op: "gemischt", passScore: 0.8 },
  { id: 10, name: "Lücken schwer",    icon: "🔮", diff: "schwer", op: "luecken",  passScore: 0.8 },
  { id: 11, name: "Zehnerzerlegung",  icon: "🎯", diff: "mittel", op: "zehner",   passScore: 0.8 },
  { id: 12, name: "Meister-Prüfung",  icon: "👑", diff: "schwer", op: "gemischt", passScore: 0.9 },
];

let unlockedStages = JSON.parse(localStorage.getItem("mathe-stages") || "[0]");
let masteredStages = JSON.parse(localStorage.getItem("mathe-mastered") || "[]");
let currentStage = null;
let currentMode = "lernpfad";

function savePathProgress() {
  localStorage.setItem("mathe-stages", JSON.stringify(unlockedStages));
  localStorage.setItem("mathe-mastered", JSON.stringify(masteredStages));
}

function selectStage(stageId) {
  if (!unlockedStages.includes(stageId)) return;
  const stage = LEARNING_PATH[stageId];
  currentStage = stageId;
  currentDifficulty = stage.diff;
  currentOperation = stage.op;
  renderLearningPath();
  generateExercises();
}

function completeStage(stageId, score) {
  const stage = LEARNING_PATH[stageId];
  if (score >= stage.passScore) {
    // Mark as mastered
    if (!masteredStages.includes(stageId)) {
      masteredStages.push(stageId);
    }
    // Unlock next stage
    const nextId = stageId + 1;
    if (nextId < LEARNING_PATH.length && !unlockedStages.includes(nextId)) {
      unlockedStages.push(nextId);
      const next = LEARNING_PATH[nextId];
      showToast(next.icon, "Neue Stufe freigeschaltet!", next.name);
    }
    savePathProgress();
    renderLearningPath();
  }
}

function renderLearningPath() {
  const container = document.getElementById("path-stages");
  const hint = document.getElementById("path-hint");
  if (!container) return;
  container.innerHTML = "";

  LEARNING_PATH.forEach((stage) => {
    const unlocked = unlockedStages.includes(stage.id);
    const mastered = masteredStages.includes(stage.id);
    const active = currentStage === stage.id;

    const el = document.createElement("div");
    let cls = "path-stage";
    if (active) cls += " active";
    else if (mastered) cls += " mastered";
    else if (unlocked) cls += " unlocked";
    else cls += " locked";
    el.className = cls;

    el.innerHTML = `
      <span class="stage-icon">${stage.icon}</span>
      <span class="stage-name">${stage.name}</span>
      ${mastered ? '<span class="stage-check">✅</span>' : ""}
    `;
    el.title = unlocked ? stage.name : "Noch gesperrt";

    if (unlocked) {
      el.addEventListener("click", () => selectStage(stage.id));
    }

    container.appendChild(el);
  });

  if (hint) {
    if (currentStage !== null) {
      const stage = LEARNING_PATH[currentStage];
      hint.textContent = `Stufe ${currentStage + 1}: ${stage.name} — Schaffe ${Math.round(stage.passScore * 100)}% richtig zum Weiterkommen!`;
    } else {
      hint.textContent = "Wähle eine Stufe zum Üben!";
    }
  }
}

// ============ ERROR POOL (Fehler-Wiederholung) ============
let errorPool = JSON.parse(localStorage.getItem("mathe-errors") || "[]");

function addToErrorPool(exercise) {
  // Only store normal and luecke exercises (not zehner)
  if (exercise.type === "zehner") return;

  const entry = {
    type: exercise.type,
    op: exercise.type === "normal" ? exercise.op : exercise.display.op,
    a: exercise.type === "normal" ? exercise.a : (exercise.display.left || exercise.answer),
    b: exercise.type === "normal" ? exercise.b : (exercise.display.right || exercise.answer),
    answer: exercise.answer,
    timestamp: Date.now(),
  };

  // Avoid duplicates
  const isDupe = errorPool.some((e) => e.op === entry.op && e.a === entry.a && e.b === entry.b);
  if (!isDupe) {
    errorPool.push(entry);
  }
  // Keep only last 30
  if (errorPool.length > 30) errorPool = errorPool.slice(-30);
  localStorage.setItem("mathe-errors", JSON.stringify(errorPool));
}

function removeFromErrorPool(exercise) {
  if (exercise.type === "zehner") return;
  const op = exercise.type === "normal" ? exercise.op : exercise.display.op;
  const a = exercise.type === "normal" ? exercise.a : (exercise.display.left || exercise.answer);
  const b = exercise.type === "normal" ? exercise.b : (exercise.display.right || exercise.answer);

  errorPool = errorPool.filter((e) => !(e.op === op && e.a === a && e.b === b));
  localStorage.setItem("mathe-errors", JSON.stringify(errorPool));
}

function getErrorRepeatExercises(config, count) {
  // Find error pool entries that fit the current config
  const matching = errorPool.filter((e) => {
    if (e.type === "normal") {
      const result = e.op === "+" ? e.a + e.b : e.a - e.b;
      return result <= config.maxResult && e.a <= config.maxResult && e.b <= config.maxNumber;
    }
    return true;
  });

  if (matching.length === 0) return [];

  const result = [];
  const used = new Set();
  const maxRepeat = Math.min(count, matching.length);

  for (let i = 0; i < maxRepeat; i++) {
    const idx = Math.floor(Math.random() * matching.length);
    const entry = matching[idx];
    const key = `${entry.op}-${entry.a}-${entry.b}`;
    if (used.has(key)) continue;
    used.add(key);

    if (entry.type === "normal" || !entry.type) {
      result.push({
        type: "normal",
        a: entry.a,
        b: entry.b,
        op: entry.op,
        answer: entry.op === "+" ? entry.a + entry.b : entry.a - entry.b,
        isRepeat: true,
      });
    }
  }
  return result;
}

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

  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    playTone(freq, 0.25, i * 0.15, "sine", 0.3);
  });

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
  { id: "path_half", icon: "🗺️", name: "Halbzeit", desc: "Schaffe die Hälfte des Lernpfads" },
  { id: "path_complete", icon: "🏁", name: "Lernpfad komplett", desc: "Meistere alle Stufen" },
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
  if (totalStars >= 1) unlockAchievement("first_star");
  if (totalStars >= 10) unlockAchievement("ten_stars");
  if (totalStars >= 50) unlockAchievement("fifty_stars");
  if (totalStars >= 100) unlockAchievement("hundred_stars");

  if (perfectRounds >= 1) unlockAchievement("first_perfect");
  if (perfectRounds >= 5) unlockAchievement("five_perfect");
  if (perfectRounds >= 10) unlockAchievement("ten_perfect");

  if (currentStreak >= 3) unlockAchievement("streak_3");
  if (currentStreak >= 5) unlockAchievement("streak_5");
  if (currentStreak >= 10) unlockAchievement("streak_10");

  if (currentDifficulty === "mittel") unlockAchievement("try_medium");
  if (currentDifficulty === "schwer") unlockAchievement("try_hard");
  if (currentOperation === "luecken") unlockAchievement("try_luecken");
  if (currentOperation === "zehner") unlockAchievement("try_zehner");

  const lvl = getCurrentLevel();
  if (lvl >= 2) unlockAchievement("level_3");
  if (lvl >= 4) unlockAchievement("level_5");
  if (lvl >= LEVELS.length - 1) unlockAchievement("level_max");

  // Learning path achievements
  const halfPath = Math.floor(LEARNING_PATH.length / 2);
  if (masteredStages.length >= halfPath) unlockAchievement("path_half");
  if (masteredStages.length >= LEARNING_PATH.length) unlockAchievement("path_complete");
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

// ============ MODE TOGGLE ============
document.getElementById("btn-mode-path").addEventListener("click", () => {
  currentMode = "lernpfad";
  document.getElementById("btn-mode-path").classList.add("active");
  document.getElementById("btn-mode-free").classList.remove("active");
  document.getElementById("learning-path").classList.remove("hidden");
  document.getElementById("settings-panel").classList.add("hidden");
  renderLearningPath();
});

document.getElementById("btn-mode-free").addEventListener("click", () => {
  currentMode = "frei";
  currentStage = null;
  document.getElementById("btn-mode-free").classList.add("active");
  document.getElementById("btn-mode-path").classList.remove("active");
  document.getElementById("learning-path").classList.add("hidden");
  document.getElementById("settings-panel").classList.remove("hidden");
});

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
  hideAdaptiveSuggestion();

  if (currentOperation === "luecken") {
    generateLuecken(config);
  } else if (currentOperation === "zehner") {
    generateZehner(config);
  } else {
    // Mix in error repeat exercises (up to 30% of the round)
    const repeatCount = Math.floor(config.count * 0.3);
    const repeats = getErrorRepeatExercises(config, repeatCount);
    repeats.forEach((ex) => exercises.push(ex));

    // Fill the rest with new exercises
    const remaining = config.count - exercises.length;
    generateNormal(config, remaining);

    // Shuffle so repeats aren't always at the start
    shuffleArray(exercises);
  }

  renderExercises();
  document.getElementById("actions").classList.remove("hidden");
  document.getElementById("result-summary").classList.add("hidden");
  document.getElementById("result-summary").className = "hidden";

  const checkBtn = document.getElementById("btn-check");
  checkBtn.textContent = "Antworten prüfen";
  checkBtn.disabled = false;

  checkAchievements();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function generateNormal(config, count) {
  if (count === undefined) count = config.count;
  for (let i = 0; i < count; i++) {
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

    const gapPositions = ["left", "right"];
    const gap = pickRandom(gapPositions);

    if (gap === "left") {
      exercises.push({
        type: "luecke",
        display: { left: null, op, right: b, result },
        answer: a,
      });
    } else {
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

    const repeatBadge = ex.isRepeat ? '<span class="error-repeat-badge">Üben!</span>' : "";

    if (ex.type === "normal") {
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">${ex.a} ${ex.op} ${ex.b} =</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" autocomplete="off">
        <span class="feedback" id="feedback-${i}"></span>
        ${repeatBadge}
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

// ============ NUMBER LINE VISUALIZATION ============
function createNumberLineSVG(a, op, b, answer, maxNum) {
  const svgNS = "http://www.w3.org/2000/svg";
  const width = 380;
  const height = 65;
  const padding = 25;
  const lineY = 40;
  const lineWidth = width - 2 * padding;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "auto");

  // Number line
  const line = document.createElementNS(svgNS, "line");
  line.setAttribute("x1", padding);
  line.setAttribute("y1", lineY);
  line.setAttribute("x2", width - padding);
  line.setAttribute("y2", lineY);
  line.setAttribute("stroke", "#ccc");
  line.setAttribute("stroke-width", "2");
  svg.appendChild(line);

  // Ticks and numbers
  for (let n = 0; n <= maxNum; n++) {
    const x = padding + (n / maxNum) * lineWidth;

    const tick = document.createElementNS(svgNS, "line");
    tick.setAttribute("x1", x);
    tick.setAttribute("y1", lineY - 5);
    tick.setAttribute("x2", x);
    tick.setAttribute("y2", lineY + 5);
    tick.setAttribute("stroke", "#999");
    tick.setAttribute("stroke-width", "1.5");
    svg.appendChild(tick);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", lineY + 18);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10");
    text.setAttribute("fill", "#666");
    text.textContent = n;
    svg.appendChild(text);
  }

  // Start position
  const startX = padding + (a / maxNum) * lineWidth;
  const endX = padding + (answer / maxNum) * lineWidth;

  // Start dot
  const startDot = document.createElementNS(svgNS, "circle");
  startDot.setAttribute("cx", startX);
  startDot.setAttribute("cy", lineY);
  startDot.setAttribute("r", "5");
  startDot.setAttribute("fill", "#e84393");
  svg.appendChild(startDot);

  // End dot
  const endDot = document.createElementNS(svgNS, "circle");
  endDot.setAttribute("cx", endX);
  endDot.setAttribute("cy", lineY);
  endDot.setAttribute("r", "5");
  endDot.setAttribute("fill", "#4caf50");
  svg.appendChild(endDot);

  // Arc showing the jump
  const midX = (startX + endX) / 2;
  const arcHeight = Math.min(25, Math.abs(endX - startX) * 0.4);
  const arcY = lineY - arcHeight - 5;

  const path = document.createElementNS(svgNS, "path");
  const d = `M ${startX},${lineY - 6} Q ${midX},${arcY} ${endX},${lineY - 6}`;
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#42a5f5");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-dasharray", "4,3");
  svg.appendChild(path);

  // Arrow at end
  const arrowSize = 4;
  const arrowDir = endX > startX ? -1 : 1;
  const arrow = document.createElementNS(svgNS, "polygon");
  arrow.setAttribute("points", `${endX},${lineY - 6} ${endX + arrowDir * arrowSize},${lineY - 6 - arrowSize} ${endX + arrowDir * arrowSize},${lineY - 6 + arrowSize}`);
  arrow.setAttribute("fill", "#42a5f5");
  svg.appendChild(arrow);

  // Label on the arc
  const label = document.createElementNS(svgNS, "text");
  label.setAttribute("x", midX);
  label.setAttribute("y", arcY - 2);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "11");
  label.setAttribute("font-weight", "bold");
  label.setAttribute("fill", "#1565c0");
  label.textContent = `${op}${b}`;
  svg.appendChild(label);

  return svg;
}

function showNumberLineHelp(exerciseIndex) {
  const ex = exercises[exerciseIndex];
  if (!ex || ex.type === "zehner") return;

  const div = document.querySelector(`.exercise[data-index="${exerciseIndex}"]`);
  if (!div || div.querySelector(".numberline-help")) return;

  let a, op, b, answer, maxNum;
  const config = DIFFICULTY[currentDifficulty];

  if (ex.type === "normal") {
    a = ex.a;
    op = ex.op;
    b = ex.b;
    answer = ex.answer;
    maxNum = config.maxResult;
  } else if (ex.type === "luecke") {
    const d = ex.display;
    if (d.left === null) {
      // ? + right = result → show: answer + right = result
      a = ex.answer;
      op = d.op;
      b = d.right;
      answer = d.result;
      if (d.op === "-") {
        answer = ex.answer;
        a = d.result; // The bigger number for subtraction
        // Actually for luecke: ? - right = result means a - b = result, a = ?
        // Let's show: starting at answer, going +right to get a
        a = ex.answer;
        op = "+";
        b = d.right;
        answer = d.op === "+" ? d.result : d.result; // Just show the relationship
      }
      // Simplify: show the full equation on number line
      if (d.op === "+") {
        a = ex.answer;
        op = "+";
        b = d.right;
        answer = d.result;
      } else {
        a = d.result + ex.answer; // Reconstruct: ? - right = result means ? = result + right
        op = "-";
        b = d.right;
        answer = d.result;
        a = ex.answer; // ? is the answer
      }
    } else {
      // left + ? = result
      a = d.left;
      op = d.op;
      b = ex.answer;
      answer = d.result;
      if (d.op === "-") {
        answer = d.result;
      }
    }
    maxNum = config.maxResult;
  }

  if (a === undefined) return;

  const helpDiv = document.createElement("div");
  helpDiv.className = "numberline-help";

  const svg = createNumberLineSVG(a, op, b, answer, maxNum);
  helpDiv.appendChild(svg);

  const labelDiv = document.createElement("div");
  labelDiv.className = "numberline-label";
  labelDiv.textContent = `${a} ${op} ${b} = ${answer}`;
  helpDiv.appendChild(labelDiv);

  div.appendChild(helpDiv);
}

// ============ ADAPTIVE SUGGESTIONS ============
function showAdaptiveSuggestion(correctCount, total) {
  const el = document.getElementById("adaptive-suggestion");
  if (!el) return;

  const percent = correctCount / total;

  if (currentMode === "lernpfad" && currentStage !== null) {
    const stage = LEARNING_PATH[currentStage];
    if (percent >= stage.passScore) {
      const nextId = currentStage + 1;
      if (nextId < LEARNING_PATH.length && unlockedStages.includes(nextId)) {
        const next = LEARNING_PATH[nextId];
        el.className = "adaptive-suggestion suggest-up";
        el.innerHTML = `
          ${next.icon} Gut gemacht! Du hast die Stufe geschafft! Bereit für <strong>${next.name}</strong>?
          <br><button class="suggest-btn" onclick="selectStage(${nextId})">Weiter zur nächsten Stufe!</button>
        `;
        el.classList.remove("hidden");
        return;
      }
    } else {
      el.className = "adaptive-suggestion suggest-stay";
      el.innerHTML = `
        Du brauchst ${Math.round(stage.passScore * 100)}% richtig zum Weiterkommen. Versuche es nochmal!
      `;
      el.classList.remove("hidden");
      return;
    }
  }

  // Free mode suggestions
  if (currentMode === "frei" && percent >= 0.9) {
    const diffOrder = ["leicht", "mittel", "schwer"];
    const currentIdx = diffOrder.indexOf(currentDifficulty);
    if (currentIdx < diffOrder.length - 1) {
      const nextDiff = diffOrder[currentIdx + 1];
      const nextLabel = nextDiff.charAt(0).toUpperCase() + nextDiff.slice(1);
      el.className = "adaptive-suggestion suggest-up";
      el.innerHTML = `
        Das war super! Du bist bereit für <strong>${nextLabel}</strong>!
      `;
      el.classList.remove("hidden");
      return;
    }
  }

  el.classList.add("hidden");
}

function hideAdaptiveSuggestion() {
  const el = document.getElementById("adaptive-suggestion");
  if (el) el.classList.add("hidden");
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
      // Remove from error pool if it was a repeat
      removeFromErrorPool(ex);
    } else {
      div.className = "exercise wrong";
      // Show correct answer next to "falsch"
      let correctText = "";
      if (ex.type === "normal" || ex.type === "luecke") {
        correctText = ` → ${ex.answer}`;
      } else if (ex.type === "zehner") {
        const exampleA = Math.floor(ex.target / 2);
        const exampleB = ex.target - exampleA;
        correctText = ` → z.B. ${exampleA}+${exampleB}`;
      }
      feedback.innerHTML = `falsch<span class="correct-hint">${correctText}</span>`;
      wrongCount++;
      hadWrong = true;
      soundWrong();
      // Add to error pool for future repetition
      addToErrorPool(ex);
      // Show number line help
      showNumberLineHelp(i);
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
    addXP(newCorrect * mult);
  }

  // Show summary
  const summary = document.getElementById("result-summary");
  summary.classList.remove("hidden");
  const checkBtn = document.getElementById("btn-check");
  const percent = correctCount / exercises.length;

  if (correctCount === exercises.length) {
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

    // Complete learning path stage
    if (currentMode === "lernpfad" && currentStage !== null) {
      completeStage(currentStage, 1.0);
    }
  } else if (percent >= 0.5) {
    summary.className = "good";
    summary.innerHTML = `<img src="gut.png" class="result-image" alt="Gut gemacht!"><br>${correctCount} von ${exercises.length} richtig. Gut gemacht! Versuch die anderen nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
    focusFirstWrong();

    // Check stage completion even if not perfect
    if (currentMode === "lernpfad" && currentStage !== null) {
      completeStage(currentStage, percent);
    }
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

  // Show adaptive suggestion
  showAdaptiveSuggestion(correctCount, exercises.length);

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
renderLearningPath();
// Auto-select first unlocked non-mastered stage
const firstAvailable = LEARNING_PATH.find((s) =>
  unlockedStages.includes(s.id) && !masteredStages.includes(s.id)
);
if (firstAvailable) {
  selectStage(firstAvailable.id);
} else if (unlockedStages.length > 0) {
  selectStage(unlockedStages[unlockedStages.length - 1]);
}
