"use client";

// Sound-Effekte, live mit der Web-Audio-API erzeugt — keine Dateien nötig.
// Kurz, hell, freundlich. Es gibt bewusst KEINEN Fehler-Buzzer: falsch
// klingt nur wie ein leises, tiefes „Hmm".

import { readSave } from "./state";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!readSave().settings.sound) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.06, "triangle", 0.08),
  correct: () => {
    tone(784, 0, 0.12, "triangle");
    tone(1046, 0.09, 0.22, "triangle");
  },
  combo: () => {
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.16, "triangle", 0.14));
  },
  wrong: () => tone(260, 0, 0.22, "sine", 0.12, 200),
  coin: () => {
    tone(1318, 0, 0.08, "square", 0.05);
    tone(1760, 0.07, 0.18, "square", 0.05);
  },
  pop: () => tone(520, 0, 0.09, "sine", 0.2, 1200),
  chest: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.08, 0.3, "triangle", 0.12));
  },
  fanfare: () => {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.18, "triangle", 0.14));
    tone(1046, 0.38, 0.5, "triangle", 0.16);
  },
  hit: () => tone(180, 0, 0.18, "sawtooth", 0.08, 90),
};
