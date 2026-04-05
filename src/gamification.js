// ============ GAMIFICATION: Stars, XP, Streaks, Levels, Achievements ============
import { state, LEVELS, ACHIEVEMENTS, events } from "./state.js";
import { profileKey } from "./storage.js";
import { soundStreak, soundLevelUp } from "./audio.js";

// ============ STARS ============

export function saveStars() {
  localStorage.setItem(profileKey("sterne"), state.totalStars.toString());
  renderStars();
}

export function renderStars() {
  const el = document.getElementById("star-count");
  if (el) el.textContent = state.totalStars;
}

export function addStars(count) {
  state.totalStars += count;
  saveStars();
  animateStars();
}

function animateStars() {
  const el = document.getElementById("star-display");
  if (!el) return;
  el.classList.add("star-bounce");
  setTimeout(() => el.classList.remove("star-bounce"), 500);
}

// ============ STREAK / COMBO ============

export function resetStreak() {
  state.currentStreak = 0;
  renderStreak();
}

export function incrementStreak() {
  state.currentStreak++;
  renderStreak();
  if (state.currentStreak >= 3) {
    soundStreak();
  }
}

export function breakStreak() {
  state.currentStreak = 0;
  renderStreak();
}

export function getStreakMultiplier() {
  if (state.currentStreak >= 5) return 3;
  if (state.currentStreak >= 3) return 2;
  return 1;
}

export function renderStreak() {
  const el = document.getElementById("streak-display");
  const countEl = document.getElementById("streak-count");
  if (!el || !countEl) return;

  if (state.currentStreak >= 2) {
    el.classList.remove("hidden");
    countEl.textContent = state.currentStreak;
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

// ============ LEVEL / XP ============

export function getCurrentLevel() {
  let lvl = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (state.totalXP >= LEVELS[i].xpNeeded) {
      lvl = i;
      break;
    }
  }
  return lvl;
}

export function addXP(amount) {
  const oldLevel = getCurrentLevel();
  state.totalXP += amount;
  localStorage.setItem(profileKey("xp"), state.totalXP.toString());
  const newLevel = getCurrentLevel();
  renderLevel();

  if (newLevel > oldLevel) {
    celebrateLevelUp(newLevel);
  }
}

export function renderLevel() {
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
    const xpInLevel = state.totalXP - level.xpNeeded;
    const xpForLevel = nextLevel.xpNeeded - level.xpNeeded;
    const percent = Math.min((xpInLevel / xpForLevel) * 100, 100);
    if (fillEl) fillEl.style.width = percent + "%";
    if (textEl) textEl.textContent = `${state.totalXP} / ${nextLevel.xpNeeded} XP`;
  } else {
    if (fillEl) fillEl.style.width = "100%";
    if (textEl) textEl.textContent = `${state.totalXP} XP — Max Level!`;
  }
}

function celebrateLevelUp(lvl) {
  const level = LEVELS[lvl];
  const el = document.getElementById("level-display");
  if (el) {
    el.classList.add("level-up");
    setTimeout(() => el.classList.remove("level-up"), 1000);
  }

  soundLevelUp();
  events.emit("toast", level.mascot, "Level Up!", level.name);
  events.emit("confetti");
}

// ============ ACHIEVEMENTS ============

export function unlockAchievement(id) {
  if (state.unlockedAchievements.includes(id)) return;
  state.unlockedAchievements.push(id);
  localStorage.setItem(profileKey("achievements"), JSON.stringify(state.unlockedAchievements));

  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (achievement) {
    events.emit("toast", achievement.icon, "Abzeichen freigeschaltet!", achievement.name);
  }
}

export function checkAchievements() {
  if (state.totalStars >= 1) unlockAchievement("first_star");
  if (state.totalStars >= 10) unlockAchievement("ten_stars");
  if (state.totalStars >= 50) unlockAchievement("fifty_stars");
  if (state.totalStars >= 100) unlockAchievement("hundred_stars");

  if (state.perfectRounds >= 1) unlockAchievement("first_perfect");
  if (state.perfectRounds >= 5) unlockAchievement("five_perfect");
  if (state.perfectRounds >= 10) unlockAchievement("ten_perfect");

  if (state.currentStreak >= 3) unlockAchievement("streak_3");
  if (state.currentStreak >= 5) unlockAchievement("streak_5");
  if (state.currentStreak >= 10) unlockAchievement("streak_10");

  if (state.currentDifficulty === "mittel") unlockAchievement("try_medium");
  if (state.currentDifficulty === "schwer") unlockAchievement("try_hard");
  if (state.currentOperation === "luecken") unlockAchievement("try_luecken");
  if (state.currentOperation === "zehner") unlockAchievement("try_zehner");

  const lvl = getCurrentLevel();
  if (lvl >= 2) unlockAchievement("level_3");
  if (lvl >= 4) unlockAchievement("level_5");
  if (lvl >= LEVELS.length - 1) unlockAchievement("level_max");

  const halfPath = Math.floor(state.LEARNING_PATH.length / 2);
  if (state.masteredStages.length >= halfPath) unlockAchievement("path_half");
  if (state.masteredStages.length >= state.LEARNING_PATH.length) unlockAchievement("path_complete");
}

export function renderAchievements() {
  const grid = document.getElementById("achievements-grid");
  if (!grid) return;
  grid.innerHTML = "";

  ACHIEVEMENTS.forEach((a) => {
    const unlocked = state.unlockedAchievements.includes(a.id);
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
