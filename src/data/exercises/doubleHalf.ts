// Verdoppeln und Halbieren bis 100.
// Niveau: Klasse 2.
//
// Mechanik: gegeben eine Zahl, gefragt ist das Doppelte ODER die Hälfte.
// Halbieren funktioniert nur sauber für gerade Zahlen — wir generieren
// daher Halbierungs-Aufgaben nur mit geraden Werten.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteDoubleHalf } from "./vignettes";

type Mode = "double" | "half";

/**
 * Erzeugt eine Verdoppeln/Halbieren-Aufgabe.
 * - "easy":   Verdoppeln 1..10, Halbieren gerader Zahlen 2..20.
 * - "normal": Verdoppeln 5..25 (Ergebnis bis 50), Halbieren gerader Zahlen 10..40.
 * - "hard":   Verdoppeln 10..49 mit Zehnerübergang, Halbieren gerader Zahlen 20..98.
 */
export function generateDoubleHalf(level: Level = "normal"): Exercise {
  const mode: Mode = Math.random() < 0.5 ? "double" : "half";
  const value = pickValue(mode, level);
  const correct = mode === "double" ? value * 2 : value / 2;

  const vignette = vignetteDoubleHalf({ value, mode });
  const prompt =
    mode === "double"
      ? `Das Doppelte von ${value} ist?`
      : `Die Hälfte von ${value} ist?`;

  return {
    id: exerciseId("dh"),
    skill: "doubleHalf",
    prompt,
    vignette,
    visual: { kind: "mirror", value, mode },
    correctAnswer: correct,
    hint: hintFor(mode, value),
    level,
  };
}

function pickValue(mode: Mode, level: Level): number {
  if (mode === "double") {
    if (level === "easy") return randInt(2, 10);
    if (level === "hard") return randInt(13, 49);
    return randInt(6, 25);
  }
  // half — immer gerade
  if (level === "easy") return randInt(1, 10) * 2; // 2..20
  if (level === "hard") return randInt(11, 49) * 2; // 22..98
  return randInt(5, 20) * 2; // 10..40
}

function hintFor(mode: Mode, value: number): string {
  if (mode === "double") {
    if (value <= 5) return `${value} und nochmal ${value} dazu.`;
    return `${value} + ${value} — erst zur Zehn ergänzen, dann den Rest.`;
  }
  // half
  if (value <= 10) return `${value} fair in zwei Teile aufteilen.`;
  return `Teile ${value} in zwei gleiche Hälften. Tipp: ${value} = ${Math.floor(value / 2)} + ${Math.ceil(value / 2)}.`;
}
