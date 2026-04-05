// ============ ANSWER CHECKING ============
import { state, DIFFICULTY } from "./state.js";
import { profileKey, safeSave } from "./storage.js";
import { incrementStreak, breakStreak, getStreakMultiplier, addStars, addXP, checkAchievements } from "./gamification.js";
import { soundCorrect, soundWrong, soundPerfect } from "./audio.js";
import { addToErrorPool, removeFromErrorPool } from "./error-pool.js";
import { isRescueSupported, buildRescueChoices, shuffleArray } from "./exercises.js";
import { completeStage } from "./learning-path.js";
import { showAdaptiveSuggestion } from "./ui.js";
import { showNumberLineHelp } from "./effects.js";
import { launchConfetti } from "./effects.js";
import { logRoundIfNeeded } from "./practice-log.js";

function attachRescueChoices(exerciseIndex) {
  const ex = state.exercises[exerciseIndex];
  if (!isRescueSupported(ex)) return;

  const div = document.querySelector(`.exercise[data-index="${exerciseIndex}"]`);
  if (!div) return;

  if (div.querySelector(".mc-rescue")) return;

  const input = document.getElementById(`answer-${exerciseIndex}`);
  if (!input) return;

  const config = DIFFICULTY[state.currentDifficulty];
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

export function checkAnswers() {
  let correctCount = 0;
  let newCorrect = 0;
  let wrongCount = 0;
  let hadWrong = false;

  state.exercises.forEach((ex, i) => {
    const div = document.querySelector(`.exercise[data-index="${i}"]`);
    const feedback = document.getElementById(`feedback-${i}`);

    if (div.classList.contains("correct")) {
      correctCount++;
      return;
    }

    let isCorrect = false;

    if (ex.type === "normal" || ex.type === "luecke" || ex.type === "verdoppeln" || ex.type === "reihen" || ex.type === "textaufgabe" || ex.type === "geld") {
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
    } else if (ex.type === "uhrzeit") {
      const input = document.getElementById(`answer-${i}`);
      const val = input.value.trim().toLowerCase();

      if (val === "") {
        div.className = "exercise retry";
        feedback.textContent = "?";
        wrongCount++;
        hadWrong = true;
        return;
      }

      isCorrect = val === ex.answer || val === ex.displayText;

      if (isCorrect) {
        input.readOnly = true;
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
    } else if (ex.type === "rechtschreibung" || ex.type === "lueckentext" || ex.type === "silben") {
      const group = document.getElementById(`mc-${i}-0`);
      const selected = group?.querySelector(".mc-choice.selected");

      if (!selected) {
        div.className = "exercise deutsch-exercise retry";
        feedback.textContent = "Bitte wähle eine Antwort!";
        wrongCount++;
        hadWrong = true;
        return;
      }

      const ci = parseInt(selected.dataset.ci, 10);
      if (ex.type === "silben") {
        isCorrect = ci === ex.count;
      } else {
        isCorrect = ci === ex.answerIndex;
      }

      if (isCorrect) {
        selected.classList.add("mc-correct");
        group.querySelectorAll(".mc-choice").forEach((b) => { b.disabled = true; });
      } else {
        selected.classList.add("mc-wrong");
        if (ex.type === "silben") {
          group.querySelectorAll(".mc-choice").forEach((b) => {
            if (parseInt(b.dataset.ci, 10) === ex.count) b.classList.add("mc-correct");
            b.disabled = true;
          });
        } else {
          const correctBtn = group.querySelectorAll(".mc-choice")[ex.answerIndex];
          if (correctBtn) correctBtn.classList.add("mc-correct");
          group.querySelectorAll(".mc-choice").forEach((b) => { b.disabled = true; });
        }
      }
    } else if (ex.type === "lesen" || ex.type === "thema") {
      let allAnswered = true;
      let qCorrect = 0;

      ex.questions.forEach((q, qi) => {
        const group = document.getElementById(`mc-${i}-${qi}`);
        const selected = group?.querySelector(".mc-choice.selected");
        if (!selected) {
          allAnswered = false;
          return;
        }
        const ci = parseInt(selected.dataset.ci, 10);
        if (ci === q.answerIndex) {
          qCorrect++;
          selected.classList.add("mc-correct");
        } else {
          selected.classList.add("mc-wrong");
          const correctBtn = group.querySelectorAll(".mc-choice")[q.answerIndex];
          if (correctBtn) correctBtn.classList.add("mc-correct");
        }
        group.querySelectorAll(".mc-choice").forEach((b) => { b.disabled = true; });
      });

      if (!allAnswered) {
        div.className = `exercise ${ex.type === "lesen" ? "reading-exercise" : "topic-exercise"} retry`;
        feedback.textContent = "Bitte alle Fragen beantworten!";
        wrongCount++;
        hadWrong = true;
        return;
      }

      isCorrect = qCorrect === ex.questions.length;
    }

    const isDeutschType = ex.type === "rechtschreibung" || ex.type === "lueckentext" || ex.type === "silben";
    const typeExtra = ex.type === "lesen" ? " reading-exercise" : ex.type === "thema" ? " topic-exercise" : isDeutschType ? " deutsch-exercise" : "";

    if (isCorrect) {
      div.className = `exercise correct${typeExtra}`;
      feedback.textContent = "richtig";
      correctCount++;
      newCorrect++;
      incrementStreak();
      soundCorrect();
      removeFromErrorPool(ex);
    } else {
      const supportsRescue = isRescueSupported(ex);
      const hasAnswerInput = supportsRescue && document.getElementById(`answer-${i}`)?.value.trim() !== "";

      if (supportsRescue && state.attempts[i] === 0 && hasAnswerInput) {
        state.attempts[i] = 1;
        div.className = "exercise retry";
        feedback.textContent = "Nochmal!";
        wrongCount++;
        hadWrong = true;
        soundWrong();
        attachRescueChoices(i);
      } else {
        if (supportsRescue && state.attempts[i] === 1 && hasAnswerInput) state.attempts[i] = 2;

        div.className = `exercise wrong${typeExtra}`;
        div.className = `exercise wrong${wrongExtra}`;
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
        } else if (ex.type === "uhrzeit") {
          correctText = ` → ${ex.answer}`;
        } else if (ex.type === "lesen" || ex.type === "thema" || isDeutschType) {
          correctText = "";
        }
        feedback.innerHTML = correctText ? `falsch<span class="correct-hint">${correctText}</span>` : "Nicht alle richtig";
        wrongCount++;
        hadWrong = true;
        soundWrong();
        addToErrorPool(ex);
        if (ex.type !== "lesen" && ex.type !== "thema" && !isDeutschType) showNumberLineHelp(i);
      }
    }
  });

  if (hadWrong) {
    breakStreak();
  }

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
  const percent = correctCount / state.exercises.length;

  if (correctCount === state.exercises.length) {
    addStars(3);
    addXP(5);
    state.perfectRounds++;
    safeSave(profileKey("perfect-rounds"), state.perfectRounds.toString());
    summary.className = "perfect";
    summary.innerHTML = `<img src="super.png" class="result-image" alt="Super!"><br>Super! Alle ${state.exercises.length} Aufgaben richtig!`;
    checkBtn.textContent = "Alles richtig!";
    checkBtn.disabled = true;
    soundPerfect();
    launchConfetti();

    if (state.currentMode === "lernpfad" && state.currentStage !== null) {
      completeStage(state.currentStage, 1.0);
    }
  } else if (percent >= 0.5) {
    summary.className = "good";
    summary.innerHTML = `<img src="gut.png" class="result-image" alt="Gut gemacht!"><br>${correctCount} von ${state.exercises.length} richtig. Gut gemacht! Versuch die anderen nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
    focusFirstWrong();

    if (state.currentMode === "lernpfad" && state.currentStage !== null) {
      completeStage(state.currentStage, percent);
    }
  } else if (correctCount === 0) {
    summary.className = "retry";
    summary.innerHTML = `<video src="pizza-falsch.mp4" class="result-video" autoplay playsinline></video><br>Noch keine richtig. Versuch es nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
    focusFirstWrong();
  } else {
    summary.className = "retry";
    summary.innerHTML = `<img src="nochmal.png" class="result-image" alt="Nochmal versuchen"><br>${correctCount} von ${state.exercises.length} richtig. Versuch es nochmal!`;
    checkBtn.textContent = "Nochmal prüfen";
    focusFirstWrong();
  }

  showAdaptiveSuggestion(correctCount, state.exercises.length);

  checkAchievements();

  if (!state.checked) {
    logRoundIfNeeded(correctCount, state.exercises.length);
  }

  state.checked = true;
}

function focusFirstWrong() {
  const container = document.getElementById("exercises");
  for (let i = 0; i < state.exercises.length; i++) {
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
