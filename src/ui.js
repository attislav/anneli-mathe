// ============ UI RENDERING ============
import { state, DIFFICULTY } from "./state.js";
import { savePathProgress } from "./storage.js";
import { getRequiredRepetitions, getSkillPasses, ensureStageMasteredIfComplete } from "./learning-path.js";
import { getErrorsForStage, pickRecommendedStageId } from "./error-pool.js";
import { sumPracticeSecondsSince, formatMinutes } from "./practice-log.js";

// selectStage callback — set by app.js to avoid circular deps
let _selectStage = null;
let _showMapView = null;
let _checkAnswers = null;

export function setCallbacks({ selectStage, showMapView, checkAnswers }) {
  _selectStage = selectStage;
  _showMapView = showMapView;
  _checkAnswers = checkAnswers;
}

// ============ TOAST NOTIFICATION ============

export function showToast(icon, title, name) {
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

// ============ LEARNING PATH RENDERING ============

export function renderLearningPath() {
  const container = document.getElementById("path-stages");
  const hint = document.getElementById("path-hint");
  if (!container) return;
  container.innerHTML = "";

  // Sync mastered stages
  let masteryChanged = false;
  for (let i = 0; i < state.LEARNING_PATH.length; i++) {
    if (ensureStageMasteredIfComplete(i)) masteryChanged = true;
  }
  if (masteryChanged) savePathProgress();

  // Progress overview
  const masteredCount = state.masteredStages.length;
  const totalCount = state.LEARNING_PATH.length;
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

  // Recommendation
  const recId = pickRecommendedStageId();
  const recStage = state.LEARNING_PATH[recId];
  if (recStage) {
    const errs = getErrorsForStage(recStage).length;
    const mastered = state.masteredStages.includes(recStage.id);

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

    card.querySelector(".recommendation-btn")?.addEventListener("click", () => _selectStage?.(recStage.id));
    container.appendChild(card);
  }

  // Build winding path
  const groupSize = 3;

  state.LEARNING_PATH.forEach((stage, i) => {
    const unlocked = state.unlockedStages.includes(stage.id);
    const mastered = state.masteredStages.includes(stage.id);
    const active = state.currentStage === stage.id;

    const groupNum = Math.floor(i / groupSize);
    let direction;
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
      el.addEventListener("click", () => _selectStage?.(stage.id));
    }

    row.appendChild(el);

    if (i < state.LEARNING_PATH.length - 1) {
      const nextMastered = state.masteredStages.includes(state.LEARNING_PATH[i + 1].id) ||
                           state.unlockedStages.includes(state.LEARNING_PATH[i + 1].id);
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

// ============ EXERCISE RENDERING ============

export function renderExercises() {
  const container = document.getElementById("exercises");
  container.innerHTML = "";

  state.exercises.forEach((ex, i) => {
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
    } else if (ex.type === "textaufgabe") {
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <div class="word-problem">
          <p class="word-problem-text">${ex.text}</p>
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" autocomplete="off">
        </div>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "uhrzeit") {
      const h = ex.hour;
      const m = ex.minute;
      // Simple clock face using CSS
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <div class="clock-exercise">
          <div class="clock-face" data-hour="${h}" data-minute="${m}">
            <div class="clock-display">${ex.displayText}</div>
          </div>
          <p class="clock-prompt">Wie spät ist es?</p>
          <input type="text" id="answer-${i}" placeholder="z.B. 3 uhr" autocomplete="off">
        </div>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "geld") {
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <div class="geld-exercise">
          <p class="geld-text">${ex.text}</p>
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-${i}" autocomplete="off">
          <span class="geld-unit">${ex.unit === "cent" ? "Cent" : "€"}</span>
        </div>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "lesen") {
      div.className = "exercise reading-exercise";
      div.innerHTML = `
        <div class="reading-passage">
          <h3 class="reading-title">${ex.title}</h3>
          <p class="reading-text">${ex.passage}</p>
        </div>
        <div class="reading-questions">
          ${ex.questions.map((q, qi) => `
            <div class="reading-question" data-qi="${qi}">
              <p class="reading-prompt">${qi + 1}. ${q.prompt}</p>
              <div class="mc-choices" id="mc-${i}-${qi}">
                ${q.choices.map((c, ci) => `<button class="mc-choice" data-ci="${ci}">${c}</button>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "thema") {
      div.className = "exercise topic-exercise";
      div.innerHTML = `
        <div class="topic-card-content">
          <h3 class="topic-title">${ex.title}</h3>
          <p class="topic-text">${ex.card}</p>
          <ul class="topic-facts">${ex.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
        </div>
        <div class="topic-questions">
          ${ex.questions.map((q, qi) => `
            <div class="reading-question" data-qi="${qi}">
              <p class="reading-prompt">${qi + 1}. ${q.prompt}</p>
              <div class="mc-choices" id="mc-${i}-${qi}">
                ${q.choices.map((c, ci) => `<button class="mc-choice" data-ci="${ci}">${c}</button>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "rechtschreibung") {
      div.className = "exercise deutsch-exercise";
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <div class="rechtschreibung-exercise">
          <p class="rechtschreibung-prompt">${ex.prompt}</p>
          <div class="mc-choices" id="mc-${i}-0">
            ${ex.choices.map((c, ci) => `<button class="mc-choice" data-ci="${ci}">${c}</button>`).join("")}
          </div>
          ${ex.hint ? `<p class="rechtschreibung-hint">${ex.hint}</p>` : ""}
        </div>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "lueckentext") {
      div.className = "exercise deutsch-exercise";
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <div class="lueckentext-exercise">
          <p class="lueckentext-sentence">${ex.sentence}</p>
          <div class="mc-choices" id="mc-${i}-0">
            ${ex.choices.map((c, ci) => `<button class="mc-choice" data-ci="${ci}">${c}</button>`).join("")}
          </div>
        </div>
        <span class="feedback" id="feedback-${i}"></span>
      `;
    } else if (ex.type === "silben") {
      const choiceButtons = [1, 2, 3, 4].map((n) =>
        `<button class="mc-choice silben-choice" data-ci="${n}">${n}</button>`
      ).join("");
      div.className = "exercise deutsch-exercise";
      div.innerHTML = `
        <span class="number">${i + 1}.</span>
        <div class="silben-exercise">
          <p class="silben-word">${ex.word}</p>
          <p class="silben-prompt">Wie viele Silben hat das Wort? 👏</p>
          <div class="mc-choices" id="mc-${i}-0">
            ${choiceButtons}
          </div>
        </div>
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
          _checkAnswers?.();
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

  // MC choice listeners (lesen / thema)
  container.querySelectorAll(".mc-choices").forEach((group) => {
    group.querySelectorAll(".mc-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".mc-choice").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });
  });
}

// ============ ADAPTIVE SUGGESTIONS ============

export function showAdaptiveSuggestion(correctCount, total) {
  const el = document.getElementById("adaptive-suggestion");
  if (!el) return;

  const percent = correctCount / total;

  if (state.currentMode === "lernpfad" && state.currentStage !== null) {
    const stage = state.LEARNING_PATH[state.currentStage];
    if (percent >= stage.passScore) {
      const nextId = state.currentStage + 1;
      if (nextId < state.LEARNING_PATH.length && state.unlockedStages.includes(nextId)) {
        const next = state.LEARNING_PATH[nextId];
        el.className = "adaptive-suggestion suggest-up";
        el.innerHTML = `
          ${next.icon} Gut gemacht! Du hast die Stufe geschafft! Bereit für <strong>${next.name}</strong>?
          <br><button class="suggest-btn" id="suggest-next-stage">Weiter zur nächsten Stufe!</button>
          <button class="suggest-btn suggest-btn-secondary" id="suggest-show-map">Zur Karte</button>
        `;
        el.classList.remove("hidden");
        el.querySelector("#suggest-next-stage")?.addEventListener("click", () => _selectStage?.(nextId));
        el.querySelector("#suggest-show-map")?.addEventListener("click", () => _showMapView?.());
        return;
      } else {
        el.className = "adaptive-suggestion suggest-up";
        el.innerHTML = `
          Gut gemacht! Stufe geschafft!
          <br><button class="suggest-btn" id="suggest-show-map-2">Zurück zur Karte</button>
        `;
        el.classList.remove("hidden");
        el.querySelector("#suggest-show-map-2")?.addEventListener("click", () => _showMapView?.());
        return;
      }
    } else {
      el.className = "adaptive-suggestion suggest-stay";
      el.innerHTML = `
        Du brauchst ${Math.round(stage.passScore * 100)}% richtig zum Weiterkommen. Versuche es nochmal!
        <br><button class="suggest-btn suggest-btn-secondary" id="suggest-show-map-3">Zur Karte</button>
      `;
      el.classList.remove("hidden");
      el.querySelector("#suggest-show-map-3")?.addEventListener("click", () => _showMapView?.());
      return;
    }
  }

  // Free mode suggestions
  if (state.currentMode === "frei" && percent >= 0.9) {
    const diffOrder = ["leicht", "mittel", "schwer"];
    const currentIdx = diffOrder.indexOf(state.currentDifficulty);
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

export function hideAdaptiveSuggestion() {
  const el = document.getElementById("adaptive-suggestion");
  if (el) el.classList.add("hidden");
}

// ============ PARENT VIEW ============

function getNextStage() {
  for (let i = 0; i < state.LEARNING_PATH.length; i++) {
    if (state.unlockedStages.includes(i) && !state.masteredStages.includes(i)) return state.LEARNING_PATH[i];
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

export function renderParentView() {
  const modal = document.getElementById("achievements-modal");
  const grid = document.getElementById("achievements-grid");
  const header = modal.querySelector(".modal-header h2");

  header.textContent = "👨‍👩‍👧 Eltern-Ansicht";

  const subjectLabels = { mathe: "🔢 Mathe", deutsch: "📖 Deutsch", sachkunde: "🌍 Sachkunde" };
  const currentLabel = subjectLabels[state.currentSubject] || state.currentSubject;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const secToday = sumPracticeSecondsSince(todayStart.getTime());
  const sec7d = sumPracticeSecondsSince(now - 7 * day);

  const masteredCount = state.masteredStages.length;
  const totalCount = state.LEARNING_PATH.length;
  const progressPercent = totalCount ? Math.round((masteredCount / totalCount) * 100) : 0;

  const strengths = state.masteredStages
    .slice(-5)
    .map((id) => state.LEARNING_PATH[id]?.name)
    .filter(Boolean)
    .reverse();

  const weaknesses = (state.errorPool || [])
    .slice(-10)
    .map(formatMistake)
    .filter(Boolean)
    .slice(0, 6)
    .reverse();

  const next = getNextStage();

  grid.innerHTML = `
    <div class="parent-grid" style="grid-column: 1/-1;">
      <div class="parent-card parent-card-subject">
        <h3>${currentLabel}</h3>
        <div class="parent-metric"><span class="label">Aktuelles Fach</span></div>
      </div>

      <div class="parent-card">
        <h3>⏱️ Zeit</h3>
        <div class="parent-metric"><span class="label">Heute</span><span class="value">${formatMinutes(secToday)}</span></div>
        <div class="parent-metric"><span class="label">Letzte 7 Tage</span><span class="value">${formatMinutes(sec7d)}</span></div>
      </div>

      <div class="parent-card">
        <h3>🗺️ Lernpfad (${currentLabel})</h3>
        <div class="parent-metric"><span class="label">Fortschritt</span><span class="value">${masteredCount}/${totalCount} (${progressPercent}%)</span></div>
        <div class="parent-metric"><span class="label">Nächste Stufe</span><span class="value">${next ? `${next.icon} ${next.name}` : "—"}</span></div>
      </div>

      <div class="parent-card">
        <h3>💪 Stärken (zuletzt gemeistert)</h3>
        ${strengths.length ? `<ul class="parent-list">${strengths.map((s) => `<li>${s}</li>`).join("")}</ul>` : `<div style="color:#777;font-weight:600;">Noch keine Stufe gemeistert.</div>`}
      </div>

      <div class="parent-card">
        <h3>🧠 Üben (aus Fehlern)</h3>
        <div class="parent-metric"><span class="label">Fehler-Pool</span><span class="value">${(state.errorPool || []).length}</span></div>
        ${weaknesses.length ? `<ul class="parent-list">${weaknesses.map((m) => `<li>${m}</li>`).join("")}</ul>` : `<div style="color:#777;font-weight:600;">Keine aktuellen Fehler gespeichert.</div>`}
      </div>

      <div class="parent-card">
        <h3>⭐ Motivation</h3>
        <div class="parent-metric"><span class="label">Sterne</span><span class="value">${state.totalStars}</span></div>
        <div class="parent-metric"><span class="label">XP</span><span class="value">${state.totalXP}</span></div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}
