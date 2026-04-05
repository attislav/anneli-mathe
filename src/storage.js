// ============ LOCALSTORAGE HELPERS ============
import { state } from "./state.js";

export function profileKey(key) {
  if (!state.currentProfile) return `mathe-${key}`;
  return `mathe-${state.currentProfile}-${key}`;
}

export function subjectKey(key) {
  const subject = state.currentSubject || "mathe";
  return profileKey(`${subject}-${key}`);
}

export function safeSave(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage write failed:", key, e.name);
  }
}

export function getAllProfiles() {
  return JSON.parse(localStorage.getItem("mathe-profiles") || "[]");
}

export function saveProfiles(profiles) {
  safeSave("mathe-profiles", JSON.stringify(profiles));
}

export function savePathProgress() {
  safeSave(subjectKey("stages"), JSON.stringify(state.unlockedStages));
  safeSave(subjectKey("mastered"), JSON.stringify(state.masteredStages));
}

export function saveSkillMasteryProgress() {
  safeSave(subjectKey("skill-mastery"), JSON.stringify(state.skillMasteryProgress || {}));
}

export function loadSubjectProgress() {
  state.unlockedStages = JSON.parse(localStorage.getItem(subjectKey("stages")) || "[0]");
  state.masteredStages = JSON.parse(localStorage.getItem(subjectKey("mastered")) || "[]");
  state.skillMasteryProgress = JSON.parse(localStorage.getItem(subjectKey("skill-mastery")) || "{}");
  state.errorPool = JSON.parse(localStorage.getItem(subjectKey("errors")) || "[]");
}

export function savePracticeLog() {
  safeSave(profileKey("practice-log"), JSON.stringify(state.practiceLog || []));
}

export function loadProfileData() {
  state.totalStars = parseInt(localStorage.getItem(profileKey("sterne")) || "0", 10);
  state.totalXP = parseInt(localStorage.getItem(profileKey("xp")) || "0", 10);
  state.unlockedAchievements = JSON.parse(localStorage.getItem(profileKey("achievements")) || "[]");
  state.perfectRounds = parseInt(localStorage.getItem(profileKey("perfect-rounds")) || "0", 10);
  state.practiceLog = JSON.parse(localStorage.getItem(profileKey("practice-log")) || "[]");

  // Load subject-specific progress
  state.unlockedStages = JSON.parse(localStorage.getItem(subjectKey("stages")) || "[0]");
  state.masteredStages = JSON.parse(localStorage.getItem(subjectKey("mastered")) || "[]");
  state.skillMasteryProgress = JSON.parse(localStorage.getItem(subjectKey("skill-mastery")) || "{}");
  state.errorPool = JSON.parse(localStorage.getItem(subjectKey("errors")) || "[]");
}
