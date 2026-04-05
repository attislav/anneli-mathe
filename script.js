// ============ ACCOUNT SYSTEM ============
const ADJEKTIVE = [
  "Schlau", "Mutig", "Schnell", "Lustig", "Stark", "Klug",
  "Wild", "Cool", "Flink", "Tapfer", "Frech", "Lieb",
  "Bunt", "Gross", "Klein", "Witzig", "Pfiffig", "Flott",
  "Sanft", "Froh", "Stolz", "Wach", "Zart", "Fix",
];
const WESEN = [
  "Fuchs", "Drache", "Einhorn", "Tiger", "Adler", "Panda",
  "Delfin", "Loewe", "Katze", "Hund", "Baer", "Hase",
  "Eule", "Wolf", "Frosch", "Pinguin", "Affe", "Otter",
  "Igel", "Falke", "Rabe", "Dachs", "Luchs", "Biber",
];

let currentProfile = null;

function generateUsername() {
  const adj = ADJEKTIVE[Math.floor(Math.random() * ADJEKTIVE.length)];
  const wesen = WESEN[Math.floor(Math.random() * WESEN.length)];
  const zahl = Math.floor(Math.random() * 100);
  return `${adj}${wesen}${zahl}`;
}

function getAllProfiles() {
  return JSON.parse(localStorage.getItem("mathe-profiles") || "[]");
}

function saveProfiles(profiles) {
  localStorage.setItem("mathe-profiles", JSON.stringify(profiles));
}

function generateUniqueName() {
  const profiles = getAllProfiles();
  const existing = new Set(profiles.map((p) => p.name));
  let name;
  let attempts = 0;
  do {
    name = generateUsername();
    attempts++;
  } while (existing.has(name) && attempts < 100);
  return name;
}

function createProfile(name) {
  const profiles = getAllProfiles();
  const profile = { name, createdAt: Date.now() };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

function deleteProfile(name) {
  let profiles = getAllProfiles();
  profiles = profiles.filter((p) => p.name !== name);
  saveProfiles(profiles);
  // Remove all localStorage data for this profile
  const prefix = `mathe-${name}-`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

function profileKey(key) {
  if (!currentProfile) return `mathe-${key}`;
  return `mathe-${currentProfile}-${key}`;
}

function loginAs(name) {
  currentProfile = name;
  localStorage.setItem("mathe-last-profile", name);
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  loadProfileData();
  initApp();
}

function switchProfile() {
  document.getElementById("app-container").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  showLoginScreen();
}

let skillMasteryProgress = {}; // { [skillId]: { passes: number } }
let practiceLog = []; // [{ts, durationSec, correct, total, mode, skillId?}]

function loadProfileData() {
  totalStars = parseInt(localStorage.getItem(profileKey("sterne")) || "0", 10);
  totalXP = parseInt(localStorage.getItem(profileKey("xp")) || "0", 10);
  unlockedStages = JSON.parse(localStorage.getItem(profileKey("stages")) || "[0]");
  masteredStages = JSON.parse(localStorage.getItem(profileKey("mastered")) || "[]");
  unlockedAchievements = JSON.parse(localStorage.getItem(profileKey("achievements")) || "[]");
  perfectRounds = parseInt(localStorage.getItem(profileKey("perfect-rounds")) || "0", 10);
  errorPool = JSON.parse(localStorage.getItem(profileKey("errors")) || "[]");
  skillMasteryProgress = JSON.parse(localStorage.getItem(profileKey("skill-mastery")) || "{}");
  practiceLog = JSON.parse(localStorage.getItem(profileKey("practice-log")) || "[]");
}

function showLoginScreen() {
  const profileList = document.getElementById("profile-list");
  const profiles = getAllProfiles();
  profileList.innerHTML = "";

  profiles.forEach((p) => {
    const stars = parseInt(localStorage.getItem(`mathe-${p.name}-sterne`) || "0", 10);
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <span class="profile-name">${p.name}</span>
      <span class="profile-stars">⭐ ${stars}</span>
      <button class="profile-delete" title="Profil löschen">&times;</button>
    `;
    card.querySelector(".profile-name").addEventListener("click", () => loginAs(p.name));
    card.querySelector(".profile-stars").addEventListener("click", () => loginAs(p.name));
    card.querySelector(".profile-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Profil "${p.name}" wirklich löschen?`)) {
        deleteProfile(p.name);
        showLoginScreen();
      }
    });
    profileList.appendChild(card);
  });

  // Generate a new name
  const nameEl = document.getElementById("generated-name");
  nameEl.textContent = generateUniqueName();
}

document.getElementById("btn-reroll").addEventListener("click", () => {
  document.getElementById("generated-name").textContent = generateUniqueName();
});

document.getElementById("btn-create-profile").addEventListener("click", () => {
  const name = document.getElementById("generated-name").textContent;
  createProfile(name);
  loginAs(name);
});

document.getElementById("btn-switch-profile").addEventListener("click", switchProfile);

// Login with existing name (typed)
document.getElementById("btn-login-existing").addEventListener("click", () => {
  const input = document.getElementById("login-name-input");
  const hint = document.getElementById("login-hint");
  const name = input.value.trim();

  if (!name) {
    hint.textContent = "Bitte gib deinen Namen ein!";
    hint.className = "login-hint error";
    return;
  }

  // Check if profile exists on this device
  const profiles = getAllProfiles();
  const exists = profiles.some((p) => p.name === name);

  if (exists) {
    loginAs(name);
  } else {
    // Create new profile with this name (new device)
    createProfile(name);
    hint.textContent = "Willkommen! Profil wurde erstellt.";
    hint.className = "login-hint success";
    loginAs(name);
  }
});

document.getElementById("login-name-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("btn-login-existing").click();
  }
});

// ============ EXPORT / IMPORT ============
function exportProfileData() {
  if (!currentProfile) return null;
  const keys = ["sterne", "xp", "stages", "mastered", "achievements", "perfect-rounds", "errors", "skill-mastery", "practice-log"];
  const data = { name: currentProfile, version: 1 };
  keys.forEach((key) => {
    const val = localStorage.getItem(profileKey(key));
    if (val !== null) data[key] = val;
  });
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function importProfileData(code) {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    if (!data.name) throw new Error("Kein Name im Code");

    // Create profile if it doesn't exist
    const profiles = getAllProfiles();
    if (!profiles.some((p) => p.name === data.name)) {
      createProfile(data.name);
    }

    // Restore data
    const keys = ["sterne", "xp", "stages", "mastered", "achievements", "perfect-rounds", "errors", "skill-mastery", "practice-log"];
    keys.forEach((key) => {
      if (data[key] !== undefined) {
        localStorage.setItem(`mathe-${data.name}-${key}`, data[key]);
      }
    });

    return data.name;
  } catch (e) {
    return null;
  }
}

document.getElementById("btn-export").addEventListener("click", () => {
  const code = exportProfileData();
  if (!code) return;

  // Show modal with code
  const modal = document.getElementById("achievements-modal");
  const grid = document.getElementById("achievements-grid");
  const header = modal.querySelector(".modal-header h2");
  header.textContent = "Fortschritt sichern";
  grid.innerHTML = `
    <div style="grid-column: 1/-1;">
      <p class="transfer-info">Kopiere diesen Code und fuege ihn auf dem anderen Geraet ein:</p>
      <textarea class="transfer-code" id="export-code" readonly>${code}</textarea>
      <div class="transfer-actions">
        <button class="btn-copy" id="btn-copy-code">Kopieren</button>
      </div>
      <p class="transfer-info" id="copy-feedback"></p>
    </div>
  `;
  modal.classList.remove("hidden");

  document.getElementById("btn-copy-code").addEventListener("click", () => {
    const textarea = document.getElementById("export-code");
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
      document.getElementById("copy-feedback").textContent = "Kopiert!";
    }).catch(() => {
      document.getElementById("copy-feedback").textContent = "Bitte manuell kopieren (Strg+C)";
    });
  });
});

document.getElementById("btn-import").addEventListener("click", () => {
  const modal = document.getElementById("achievements-modal");
  const grid = document.getElementById("achievements-grid");
  const header = modal.querySelector(".modal-header h2");
  header.textContent = "Fortschritt importieren";
  grid.innerHTML = `
    <div style="grid-column: 1/-1;">
      <p class="transfer-info">Fuege den Code vom anderen Geraet hier ein:</p>
      <textarea class="transfer-code" id="import-code" placeholder="Code hier einfuegen..."></textarea>
      <div class="transfer-actions">
        <button class="btn-import-go" id="btn-import-go">Importieren</button>
      </div>
      <p class="transfer-info" id="import-feedback"></p>
    </div>
  `;
  modal.classList.remove("hidden");

  document.getElementById("btn-import-go").addEventListener("click", () => {
    const code = document.getElementById("import-code").value;
    const name = importProfileData(code);
    if (name) {
      document.getElementById("import-feedback").textContent = `Profil "${name}" erfolgreich importiert!`;
      document.getElementById("import-feedback").style.color = "#4caf50";
      setTimeout(() => {
        modal.classList.add("hidden");
        loginAs(name);
      }, 1500);
    } else {
      document.getElementById("import-feedback").textContent = "Ungueltiger Code! Bitte pruefe die Eingabe.";
      document.getElementById("import-feedback").style.color = "#f44336";
    }
  });
});

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
let LEARNING_PATH = [
  { id: 0,  name: "Plus bis 5",       icon: "🌱", diff: "leicht", op: "plus",        passScore: 0.8 },
  { id: 1,  name: "Minus bis 5",      icon: "🍃", diff: "leicht", op: "minus",       passScore: 0.8 },
  { id: 2,  name: "Nachbarzahlen",    icon: "🏠", diff: "leicht", op: "nachbarn",    passScore: 0.8 },
  { id: 3,  name: "Gemischt bis 10",  icon: "🌻", diff: "leicht", op: "gemischt",    passScore: 0.8 },
  { id: 4,  name: "Verdoppeln",       icon: "🪞", diff: "leicht", op: "verdoppeln",  passScore: 0.8 },
  { id: 5,  name: "Plus bis 10",      icon: "🌿", diff: "mittel", op: "plus",        passScore: 0.8 },
  { id: 6,  name: "Minus bis 10",     icon: "🌲", diff: "mittel", op: "minus",       passScore: 0.8 },
  { id: 7,  name: "Vergleichen",      icon: "⚖️", diff: "leicht", op: "vergleichen", passScore: 0.8 },
  { id: 8,  name: "Gemischt bis 10",  icon: "🔥", diff: "mittel", op: "gemischt",    passScore: 0.8 },
  { id: 9,  name: "Lücken leicht",    icon: "🧩", diff: "leicht", op: "luecken",     passScore: 0.8 },
  { id: 10, name: "Zahlenreihen",     icon: "🔢", diff: "leicht", op: "reihen",      passScore: 0.8 },
  { id: 11, name: "Plus bis 20",      icon: "💪", diff: "schwer", op: "plus",        passScore: 0.8 },
  { id: 12, name: "Minus bis 20",     icon: "🧗", diff: "schwer", op: "minus",       passScore: 0.8 },
  { id: 13, name: "Gemischt bis 20",  icon: "🏔️", diff: "schwer", op: "gemischt",   passScore: 0.8 },
  { id: 14, name: "Lücken schwer",    icon: "🔮", diff: "schwer", op: "luecken",     passScore: 0.8 },
  { id: 15, name: "Zehnerzerlegung",  icon: "🎯", diff: "mittel", op: "zehner",      passScore: 0.8 },
  { id: 16, name: "Meister-Prüfung",  icon: "👑", diff: "schwer", op: "gemischt",    passScore: 0.9 },
];

// Load learning path (skilltree) from JSON (data-driven). Falls back to the hardcoded path above.
// Current format: content/<locale>/<subject>/<grade>/skilltree.json
//
// JSON schema (per skill):
// {
//   id, title, description, prerequisites, mastery: {passScore, repetitions},
//   icon?: string, difficulty?: "leicht"|"mittel"|"schwer", operation?: string
// }
//
// We still keep a tiny inference fallback so older skilltrees continue to work.
function inferStageConfigFromSkillId(skillId) {
  const id = (skillId || "").toLowerCase();

  if (id.includes("compare") || id.includes("vergleich")) return { icon: "⚖️", diff: "leicht", op: "vergleichen" };
  if (id.includes("numbers") || id.includes("zahlen")) return { icon: "🔢", diff: "leicht", op: "reihen" };

  if (id.includes("add") || id.includes("plus")) {
    const diff = id.includes("20") ? "schwer" : "leicht";
    return { icon: diff === "schwer" ? "💪" : "🌱", diff, op: "plus" };
  }

  if (id.includes("sub") || id.includes("minus")) {
    const diff = id.includes("20") ? "schwer" : "leicht";
    return { icon: diff === "schwer" ? "🧗" : "🍃", diff, op: "minus" };
  }

  return { icon: "⭐", diff: "leicht", op: "gemischt" };
}

function skilltreeToLearningPath(skilltreeJson) {
  if (!skilltreeJson || !Array.isArray(skilltreeJson.skills)) return null;

  const path = skilltreeJson.skills.map((skill, idx) => {
    const inferred = inferStageConfigFromSkillId(skill.id);

    const icon = typeof skill.icon === "string" && skill.icon.trim() ? skill.icon.trim() : inferred.icon;
    const diff = typeof skill.difficulty === "string" && skill.difficulty.trim() ? skill.difficulty.trim() : inferred.diff;
    const op = typeof skill.operation === "string" && skill.operation.trim() ? skill.operation.trim() : inferred.op;

    const passScore = skill?.mastery?.passScore ?? 0.85;
    const repetitions = skill?.mastery?.repetitions ?? 1;

    return {
      id: idx,
      skillId: skill.id,
      name: skill.title || skill.id || `Skill ${idx + 1}`,
      icon,
      diff,
      op,
      passScore,
      repetitions,
      description: skill.description || "",
      prerequisites: Array.isArray(skill.prerequisites) ? skill.prerequisites : [],
    };
  });

  return path;
}

function migrateMasteryProgressFromOldMasteredStages() {
  if (!Array.isArray(masteredStages) || masteredStages.length === 0) return;
  if (!skillMasteryProgress) skillMasteryProgress = {};

  masteredStages.forEach((stageId) => {
    const stage = LEARNING_PATH[stageId];
    if (!stage?.skillId) return;
    const reps = getRequiredRepetitions(stage);
    const passes = getSkillPasses(stage);
    if (passes < reps) {
      skillMasteryProgress[stage.skillId] = { passes: reps };
    }
  });

  saveSkillMasteryProgress();
}

function loadSkilltreeFromJson() {
  const url = "content/de/mathe/grade-1/skilltree.json";

  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`skilltree fetch failed: ${res.status}`);
      return res.json();
    })
    .then((json) => {
      const parsed = skilltreeToLearningPath(json);
      if (!parsed || parsed.length === 0) throw new Error("skilltree parse failed");

      LEARNING_PATH = parsed;

      // Clamp progress arrays if the path length changed
      unlockedStages = unlockedStages.filter((id) => id >= 0 && id < LEARNING_PATH.length);
      masteredStages = masteredStages.filter((id) => id >= 0 && id < LEARNING_PATH.length);
      if (unlockedStages.length === 0) unlockedStages = [0];

      migrateMasteryProgressFromOldMasteredStages();
      savePathProgress();
      renderLearningPath();
    })
    .catch(() => {
      // Silent fallback: app still works with the hardcoded path.
    });
}

let unlockedStages = [0];
let masteredStages = [];
let currentStage = null;
let currentMode = "lernpfad";

function savePathProgress() {
  localStorage.setItem(profileKey("stages"), JSON.stringify(unlockedStages));
  localStorage.setItem(profileKey("mastered"), JSON.stringify(masteredStages));
}

function selectStage(stageId) {
  if (!unlockedStages.includes(stageId)) return;
  const stage = LEARNING_PATH[stageId];
  currentStage = stageId;
  currentDifficulty = stage.diff;
  currentOperation = stage.op;
  renderLearningPath();

  if (currentMode === "lernpfad") {
    showExerciseView(stage);
  } else {
    generateExercises();
  }
}

function showMapView() {
  document.getElementById("learning-path").classList.remove("hidden");
  document.getElementById("exercise-area").classList.add("hidden");
  currentStage = null;
  renderLearningPath();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showExerciseView(stage) {
  document.getElementById("learning-path").classList.add("hidden");
  document.getElementById("exercise-area").classList.remove("hidden");

  const passes = stage?.skillId ? (skillMasteryProgress?.[stage.skillId]?.passes || 0) : 0;
  const reps = stage?.repetitions || 1;
  const repsText = reps > 1 ? ` • ${passes}/${reps} geschafft` : "";

  // Show stage header
  const header = document.getElementById("stage-header");
  header.innerHTML = `
    <span class="stage-header-icon">${stage.icon}</span>
    <span class="stage-header-name">Stufe ${stage.id + 1}: ${stage.name}</span>
    <span class="stage-header-goal">${Math.round(stage.passScore * 100)}% richtig${repsText}</span>
  `;

  // Show back button only in lernpfad mode
  document.getElementById("btn-back-to-map").classList.toggle("hidden", currentMode !== "lernpfad");

  generateExercises();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveSkillMasteryProgress() {
  localStorage.setItem(profileKey("skill-mastery"), JSON.stringify(skillMasteryProgress || {}));
}

function getRequiredRepetitions(stage) {
  const reps = parseInt(stage?.repetitions || 1, 10);
  return Number.isFinite(reps) && reps > 0 ? reps : 1;
}

function getSkillPasses(stage) {
  if (!stage?.skillId) return 0;
  return parseInt(skillMasteryProgress?.[stage.skillId]?.passes || 0, 10) || 0;
}

function incrementSkillPass(stage) {
  if (!stage?.skillId) return 0;
  const current = getSkillPasses(stage);
  const next = current + 1;
  if (!skillMasteryProgress) skillMasteryProgress = {};
  skillMasteryProgress[stage.skillId] = { passes: next };
  saveSkillMasteryProgress();
  return next;
}

function ensureStageMasteredIfComplete(stageId) {
  const stage = LEARNING_PATH[stageId];
  if (!stage) return false;
  const reps = getRequiredRepetitions(stage);
  const passes = getSkillPasses(stage);
  if (passes >= reps && !masteredStages.includes(stageId)) {
    masteredStages.push(stageId);
    return true;
  }
  return false;
}

function completeStage(stageId, score) {
  const stage = LEARNING_PATH[stageId];
  if (!stage) return;

  if (score < stage.passScore) return;

  const reps = getRequiredRepetitions(stage);
  const passes = incrementSkillPass(stage);

  // Master only after N successful passes
  if (passes >= reps) {
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
  } else {
    const left = Math.max(0, reps - passes);
    showToast(stage.icon, "Fast!", `${left}× noch schaffen`);
  }

  savePathProgress();
  renderLearningPath();
}

function renderLearningPath() {
  const container = document.getElementById("path-stages");
  const hint = document.getElementById("path-hint");
  if (!container) return;
  container.innerHTML = "";

  // Sync mastered stages from skill mastery progress (in case the required repetitions were met)
  let masteryChanged = false;
  for (let i = 0; i < LEARNING_PATH.length; i++) {
    if (ensureStageMasteredIfComplete(i)) masteryChanged = true;
  }
  if (masteryChanged) savePathProgress();

  // Progress overview
  const masteredCount = masteredStages.length;
  const totalCount = LEARNING_PATH.length;
  const progressPercent = Math.round((masteredCount / totalCount) * 100);

  const progressBar = document.createElement("div");
  progressBar.className = "path-progress";
  progressBar.innerHTML = `
    <span class="path-progress-text">${masteredCount}/${totalCount}</span>
    <div class="path-progress-bar">
      <div class="path-progress-fill" style="width: ${progressPercent}%"></div>
    </div>
    <span class="path-progress-text">${progressPercent}%</span>
  `;
  container.appendChild(progressBar);

  // Recommendation (weakness-based)
  const recId = pickRecommendedStageId();
  const recStage = LEARNING_PATH[recId];
  if (recStage) {
    const errs = getErrorsForStage(recStage).length;
    const mastered = masteredStages.includes(recStage.id);

    const card = document.createElement("div");
    card.className = "recommendation-card";
    card.innerHTML = `
      <div class="recommendation-title">Empfohlen heute</div>
      <div class="recommendation-body">
        <span class="recommendation-icon">${recStage.icon}</span>
        <span class="recommendation-text">
          <strong>${recStage.name}</strong>
          <span class="recommendation-meta">${mastered ? "(Wiederholung)" : ""}${errs > 0 ? ` • ${errs} Fehler offen` : ""}</span>
        </span>
      </div>
      <div class="recommendation-actions">
        <button class="recommendation-btn" data-stage="${recStage.id}">Üben</button>
      </div>
    `;

    card.querySelector(".recommendation-btn")?.addEventListener("click", () => selectStage(recStage.id));
    container.appendChild(card);
  }

  // Build winding path: groups of 1 node per row, alternating left/right
  const groupSize = 3; // Change direction every 3 nodes
  let direction = "center"; // start centered, then alternate
  let groupIndex = 0;

  LEARNING_PATH.forEach((stage, i) => {
    const unlocked = unlockedStages.includes(stage.id);
    const mastered = masteredStages.includes(stage.id);
    const active = currentStage === stage.id;

    // Determine offset direction
    const groupNum = Math.floor(i / groupSize);
    if (groupNum === 0) {
      direction = "center";
    } else if (groupNum % 2 === 1) {
      direction = "left";
    } else {
      direction = "right";
    }

    const row = document.createElement("div");
    row.className = "path-row";
    if (direction === "left") row.classList.add("offset-left");
    else if (direction === "right") row.classList.add("offset-right");

    // Stage node
    const el = document.createElement("div");
    let cls = "path-stage";
    if (active) cls += " active";
    else if (mastered) cls += " mastered";
    else if (unlocked) cls += " unlocked";
    else cls += " locked";
    el.className = cls;

    const crownHTML = mastered ? '<span class="path-crown">👑</span>' : "";

    const reps = getRequiredRepetitions(stage);
    const passes = getSkillPasses(stage);
    const repHTML = (!mastered && reps > 1)
      ? `<span class="stage-reps">${passes}/${reps}</span>`
      : "";

    el.innerHTML = `
      <div class="path-node">
        <span class="stage-icon">${stage.icon}</span>
        ${crownHTML}
      </div>
      <span class="stage-name">${stage.name}</span>
      ${repHTML}
    `;
    el.title = unlocked ? `${stage.name} — Klick zum Starten` : "Noch gesperrt";

    if (unlocked) {
      el.addEventListener("click", () => selectStage(stage.id));
    }

    row.appendChild(el);

    // Add connector line to next node (if not last)
    if (i < LEARNING_PATH.length - 1) {
      const nextMastered = masteredStages.includes(LEARNING_PATH[i + 1].id) ||
                           unlockedStages.includes(LEARNING_PATH[i + 1].id);
      const connector = document.createElement("div");
      connector.className = "path-connector";
      if (mastered && nextMastered) connector.classList.add("active-line");
      row.appendChild(connector);
    }

    container.appendChild(row);
  });

  // Scroll active stage into view
  setTimeout(() => {
    const activeNode = container.querySelector(".path-stage.active");
    if (activeNode) {
      activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);

  if (hint) {
    hint.textContent = "Tippe auf eine Stufe, um zu üben!";
  }
}

// ============ ERROR POOL (Fehler-Wiederholung) ============
let errorPool = [];

function addToErrorPool(exercise) {
  // Only store normal and luecke exercises (not zehner)
  if (exercise.type === "zehner") return;

  const stage = (currentMode === "lernpfad" && currentStage !== null && currentStage !== undefined)
    ? LEARNING_PATH[currentStage]
    : null;

  const entry = {
    type: exercise.type,
    op: exercise.type === "normal" ? exercise.op : exercise.display.op,
    a: exercise.type === "normal" ? exercise.a : (exercise.display.left || exercise.answer),
    b: exercise.type === "normal" ? exercise.b : (exercise.display.right || exercise.answer),
    answer: exercise.answer,
    timestamp: Date.now(),
    // For weakness scoring / recommendations (optional, for backward compatibility)
    stageId: stage ? stage.id : null,
    skillId: stage?.skillId || null,
  };

  // Avoid duplicates
  const isDupe = errorPool.some((e) => e.op === entry.op && e.a === entry.a && e.b === entry.b);
  if (!isDupe) {
    errorPool.push(entry);
  }
  // Keep only last 30
  if (errorPool.length > 30) errorPool = errorPool.slice(-30);
  localStorage.setItem(profileKey("errors"), JSON.stringify(errorPool));
}

function removeFromErrorPool(exercise) {
  if (exercise.type === "zehner") return;
  const op = exercise.type === "normal" ? exercise.op : exercise.display.op;
  const a = exercise.type === "normal" ? exercise.a : (exercise.display.left || exercise.answer);
  const b = exercise.type === "normal" ? exercise.b : (exercise.display.right || exercise.answer);

  // Remove across stages (a+b uniquely identifies the exercise for our purposes)
  errorPool = errorPool.filter((e) => !(e.op === op && e.a === a && e.b === b));
  localStorage.setItem(profileKey("errors"), JSON.stringify(errorPool));
}

function getErrorRepeatExercises(config, count) {
  // Find error pool entries that fit the current config
  const matching = (errorPool || []).filter((e) => {
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

// ============ WEAKNESS SCORING + RECOMMENDATIONS ============

function getErrorsForStage(stage) {
  if (!stage) return [];

  const sid = stage.id;
  const skillId = stage.skillId;

  return (errorPool || []).filter((e) => {
    // Prefer explicit stageId/skillId when available.
    if (e.stageId !== undefined && e.stageId !== null) return e.stageId === sid;
    if (e.skillId && skillId) return e.skillId === skillId;
    return false;
  });
}

function computeWeaknessScore(stage) {
  // Higher means "practice this".
  const errors = getErrorsForStage(stage);
  const errorCount = errors.length;

  const mastered = masteredStages.includes(stage.id);
  const reps = getRequiredRepetitions(stage);
  const passes = getSkillPasses(stage);
  const repsLeft = Math.max(0, reps - passes);

  // Recency: newer errors count slightly more.
  const now = Date.now();
  const recentBoost = errors.reduce((acc, e) => {
    const ageDays = (now - (e.timestamp || now)) / (1000 * 60 * 60 * 24);
    if (ageDays <= 2) return acc + 1.0;
    if (ageDays <= 7) return acc + 0.5;
    return acc + 0.2;
  }, 0);

  // Score weights tuned for "tiny" data (no server):
  // - errors dominate
  // - unfinished repetition progress nudges toward current stage
  // - mastered stages usually not recommended unless they have active errors
  let score = 0;
  score += errorCount * 3;
  score += recentBoost;
  if (!mastered) score += 0.5;
  score += repsLeft * 0.25;

  return score;
}

function pickRecommendedStageId() {
  const unlocked = Array.isArray(unlockedStages) ? unlockedStages.slice() : [0];
  const candidates = unlocked
    .map((id) => LEARNING_PATH[id])
    .filter(Boolean);

  if (candidates.length === 0) return 0;

  // If we have any stage-tagged errors, recommend based on weakness score.
  const hasTaggedErrors = (errorPool || []).some((e) => (e.stageId !== null && e.stageId !== undefined) || !!e.skillId);

  if (hasTaggedErrors) {
    const ranked = candidates
      .map((stage) => ({ id: stage.id, score: computeWeaknessScore(stage) }))
      .sort((a, b) => b.score - a.score);

    // Avoid recommending a fully mastered stage unless it actually has errors.
    for (const item of ranked) {
      const stage = LEARNING_PATH[item.id];
      const mastered = masteredStages.includes(stage.id);
      const errs = getErrorsForStage(stage).length;
      if (!mastered || errs > 0) return item.id;
    }

    return ranked[0].id;
  }

  // Fallback: first unlocked stage that isn't mastered.
  const firstNotMastered = unlocked.find((id) => !masteredStages.includes(id));
  return firstNotMastered !== undefined ? firstNotMastered : (unlocked.sort((a, b) => a - b).slice(-1)[0] ?? 0);
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
let totalStars = 0;

function saveStars() {
  localStorage.setItem(profileKey("sterne"), totalStars.toString());
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

let totalXP = 0;

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
  localStorage.setItem(profileKey("xp"), totalXP.toString());
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

let unlockedAchievements = [];
let perfectRounds = 0;

function unlockAchievement(id) {
  if (unlockedAchievements.includes(id)) return;
  unlockedAchievements.push(id);
  localStorage.setItem(profileKey("achievements"), JSON.stringify(unlockedAchievements));

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
  const header = document.querySelector("#achievements-modal .modal-header h2");
  header.textContent = "🏆 Meine Abzeichen";
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

// ============ PARENT VIEW (simple dashboard) ============
function getNextStage() {
  for (let i = 0; i < LEARNING_PATH.length; i++) {
    if (unlockedStages.includes(i) && !masteredStages.includes(i)) return LEARNING_PATH[i];
  }
  return null;
}

function formatMistake(entry) {
  if (!entry) return "";
  const op = entry.op || entry.display?.op || "";
  const a = entry.a ?? entry.display?.left;
  const b = entry.b ?? entry.display?.right;
  if (a === undefined || b === undefined || !op) return "";
  return `${a} ${op} ${b}`;
}

function renderParentView() {
  const modal = document.getElementById("achievements-modal");
  const grid = document.getElementById("achievements-grid");
  const header = modal.querySelector(".modal-header h2");

  header.textContent = "👨‍👩‍👧 Eltern-Ansicht";

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const secToday = sumPracticeSecondsSince(todayStart.getTime());
  const sec7d = sumPracticeSecondsSince(now - 7 * day);

  const masteredCount = masteredStages.length;
  const totalCount = LEARNING_PATH.length;
  const progressPercent = totalCount ? Math.round((masteredCount / totalCount) * 100) : 0;

  const strengths = masteredStages
    .slice(-5)
    .map((id) => LEARNING_PATH[id]?.name)
    .filter(Boolean)
    .reverse();

  const weaknesses = (errorPool || [])
    .slice(-10)
    .map(formatMistake)
    .filter(Boolean)
    .slice(0, 6)
    .reverse();

  const next = getNextStage();

  grid.innerHTML = `
    <div class="parent-grid" style="grid-column: 1/-1;">
      <div class="parent-card">
        <h3>⏱️ Zeit</h3>
        <div class="parent-metric"><span class="label">Heute</span><span class="value">${formatMinutes(secToday)}</span></div>
        <div class="parent-metric"><span class="label">Letzte 7 Tage</span><span class="value">${formatMinutes(sec7d)}</span></div>
      </div>

      <div class="parent-card">
        <h3>🗺️ Lernpfad</h3>
        <div class="parent-metric"><span class="label">Fortschritt</span><span class="value">${masteredCount}/${totalCount} (${progressPercent}%)</span></div>
        <div class="parent-metric"><span class="label">Nächste Stufe</span><span class="value">${next ? `${next.icon} ${next.name}` : "—"}</span></div>
      </div>

      <div class="parent-card">
        <h3>💪 Stärken (zuletzt gemeistert)</h3>
        ${strengths.length ? `<ul class="parent-list">${strengths.map((s) => `<li>${s}</li>`).join("")}</ul>` : `<div style="color:#777;font-weight:600;">Noch keine Stufe gemeistert.</div>`}
      </div>

      <div class="parent-card">
        <h3>🧠 Üben (aus Fehlern)</h3>
        <div class="parent-metric"><span class="label">Fehler-Pool</span><span class="value">${(errorPool || []).length}</span></div>
        ${weaknesses.length ? `<ul class="parent-list">${weaknesses.map((m) => `<li>${m}</li>`).join("")}</ul>` : `<div style="color:#777;font-weight:600;">Keine aktuellen Fehler gespeichert.</div>`}
      </div>

      <div class="parent-card">
        <h3>⭐ Motivation</h3>
        <div class="parent-metric"><span class="label">Sterne</span><span class="value">${totalStars}</span></div>
        <div class="parent-metric"><span class="label">XP</span><span class="value">${totalXP}</span></div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

document.getElementById("btn-parent").addEventListener("click", renderParentView);

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
  currentStage = null;
  document.getElementById("btn-mode-path").classList.add("active");
  document.getElementById("btn-mode-free").classList.remove("active");
  document.getElementById("learning-path").classList.remove("hidden");
  document.getElementById("settings-panel").classList.add("hidden");
  document.getElementById("exercise-area").classList.add("hidden");
  renderLearningPath();
});

document.getElementById("btn-mode-free").addEventListener("click", () => {
  currentMode = "frei";
  currentStage = null;
  document.getElementById("btn-mode-free").classList.add("active");
  document.getElementById("btn-mode-path").classList.remove("active");
  document.getElementById("learning-path").classList.add("hidden");
  document.getElementById("settings-panel").classList.remove("hidden");
  document.getElementById("exercise-area").classList.remove("hidden");
  document.getElementById("btn-back-to-map").classList.add("hidden");
  document.getElementById("stage-header").innerHTML = "";
});

// Back to map button
document.getElementById("btn-back-to-map").addEventListener("click", showMapView);

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
  attempts = [];
  resetStreak();
  hideAdaptiveSuggestion();
  startRoundTimer();

  if (currentOperation === "luecken") {
    generateLuecken(config);
  } else if (currentOperation === "zehner") {
    generateZehner(config);
  } else if (currentOperation === "vergleichen") {
    generateVergleichen(config);
  } else if (currentOperation === "verdoppeln") {
    generateVerdoppeln(config);
  } else if (currentOperation === "nachbarn") {
    generateNachbarn(config);
  } else if (currentOperation === "reihen") {
    generateReihen(config);
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

  // Initialize attempt counters (used for multiple-choice rescue on retry)
  attempts = new Array(exercises.length).fill(0);

  document.getElementById("actions").classList.remove("hidden");
  document.getElementById("result-summary").classList.add("hidden");
  document.getElementById("result-summary").className = "hidden";

  const checkBtn = document.getElementById("btn-check");
  checkBtn.textContent = "Antworten prüfen";
  checkBtn.disabled = false;

  checkAchievements();
}


// ============ MULTIPLE-CHOICE RESCUE (attempt 2) ============

function isRescueSupported(ex) {
  // Only numeric single-answer types for now
  return ex && (ex.type === "normal" || ex.type === "luecke" || ex.type === "verdoppeln" || ex.type === "reihen");
}

function buildRescueChoices(correct, config) {
  // Build 3 choices: 1 correct + 2 plausible distractors
  const max = Math.max(5, config?.maxResult ?? 20);
  const choices = new Set([correct]);

  // Prefer small deltas (kid-friendly)
  const deltas = [1, 2, 3, 4, 5];
  while (choices.size < 3) {
    const delta = pickRandom(deltas);
    const sign = Math.random() < 0.5 ? -1 : 1;
    let cand = correct + sign * delta;
    if (cand < 0) cand = correct + delta;
    if (cand > max) cand = correct - delta;
    if (cand < 0) cand = 0;
    if (cand > max) cand = max;
    choices.add(cand);
  }

  // Shuffle
  const arr = Array.from(choices);
  shuffleArray(arr);
  return arr;
}

function attachRescueChoices(exerciseIndex) {
  const ex = exercises[exerciseIndex];
  if (!isRescueSupported(ex)) return;

  const div = document.querySelector(`.exercise[data-index="${exerciseIndex}"]`);
  if (!div) return;

  // Don't duplicate
  if (div.querySelector(".mc-rescue")) return;

  const input = document.getElementById(`answer-${exerciseIndex}`);
  if (!input) return;

  const config = DIFFICULTY[currentDifficulty];
  const choices = buildRescueChoices(ex.answer, config);

  const wrap = document.createElement("div");
  wrap.className = "mc-rescue";
  wrap.innerHTML = `<span class="mc-rescue-label">Hilfe:</span>`;

  const btnRow = document.createElement("div");
  btnRow.className = "mc-rescue-buttons";

  choices.forEach((val) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mc-rescue-btn";
    btn.textContent = val;
    btn.addEventListener("click", () => {
      btnRow.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      input.value = String(val);
      input.focus();
    });
    btnRow.appendChild(btn);
  });

  wrap.appendChild(btnRow);
  div.appendChild(wrap);
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

// ============ NEW EXERCISE TYPES ============

function generateVergleichen(config) {
  for (let i = 0; i < config.count; i++) {
    // Generate two expressions and compare them
    const op1 = Math.random() < 0.5 ? "+" : "-";
    const op2 = Math.random() < 0.5 ? "+" : "-";
    let a1, b1, a2, b2;

    if (op1 === "+") {
      a1 = randomInt(1, config.maxNumber);
      b1 = randomInt(0, Math.min(config.maxNumber, config.maxResult - a1));
    } else {
      a1 = randomInt(2, config.maxResult);
      b1 = randomInt(0, Math.min(config.maxNumber, a1));
    }

    if (op2 === "+") {
      a2 = randomInt(1, config.maxNumber);
      b2 = randomInt(0, Math.min(config.maxNumber, config.maxResult - a2));
    } else {
      a2 = randomInt(2, config.maxResult);
      b2 = randomInt(0, Math.min(config.maxNumber, a2));
    }

    const result1 = op1 === "+" ? a1 + b1 : a1 - b1;
    const result2 = op2 === "+" ? a2 + b2 : a2 - b2;

    let answer;
    if (result1 > result2) answer = ">";
    else if (result1 < result2) answer = "<";
    else answer = "=";

    exercises.push({
      type: "vergleichen",
      left: { a: a1, op: op1, b: b1, result: result1 },
      right: { a: a2, op: op2, b: b2, result: result2 },
      answer,
    });
  }
}

function generateVerdoppeln(config) {
  for (let i = 0; i < config.count; i++) {
    const isDoppelt = Math.random() < 0.5;
    if (isDoppelt) {
      const num = randomInt(1, Math.floor(config.maxResult / 2));
      exercises.push({
        type: "verdoppeln",
        mode: "doppelt",
        num,
        answer: num * 2,
      });
    } else {
      const half = randomInt(1, Math.floor(config.maxResult / 2));
      const num = half * 2; // ensure even number
      exercises.push({
        type: "verdoppeln",
        mode: "halb",
        num,
        answer: half,
      });
    }
  }
}

function generateNachbarn(config) {
  for (let i = 0; i < config.count; i++) {
    const num = randomInt(1, config.maxResult - 1);
    exercises.push({
      type: "nachbarn",
      num,
      answerBefore: num - 1,
      answerAfter: num + 1,
    });
  }
}

function generateReihen(config) {
  // Patterns: +1, +2, +3, +5, +10, *2
  const patterns = [
    { step: 1, name: "+1" },
    { step: 2, name: "+2" },
    { step: 3, name: "+3" },
    { step: 5, name: "+5" },
  ];
  if (config.maxResult >= 20) {
    patterns.push({ step: 10, name: "+10" });
  }

  for (let i = 0; i < config.count; i++) {
    const pattern = pickRandom(patterns);
    const maxStart = Math.max(1, config.maxResult - pattern.step * 5);
    const start = randomInt(0, maxStart);
    const sequence = [];
    for (let j = 0; j < 5; j++) {
      sequence.push(start + j * pattern.step);
    }
    const answer = start + 5 * pattern.step;

    exercises.push({
      type: "reihen",
      sequence,
      answer,
      step: pattern.step,
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
    } else if (ex.type === "vergleichen") {
      const leftStr = `${ex.left.a} ${ex.left.op} ${ex.left.b}`;
      const rightStr = `${ex.right.a} ${ex.right.op} ${ex.right.b}`;
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">${leftStr}</span>
        <div class="compare-buttons" id="compare-${i}">
          <button data-value="<">&lt;</button>
          <button data-value="=">=</button>
          <button data-value=">">&gt;</button>
        </div>
        <span class="task">${rightStr}</span>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "verdoppeln") {
      const label = ex.mode === "doppelt" ? "Doppelt" : "Halb";
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">${label}: ${ex.num} =</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" autocomplete="off">
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "nachbarn") {
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}-a" class="inline-input" autocomplete="off">
          _ <strong>${ex.num}</strong> _
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}-b" class="inline-input" autocomplete="off">
        </span>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "reihen") {
      const seqStr = ex.sequence.join(", ");
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <span class="task">${seqStr}, </span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" autocomplete="off">
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

  // Vergleichen button listeners
  container.querySelectorAll(".compare-buttons").forEach((group) => {
    group.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
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
          <button class="suggest-btn suggest-btn-secondary" onclick="showMapView()">Zur Karte</button>
        `;
        el.classList.remove("hidden");
        return;
      } else {
        el.className = "adaptive-suggestion suggest-up";
        el.innerHTML = `
          Gut gemacht! Stufe geschafft!
          <br><button class="suggest-btn" onclick="showMapView()">Zurück zur Karte</button>
        `;
        el.classList.remove("hidden");
        return;
      }
    } else {
      el.className = "adaptive-suggestion suggest-stay";
      el.innerHTML = `
        Du brauchst ${Math.round(stage.passScore * 100)}% richtig zum Weiterkommen. Versuche es nochmal!
        <br><button class="suggest-btn suggest-btn-secondary" onclick="showMapView()">Zur Karte</button>
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

// ============ PRACTICE LOG (time spent) ============
let roundStartAt = null;
let roundContext = { mode: null, skillId: null };

function savePracticeLog() {
  localStorage.setItem(profileKey("practice-log"), JSON.stringify(practiceLog || []));
}

function startRoundTimer() {
  roundStartAt = Date.now();
  roundContext = {
    mode: currentMode,
    skillId: (currentMode === "lernpfad" && currentStage !== null) ? (LEARNING_PATH?.[currentStage]?.skillId || null) : null,
  };
}

function logRoundIfNeeded(correct, total) {
  if (!roundStartAt) return;

  let durationSec = Math.round((Date.now() - roundStartAt) / 1000);
  // Keep this robust against tab sleeps / weird values
  durationSec = Math.max(5, Math.min(durationSec, 60 * 30));

  const entry = {
    ts: Date.now(),
    durationSec,
    correct: Number.isFinite(correct) ? correct : 0,
    total: Number.isFinite(total) ? total : 0,
    mode: roundContext?.mode || currentMode,
    skillId: roundContext?.skillId || null,
  };

  if (!Array.isArray(practiceLog)) practiceLog = [];
  practiceLog.push(entry);
  // keep last ~200 sessions
  if (practiceLog.length > 200) practiceLog = practiceLog.slice(-200);
  savePracticeLog();

  roundStartAt = null;
  roundContext = { mode: null, skillId: null };
}

function sumPracticeSecondsSince(sinceTs) {
  if (!Array.isArray(practiceLog) || practiceLog.length === 0) return 0;
  return practiceLog
    .filter((e) => (e?.ts || 0) >= sinceTs)
    .reduce((acc, e) => acc + (parseInt(e?.durationSec || 0, 10) || 0), 0);
}

function formatMinutes(sec) {
  const m = Math.round(sec / 60);
  if (m <= 0) return "0 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
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

    if (ex.type === "normal" || ex.type === "luecke" || ex.type === "verdoppeln" || ex.type === "reihen") {
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
    } else if (ex.type === "vergleichen") {
      const group = document.getElementById(`compare-${i}`);
      const selected = group.querySelector(".selected");

      if (!selected) {
        div.className = "exercise retry";
        feedback.textContent = "?";
        wrongCount++;
        hadWrong = true;
        return;
      }

      const val = selected.dataset.value;
      isCorrect = val === ex.answer;

      if (isCorrect) {
        selected.classList.add("correct-btn");
        group.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      } else {
        selected.classList.add("wrong-btn");
      }
    } else if (ex.type === "nachbarn") {
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
      isCorrect = !isNaN(numA) && !isNaN(numB) && numA === ex.answerBefore && numB === ex.answerAfter;

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
      // Attempt tracking for retry UX
      const supportsRescue = isRescueSupported(ex);
      const hasAnswerInput = supportsRescue && document.getElementById(`answer-${i}`)?.value.trim() !== "";

      if (supportsRescue && attempts[i] === 0 && hasAnswerInput) {
        // 1st wrong attempt: give a multiple-choice rescue for attempt 2
        attempts[i] = 1;
        div.className = "exercise retry";
        feedback.textContent = "Nochmal!";
        wrongCount++;
        hadWrong = true;
        soundWrong();
        attachRescueChoices(i);
      } else {
        // 2nd wrong (or non-supported types): show solution hint as before
        if (supportsRescue && attempts[i] === 1 && hasAnswerInput) attempts[i] = 2;

        div.className = "exercise wrong";
        // Show correct answer next to "falsch"
        let correctText = "";
        if (ex.type === "normal" || ex.type === "luecke" || ex.type === "verdoppeln" || ex.type === "reihen") {
          correctText = ` → ${ex.answer}`;
        } else if (ex.type === "zehner") {
          const exampleA = Math.floor(ex.target / 2);
          const exampleB = ex.target - exampleA;
          correctText = ` → z.B. ${exampleA}+${exampleB}`;
        } else if (ex.type === "vergleichen") {
          correctText = ` → ${ex.answer}`;
        } else if (ex.type === "nachbarn") {
          correctText = ` → ${ex.answerBefore}, ${ex.answerAfter}`;
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
    localStorage.setItem(profileKey("perfect-rounds"), perfectRounds.toString());
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

  // Log time spent once per round (first check click)
  if (!checked) {
    logRoundIfNeeded(correctCount, exercises.length);
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
function initApp() {
  renderStars();
  renderLevel();
  renderStreak();
  renderLearningPath();

  // Try to load a data-driven skilltree (non-blocking)
  loadSkilltreeFromJson();

  // Show map view initially (don't auto-start exercises)
  document.getElementById("learning-path").classList.remove("hidden");
  document.getElementById("exercise-area").classList.add("hidden");
}

// Check for auto-login (last used profile)
(function () {
  const lastProfile = localStorage.getItem("mathe-last-profile");
  const profiles = getAllProfiles();
  if (lastProfile && profiles.some((p) => p.name === lastProfile)) {
    loginAs(lastProfile);
  } else {
    showLoginScreen();
  }
})();
