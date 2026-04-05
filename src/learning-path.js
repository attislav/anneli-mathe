// ============ LEARNING PATH / SKILLTREE ============
import { state, DEFAULT_LEARNING_PATH, events } from "./state.js";
import { savePathProgress, saveSkillMasteryProgress } from "./storage.js";

// ============ SKILLTREE LOADING ============

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
  if (!Array.isArray(state.masteredStages) || state.masteredStages.length === 0) return;
  if (!state.skillMasteryProgress) state.skillMasteryProgress = {};

  state.masteredStages.forEach((stageId) => {
    const stage = state.LEARNING_PATH[stageId];
    if (!stage?.skillId) return;
    const reps = getRequiredRepetitions(stage);
    const passes = getSkillPasses(stage);
    if (passes < reps) {
      state.skillMasteryProgress[stage.skillId] = { passes: reps };
    }
  });

  saveSkillMasteryProgress();
}

export function loadSkilltreeFromJson(grade) {
  grade = grade || "grade-1";
  state.currentGrade = grade;
  const url = `content/de/mathe/${grade}/skilltree.json`;

  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`skilltree fetch failed: ${res.status}`);
      return res.json();
    })
    .then((json) => {
      const parsed = skilltreeToLearningPath(json);
      if (!parsed || parsed.length === 0) throw new Error("skilltree parse failed");

      state.LEARNING_PATH = parsed;

      state.unlockedStages = state.unlockedStages.filter((id) => id >= 0 && id < state.LEARNING_PATH.length);
      state.masteredStages = state.masteredStages.filter((id) => id >= 0 && id < state.LEARNING_PATH.length);
      if (state.unlockedStages.length === 0) state.unlockedStages = [0];

      migrateMasteryProgressFromOldMasteredStages();
      savePathProgress();
      events.emit("render-learning-path");
    })
    .catch(() => {
      // Silent fallback: app still works with the hardcoded path.
    });
}

// ============ STAGE MANAGEMENT ============

export function getRequiredRepetitions(stage) {
  const reps = parseInt(stage?.repetitions || 1, 10);
  return Number.isFinite(reps) && reps > 0 ? reps : 1;
}

export function getSkillPasses(stage) {
  if (!stage?.skillId) return 0;
  return parseInt(state.skillMasteryProgress?.[stage.skillId]?.passes || 0, 10) || 0;
}

export function incrementSkillPass(stage) {
  if (!stage?.skillId) return 0;
  const current = getSkillPasses(stage);
  const next = current + 1;
  if (!state.skillMasteryProgress) state.skillMasteryProgress = {};
  state.skillMasteryProgress[stage.skillId] = { passes: next };
  saveSkillMasteryProgress();
  return next;
}

export function ensureStageMasteredIfComplete(stageId) {
  const stage = state.LEARNING_PATH[stageId];
  if (!stage) return false;
  const reps = getRequiredRepetitions(stage);
  const passes = getSkillPasses(stage);
  if (passes >= reps && !state.masteredStages.includes(stageId)) {
    state.masteredStages.push(stageId);
    return true;
  }
  return false;
}

export function completeStage(stageId, score) {
  const stage = state.LEARNING_PATH[stageId];
  if (!stage) return;

  if (score < stage.passScore) return;

  const reps = getRequiredRepetitions(stage);
  const passes = incrementSkillPass(stage);

  if (passes >= reps) {
    if (!state.masteredStages.includes(stageId)) {
      state.masteredStages.push(stageId);
    }

    const nextId = stageId + 1;
    if (nextId < state.LEARNING_PATH.length && !state.unlockedStages.includes(nextId)) {
      state.unlockedStages.push(nextId);
      const next = state.LEARNING_PATH[nextId];
      events.emit("toast", next.icon, "Neue Stufe freigeschaltet!", next.name);
    }
  } else {
    const left = Math.max(0, reps - passes);
    events.emit("toast", stage.icon, "Fast!", `${left}× noch schaffen`);
  }

  savePathProgress();
  events.emit("render-learning-path");
}
