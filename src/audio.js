// ============ SOUND SYSTEM (Web Audio API) ============
import { state } from "./state.js";

function getAudioCtx() {
  if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return state.audioCtx;
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

export function soundCorrect() {
  playTone(523, 0.12, 0, "sine", 0.25);
  playTone(659, 0.15, 0.1, "sine", 0.25);
}

export function soundWrong() {
  playTone(220, 0.25, 0, "triangle", 0.15);
}

export function soundPerfect() {
  const notes = [523, 587, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playTone(freq, 0.2, i * 0.12, "sine", 0.25);
  });
}

export function soundStreak() {
  playTone(880, 0.08, 0, "sine", 0.2);
  playTone(1047, 0.08, 0.06, "sine", 0.2);
  playTone(1319, 0.12, 0.12, "sine", 0.2);
}

export function soundLevelUp() {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    playTone(freq, 0.25, i * 0.15, "sine", 0.3);
  });
}
