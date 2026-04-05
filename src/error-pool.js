// ============ ERROR POOL (Fehler-Wiederholung) + WEAKNESS SCORING ============
import { state } from "./state.js";
import { subjectKey, safeSave } from "./storage.js";

export function addToErrorPool(exercise) {
  if (exercise.type === "zehner" || exercise.type === "lesen" || exercise.type === "thema") return;

  const stage = (state.currentMode === "lernpfad" && state.currentStage !== null && state.currentStage !== undefined)
    ? state.LEARNING_PATH[state.currentStage]
    : null;

  const entry = {
    type: exercise.type,
    op: exercise.type === "normal" ? exercise.op : exercise.display.op,
    a: exercise.type === "normal" ? exercise.a : (exercise.display.left || exercise.answer),
    b: exercise.type === "normal" ? exercise.b : (exercise.display.right || exercise.answer),
    answer: exercise.answer,
    timestamp: Date.now(),
    stageId: stage ? stage.id : null,
    skillId: stage?.skillId || null,
  };

  const isDupe = state.errorPool.some((e) => e.op === entry.op && e.a === entry.a && e.b === entry.b);
  if (!isDupe) {
    state.errorPool.push(entry);
  }
  if (state.errorPool.length > 30) state.errorPool = state.errorPool.slice(-30);
  safeSave(subjectKey("errors"), JSON.stringify(state.errorPool));
}

export function removeFromErrorPool(exercise) {
  if (exercise.type === "zehner" || exercise.type === "lesen" || exercise.type === "thema") return;
  const op = exercise.type === "normal" ? exercise.op : exercise.display.op;
  const a = exercise.type === "normal" ? exercise.a : (exercise.display.left || exercise.answer);
  const b = exercise.type === "normal" ? exercise.b : (exercise.display.right || exercise.answer);

  state.errorPool = state.errorPool.filter((e) => !(e.op === op && e.a === a && e.b === b));
  safeSave(subjectKey("errors"), JSON.stringify(state.errorPool));
}

export function getErrorRepeatExercises(config, count) {
  const matching = (state.errorPool || []).filter((e) => {
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

export function getErrorsForStage(stage) {
  if (!stage) return [];

  const sid = stage.id;
  const skillId = stage.skillId;

  return (state.errorPool || []).filter((e) => {
    if (e.stageId !== undefined && e.stageId !== null) return e.stageId === sid;
    if (e.skillId && skillId) return e.skillId === skillId;
    return false;
  });
}

function computeWeaknessScore(stage) {
  const errors = getErrorsForStage(stage);
  const errorCount = errors.length;

  const mastered = state.masteredStages.includes(stage.id);
  const reps = getRequiredRepetitions(stage);
  const passes = getSkillPasses(stage);
  const repsLeft = Math.max(0, reps - passes);

  const now = Date.now();
  const recentBoost = errors.reduce((acc, e) => {
    const ageDays = (now - (e.timestamp || now)) / (1000 * 60 * 60 * 24);
    if (ageDays <= 2) return acc + 1.0;
    if (ageDays <= 7) return acc + 0.5;
    return acc + 0.2;
  }, 0);

  let score = 0;
  score += errorCount * 3;
  score += recentBoost;
  if (!mastered) score += 0.5;
  score += repsLeft * 0.25;

  return score;
}

export function pickRecommendedStageId() {
  const unlocked = Array.isArray(state.unlockedStages) ? state.unlockedStages.slice() : [0];
  const candidates = unlocked
    .map((id) => state.LEARNING_PATH[id])
    .filter(Boolean);

  if (candidates.length === 0) return 0;

  const hasTaggedErrors = (state.errorPool || []).some((e) => (e.stageId !== null && e.stageId !== undefined) || !!e.skillId);

  if (hasTaggedErrors) {
    const ranked = candidates
      .map((stage) => ({ id: stage.id, score: computeWeaknessScore(stage) }))
      .sort((a, b) => b.score - a.score);

    for (const item of ranked) {
      const stage = state.LEARNING_PATH[item.id];
      const mastered = state.masteredStages.includes(stage.id);
      const errs = getErrorsForStage(stage).length;
      if (!mastered || errs > 0) return item.id;
    }

    return ranked[0].id;
  }

  const firstNotMastered = unlocked.find((id) => !state.masteredStages.includes(id));
  return firstNotMastered !== undefined ? firstNotMastered : (unlocked.sort((a, b) => a - b).slice(-1)[0] ?? 0);
}

// Re-exported from learning-path for convenience (avoid circular deps)
function getRequiredRepetitions(stage) {
  const reps = parseInt(stage?.repetitions || 1, 10);
  return Number.isFinite(reps) && reps > 0 ? reps : 1;
}

function getSkillPasses(stage) {
  if (!stage?.skillId) return 0;
  return parseInt(state.skillMasteryProgress?.[stage.skillId]?.passes || 0, 10) || 0;
}
