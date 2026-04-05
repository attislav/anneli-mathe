// ============ PRACTICE LOG (time spent) ============
import { state } from "./state.js";
import { savePracticeLog } from "./storage.js";

export function startRoundTimer() {
  state.roundStartAt = Date.now();
  state.roundContext = {
    mode: state.currentMode,
    skillId: (state.currentMode === "lernpfad" && state.currentStage !== null) ? (state.LEARNING_PATH?.[state.currentStage]?.skillId || null) : null,
  };
}

export function logRoundIfNeeded(correct, total) {
  if (!state.roundStartAt) return;

  let durationSec = Math.round((Date.now() - state.roundStartAt) / 1000);
  durationSec = Math.max(5, Math.min(durationSec, 60 * 30));

  const entry = {
    ts: Date.now(),
    durationSec,
    correct: Number.isFinite(correct) ? correct : 0,
    total: Number.isFinite(total) ? total : 0,
    mode: state.roundContext?.mode || state.currentMode,
    skillId: state.roundContext?.skillId || null,
  };

  if (!Array.isArray(state.practiceLog)) state.practiceLog = [];
  state.practiceLog.push(entry);
  if (state.practiceLog.length > 200) state.practiceLog = state.practiceLog.slice(-200);
  savePracticeLog();

  state.roundStartAt = null;
  state.roundContext = { mode: null, skillId: null };
}

export function sumPracticeSecondsSince(sinceTs) {
  if (!Array.isArray(state.practiceLog) || state.practiceLog.length === 0) return 0;
  return state.practiceLog
    .filter((e) => (e?.ts || 0) >= sinceTs)
    .reduce((acc, e) => acc + (parseInt(e?.durationSec || 0, 10) || 0), 0);
}

export function formatMinutes(sec) {
  const m = Math.round(sec / 60);
  if (m <= 0) return "0 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}
