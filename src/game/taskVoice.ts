"use client";

// Aufgaben vorlesen: die Bausteine aus `taskSpeech.ts` laden und lückenlos
// hintereinander abspielen (Web Audio, damit zwischen den Stücken keine
// Ladepausen entstehen). Vorgelesen wird nur, wenn ALLE Bausteine einer
// Aufgabe aufgenommen sind — sonst gibt es keinen Knopf.

import avail from "./taskSpeechAvail.json";
import { pieceUrl, taskPieces, textPieces, type Piece, type Readable } from "./taskSpeech";
import { stopVoice } from "./voice";

const NUMBERS = new Set<number>(avail.n);
const TEXTS = new Set<string>(avail.t);

function complete(pieces: Piece[]): boolean {
  return pieces.length > 0 && pieces.every((p) => p.kind === "pause" || (p.kind === "number" ? NUMBERS.has(p.value) : TEXTS.has(p.key)));
}

export function canRead(task: Readable): boolean {
  return complete(taskPieces(task));
}

/** Für Tipps und Lösungen: ein freier Text. */
export function canReadText(text: string): boolean {
  return complete(textPieces(text));
}

let ctx: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
let playing: AudioBufferSourceNode[] = [];
let token = 0;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function load(a: AudioContext, url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then((data) => a.decodeAudioData(data))
      .catch(() => {
        buffers.delete(url);
        return null;
      });
    buffers.set(url, p);
  }
  return p;
}

export function readTask(task: Readable): Promise<void> {
  return play(taskPieces(task));
}

export function readText(text: string): Promise<void> {
  return play(textPieces(text));
}

async function play(pieces: Piece[]): Promise<void> {
  stopReading();
  stopVoice();
  const my = token;
  const a = audio();
  if (!a || !complete(pieces)) return;
  const bufs = await Promise.all(pieces.map((p) => (pieceUrl(p) ? load(a, pieceUrl(p)!) : Promise.resolve(null))));
  if (my !== token) return; // inzwischen neue Aufgabe oder abgebrochen
  let t = a.currentTime + 0.05;
  pieces.forEach((p, i) => {
    if (p.kind === "pause") {
      t += p.ms / 1000;
      return;
    }
    const b = bufs[i];
    if (!b) return;
    const src = a.createBufferSource();
    src.buffer = b;
    src.connect(a.destination);
    src.start(t);
    playing.push(src);
    t += b.duration;
  });
}

export function stopReading(): void {
  token++;
  for (const s of playing) {
    try {
      s.stop();
    } catch {
      // schon fertig
    }
  }
  playing = [];
}
