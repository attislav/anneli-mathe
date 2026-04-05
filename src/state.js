// ============ SHARED STATE + CONSTANTS ============
// All mutable app state lives here. Modules import and mutate this object.
// Simple event bus breaks circular dependencies between modules.

export const events = {
  _handlers: {},
  on(event, handler) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(handler);
  },
  emit(event, ...args) {
    (this._handlers[event] || []).forEach((h) => h(...args));
  },
};

// ============ CONSTANTS ============

export const ADJEKTIVE = [
  "Schlau", "Mutig", "Schnell", "Lustig", "Stark", "Klug",
  "Wild", "Cool", "Flink", "Tapfer", "Frech", "Lieb",
  "Bunt", "Gross", "Klein", "Witzig", "Pfiffig", "Flott",
  "Sanft", "Froh", "Stolz", "Wach", "Zart", "Fix",
];

export const WESEN = [
  "Fuchs", "Drache", "Einhorn", "Tiger", "Adler", "Panda",
  "Delfin", "Loewe", "Katze", "Hund", "Baer", "Hase",
  "Eule", "Wolf", "Frosch", "Pinguin", "Affe", "Otter",
  "Igel", "Falke", "Rabe", "Dachs", "Luchs", "Biber",
];

export const DIFFICULTY = {
  leicht: { maxNumber: 5, maxResult: 10, count: 5, zehnerTargets: [5, 6, 7, 8] },
  mittel: { maxNumber: 10, maxResult: 10, count: 8, zehnerTargets: [6, 7, 8, 9, 10] },
  schwer: { maxNumber: 10, maxResult: 20, count: 10, zehnerTargets: [10, 12, 14, 16, 18, 20] },
};

export const LEVELS = [
  { name: "Mathe-Anfänger", mascot: "🐣", xpNeeded: 0 },
  { name: "Rechen-Entdecker", mascot: "🐱", xpNeeded: 20 },
  { name: "Zahlen-Fuchs", mascot: "🦊", xpNeeded: 50 },
  { name: "Rechen-Held", mascot: "🦁", xpNeeded: 100 },
  { name: "Mathe-Profi", mascot: "🦄", xpNeeded: 200 },
  { name: "Zahlen-Champion", mascot: "🐉", xpNeeded: 350 },
  { name: "Mathe-Genie", mascot: "👑", xpNeeded: 500 },
];

export const ACHIEVEMENTS = [
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

export const DEFAULT_LEARNING_PATH = [
  { id: 0,  name: "Plus bis 5",       icon: "🌱", diff: "leicht", op: "plus",        passScore: 0.8 },
  { id: 1,  name: "Minus bis 5",      icon: "🍃", diff: "leicht", op: "minus",       passScore: 0.8 },
  { id: 2,  name: "Nachbarzahlen",    icon: "🏠", diff: "leicht", op: "nachbarn",    passScore: 0.8 },
  { id: 3,  name: "Gemischt bis 10",  icon: "🌻", diff: "leicht", op: "gemischt",    passScore: 0.8 },
  { id: 4,  name: "Verdoppeln",       icon: "🪞", diff: "leicht", op: "verdoppeln",  passScore: 0.8 },
  { id: 5,  name: "Plus bis 10",      icon: "🌿", diff: "mittel", op: "plus",        passScore: 0.8 },
  { id: 6,  name: "Minus bis 10",     icon: "🌲", diff: "mittel", op: "minus",       passScore: 0.8 },
  { id: 7,  name: "Vergleichen",      icon: "⚖️", diff: "leicht", op: "vergleichen", passScore: 0.8 },
  { id: 8,  name: "Gemischt bis 10",  icon: "��", diff: "mittel", op: "gemischt",    passScore: 0.8 },
  { id: 9,  name: "Lücken leicht",    icon: "🧩", diff: "leicht", op: "luecken",     passScore: 0.8 },
  { id: 10, name: "Zahlenreihen",     icon: "🔢", diff: "leicht", op: "reihen",      passScore: 0.8 },
  { id: 11, name: "Plus bis 20",      icon: "💪", diff: "schwer", op: "plus",        passScore: 0.8 },
  { id: 12, name: "Minus bis 20",     icon: "🧗", diff: "schwer", op: "minus",       passScore: 0.8 },
  { id: 13, name: "Gemischt bis 20",  icon: "🏔��", diff: "schwer", op: "gemischt",   passScore: 0.8 },
  { id: 14, name: "Lücken schwer",    icon: "🔮", diff: "schwer", op: "luecken",     passScore: 0.8 },
  { id: 15, name: "Zehnerzerlegung",  icon: "🎯", diff: "mittel", op: "zehner",      passScore: 0.8 },
  { id: 16, name: "Meister-Prüfung",  icon: "👑", diff: "schwer", op: "gemischt",    passScore: 0.9 },
];

// ============ MUTABLE STATE ============

export const state = {
  currentProfile: null,
  currentDifficulty: "leicht",
  currentOperation: "gemischt",
  currentSubject: "mathe",
  currentGrade: "grade-1",
  currentMode: "lernpfad",
  currentStage: null,
  currentStreak: 0,

  exercises: [],
  checked: false,
  attempts: [],

  LEARNING_PATH: [...DEFAULT_LEARNING_PATH],
  unlockedStages: [0],
  masteredStages: [],
  skillMasteryProgress: {},

  totalStars: 0,
  totalXP: 0,
  unlockedAchievements: [],
  perfectRounds: 0,

  errorPool: [],
  practiceLog: [],

  readingData: null,
  topicsData: null,
  audioCtx: null,
  roundStartAt: null,
  roundContext: { mode: null, skillId: null },
};
