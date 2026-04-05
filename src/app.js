// ============ APP ENTRY POINT ============
import { state, events } from "./state.js";
import { autoLogin, showLoginScreen, generateUniqueName, createProfile, loginAs, switchProfile, exportProfileData, importProfileData } from "./accounts.js";
import { renderStars, renderLevel, renderStreak, renderAchievements, resetStreak, checkAchievements } from "./gamification.js";
import { generateExercises } from "./exercises.js";
import { loadSkilltreeFromJson } from "./learning-path.js";
import { renderLearningPath, renderExercises, renderParentView, showToast, hideAdaptiveSuggestion, setCallbacks } from "./ui.js";
import { checkAnswers } from "./checker.js";
import { launchConfetti } from "./effects.js";
import { startRoundTimer } from "./practice-log.js";

// ============ NAVIGATION ============

function selectStage(stageId) {
  if (!state.unlockedStages.includes(stageId)) return;
  const stage = state.LEARNING_PATH[stageId];
  state.currentStage = stageId;
  state.currentDifficulty = stage.diff;
  state.currentOperation = stage.op;
  renderLearningPath();

  if (state.currentMode === "lernpfad") {
    showExerciseView(stage);
  } else {
    doGenerateExercises();
  }
}

function showMapView() {
  document.getElementById("learning-path").classList.remove("hidden");
  document.getElementById("exercise-area").classList.add("hidden");
  state.currentStage = null;
  renderLearningPath();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showExerciseView(stage) {
  document.getElementById("learning-path").classList.add("hidden");
  document.getElementById("exercise-area").classList.remove("hidden");

  const passes = stage?.skillId ? (state.skillMasteryProgress?.[stage.skillId]?.passes || 0) : 0;
  const reps = stage?.repetitions || 1;
  const repsText = reps > 1 ? ` • ${passes}/${reps} geschafft` : "";

  const header = document.getElementById("stage-header");
  header.innerHTML = `
    <span class="stage-header-icon">${stage.icon}</span>
    <span class="stage-header-name">Stufe ${stage.id + 1}: ${stage.name}</span>
    <span class="stage-header-goal">${Math.round(stage.passScore * 100)}% richtig${repsText}</span>
  `;

  document.getElementById("btn-back-to-map").classList.toggle("hidden", state.currentMode !== "lernpfad");

  doGenerateExercises();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function doGenerateExercises() {
  resetStreak();
  hideAdaptiveSuggestion();
  startRoundTimer();
  generateExercises();
  renderExercises();

  document.getElementById("actions").classList.remove("hidden");
  document.getElementById("result-summary").classList.add("hidden");
  document.getElementById("result-summary").className = "hidden";

  const checkBtn = document.getElementById("btn-check");
  checkBtn.textContent = "Antworten prüfen";
  checkBtn.disabled = false;

  checkAchievements();
}

// ============ INIT ============

function initApp() {
  renderStars();
  renderLevel();
  renderStreak();
  renderLearningPath();

  loadSkilltreeFromJson();

  document.getElementById("learning-path").classList.remove("hidden");
  document.getElementById("exercise-area").classList.add("hidden");
}

// ============ EVENT BUS WIRING ============

events.on("init-app", initApp);
events.on("toast", showToast);
events.on("confetti", launchConfetti);
events.on("render-learning-path", renderLearningPath);

// Wire UI callbacks (breaks circular dependency)
setCallbacks({ selectStage, showMapView, checkAnswers });

// Make selectStage available globally for any inline onclick usage
window.selectStage = selectStage;
window.showMapView = showMapView;

// ============ EVENT LISTENERS ============

// Profile buttons
document.getElementById("btn-reroll").addEventListener("click", () => {
  document.getElementById("generated-name").textContent = generateUniqueName();
});

document.getElementById("btn-create-profile").addEventListener("click", () => {
  const name = document.getElementById("generated-name").textContent;
  createProfile(name);
  loginAs(name);
});

document.getElementById("btn-switch-profile").addEventListener("click", switchProfile);

document.getElementById("btn-login-existing").addEventListener("click", () => {
  const input = document.getElementById("login-name-input");
  const hint = document.getElementById("login-hint");
  const name = input.value.trim();

  if (!name) {
    hint.textContent = "Bitte gib deinen Namen ein!";
    hint.className = "login-hint error";
    return;
  }

  const profiles = JSON.parse(localStorage.getItem("mathe-profiles") || "[]");
  const exists = profiles.some((p) => p.name === name);

  if (exists) {
    loginAs(name);
  } else {
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

// Export / Import
document.getElementById("btn-export").addEventListener("click", () => {
  const code = exportProfileData();
  if (!code) return;

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

// Achievements modal
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

// Parent view
document.getElementById("btn-parent").addEventListener("click", renderParentView);

// Subject toggle
document.querySelectorAll(".btn-subject").forEach((btn) => {
  btn.addEventListener("click", () => {
    const subject = btn.dataset.subject;
    if (subject === state.currentSubject) return;
    document.querySelectorAll(".btn-subject").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.currentSubject = subject;
    loadSkilltreeFromJson(state.currentGrade, subject);
    showMapView();
  });
});

// Grade toggle
document.querySelectorAll(".btn-grade").forEach((btn) => {
  btn.addEventListener("click", () => {
    const grade = btn.dataset.grade;
    if (grade === state.currentGrade) return;
    document.querySelectorAll(".btn-grade").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadSkilltreeFromJson(grade);
    showMapView();
  });
});

// Mode toggle
document.getElementById("btn-mode-path").addEventListener("click", () => {
  state.currentMode = "lernpfad";
  state.currentStage = null;
  document.getElementById("btn-mode-path").classList.add("active");
  document.getElementById("btn-mode-free").classList.remove("active");
  document.getElementById("learning-path").classList.remove("hidden");
  document.getElementById("settings-panel").classList.add("hidden");
  document.getElementById("exercise-area").classList.add("hidden");
  renderLearningPath();
});

document.getElementById("btn-mode-free").addEventListener("click", () => {
  state.currentMode = "frei";
  state.currentStage = null;
  document.getElementById("btn-mode-free").classList.add("active");
  document.getElementById("btn-mode-path").classList.remove("active");
  document.getElementById("learning-path").classList.add("hidden");
  document.getElementById("settings-panel").classList.remove("hidden");
  document.getElementById("exercise-area").classList.remove("hidden");
  document.getElementById("btn-back-to-map").classList.add("hidden");
  document.getElementById("stage-header").innerHTML = "";
});

// Back to map
document.getElementById("btn-back-to-map").addEventListener("click", showMapView);

// Settings buttons
document.querySelectorAll("#difficulty .btn-setting").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#difficulty .btn-setting").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.currentDifficulty = btn.dataset.value;
  });
});

document.querySelectorAll("#operation .btn-setting").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#operation .btn-setting").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.currentOperation = btn.dataset.value;
  });
});

// Exercise buttons
document.getElementById("btn-generate").addEventListener("click", doGenerateExercises);
document.getElementById("btn-check").addEventListener("click", checkAnswers);

// ============ AUTO-LOGIN ============
autoLogin();
