// Aufgaben vorlesen aus aufgenommenen Bausteinen.
//
// Die Aufgaben werden gewürfelt — es gibt zu viele, um jede fertig zu
// vertonen. Darum wird jeder Text in Zahlen und Satzstücke zerlegt
// („38 + 7 = ?" → 38 · „plus" · 7 · „ist wie viel"), beides einmal mit der
// App-Stimme aufgenommen und beim Vorlesen hintereinander abgespielt.
// Fragen ohne Zahl („Wie spät ist es?") werden am Stück aufgenommen, damit
// sie wie eine Frage klingen.
//
// Diese Datei ist reine Logik (kein Browser): Das Sammel-Skript
// `scripts/collect-task-speech.ts` benutzt sie genauso wie die App.

import { fragmentKey, normalizeFragment, toSpokenText } from "@/data/training/speech";

export type Piece = { kind: "text"; key: string; text: string } | { kind: "number"; value: number } | { kind: "pause"; ms: number };

/** Vorlesbare Felder einer Aufgabe. */
export type Readable = { question: string; term?: string };

const PAUSE_SENTENCE = 300;
const PAUSE_CLAUSE = 160;

/** Uhrzeiten, Geld und Einheiten so umschreiben, wie man sie spricht. */
export function speakable(raw: string): string {
  return (
    raw
      // „10:00 Uhr" → „10 Uhr", „7:30" → „7 Uhr 30"
      .replace(/\b(\d{1,2}):(\d{2})(\s*Uhr)?/g, (_, h: string, m: string) => (m === "00" ? `${Number(h)} Uhr` : `${Number(h)} Uhr ${Number(m)}`))
      // „2,50 €" → „2 Euro 50"
      .replace(/\b(\d+),(\d{2})\s*€/g, (_, e: string, c: string) => (c === "00" ? `${e} Euro` : `${e} Euro ${Number(c)}`))
      .replace(/€/g, " Euro ")
      .replace(/(\d|\?)\s*ct\b/g, "$1 Cent")
      .replace(/(\d|\?)\s*cm\b/g, "$1 Zentimeter")
      .replace(/(\d|\?)\s*m\b/g, "$1 Meter")
      .replace(/→/g, " bis ")
      // „in 5er-Schritten" → „in Schritten von je 5", „3-mal" → „3 mal"
      .replace(/(\d+)er-Schritten/g, "Schritten von je $1")
      .replace(/(\d+)-mal\b/g, "$1 mal")
      .replace(/\bStd\./g, "Stunden")
      .replace(/\bMin\./g, "Minuten")
      // Reihen „11, 12, 13, ?" → „… 13, und dann?"
      .replace(/,\s*\?\s*$/, ", und dann")
  );
}

function textPiece(text: string): Piece {
  return { kind: "text", key: fragmentKey(text), text };
}

/** Zahl als Baustein(e): bis 100 direkt, darüber „fünfhundert" + „dreiundzwanzig". */
function numberPieces(n: number): Piece[] {
  if (n <= 100 || n === 1000) return [{ kind: "number", value: n }];
  const h = Math.floor(n / 100) * 100;
  return n % 100 ? [{ kind: "number", value: h }, { kind: "number", value: n % 100 }] : [{ kind: "number", value: h }];
}

/** Einen Text zerlegen. Ohne Zahlen bleibt er am Stück (mit Fragezeichen). */
export function textPieces(raw: string): Piece[] {
  const spoken = speakable(raw);
  if (!/\d/.test(spoken)) {
    const whole = toSpokenText(spoken, { placeholders: /[=+−·:]/.test(spoken) }).replace(/[„“"]/g, "");
    return /[a-zA-ZäöüÄÖÜß]/.test(whole) ? [textPiece(whole)] : [];
  }
  const text = toSpokenText(spoken);
  const out: Piece[] = [];
  const push = (chunk: string) => {
    const t = normalizeFragment(chunk);
    const lead = /^\s*([.!?…;,:])/.exec(chunk);
    if (lead && out.length && out[out.length - 1].kind !== "pause") out.push({ kind: "pause", ms: /[.!?]/.test(lead[1]) ? PAUSE_SENTENCE : PAUSE_CLAUSE });
    if (t) out.push(textPiece(t));
    else if (out.length && out[out.length - 1].kind !== "pause" && /[,;:…]/.test(chunk)) out.push({ kind: "pause", ms: PAUSE_CLAUSE });
  };
  let last = 0;
  for (const m of text.matchAll(/\d+/g)) {
    push(text.slice(last, m.index));
    out.push(...numberPieces(Number(m[0])));
    last = m.index! + m[0].length;
  }
  push(text.slice(last));
  while (out.length && out[out.length - 1].kind === "pause") out.pop();
  return out;
}

/** Frage und (falls anders) die große Aufgabe darunter. */
export function taskPieces(task: Readable): Piece[] {
  const pieces = textPieces(task.question);
  // Die große Aufgabe nur, wenn sie Zahlen hat — „? Minuten" sagt nichts Neues.
  if (task.term && /\d/.test(task.term) && task.term.trim() !== task.question.trim()) {
    const term = textPieces(task.term);
    if (term.length) pieces.push({ kind: "pause", ms: PAUSE_SENTENCE }, ...term);
  }
  return pieces;
}

export function pieceUrl(p: Piece): string | null {
  if (p.kind === "number") return `/stimme/aufgabe/n/${p.value}.mp3`;
  if (p.kind === "text") return `/stimme/aufgabe/t/${p.key}.mp3`;
  return null;
}
