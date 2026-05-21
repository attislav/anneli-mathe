// Counting bis 20 — Mengen erfassen ohne einzeln zählen.
// Niveau: Übergang Klasse 1 → Klasse 2. Kein "73 Striche zählen"-Format,
// sondern strukturierte Gruppen (Fünferbündel + Rest), wie es im
// Mathestoff der 1. Klasse eingeführt wird.
//
// Visual hint: die Aufgabe liefert `visual.groups` — die Komponente kann
// daraus z.B. Stein-Cluster rendern. Solange das noch nicht passiert,
// erscheint im `prompt` eine ASCII-Repräsentation mit Emoji, die für
// sich genommen schon spielbar ist.

import type { Exercise } from "./types";
import { exerciseId, pickOne, randInt } from "./types";

// Sichtbare Items in den Gruppen — die Komponente entscheidet später,
// ob sie das `visual` oder den Prompt rendert.
const ITEM_GLYPHS = ["🪨", "⭐", "🐦", "🌿"] as const;

/**
 * Erzeugt eine Zähl-Aufgabe mit Gesamtmenge 6..20, aufgeteilt in
 * 1–4 Gruppen. Höhere Mengen bekommen mehr Gruppen, damit das Kind
 * Fünferbündel sehen kann — kein "lineares Abzählen" über 20.
 */
export function generateCounting20(): Exercise {
  const total = randInt(6, 20);

  // Gruppierungsstrategie nach Größe:
  // - bis 9: 1–2 Gruppen
  // - 10–15: 2–3 Gruppen, idealerweise mit einer Fünfer-Gruppe
  // - 16–20: 3–4 Gruppen, typischerweise zwei Fünfer + Rest
  const groups = splitIntoGroups(total);
  const glyph = pickOne(ITEM_GLYPHS);

  const visualBlocks = groups
    .map((n) => glyph.repeat(n))
    .join("  ");

  const prompt = `${visualBlocks}\n\nWie viele ${nameFor(glyph)} sind das?`;

  return {
    id: exerciseId("c20"),
    skill: "counting20",
    prompt,
    visual: { kind: "stones", groups },
    correctAnswer: total,
    hint: "Schau die Gruppen an — fünf, fünf, Rest. Dann musst du nicht einzeln zählen.",
  };
}

function splitIntoGroups(total: number): number[] {
  if (total <= 9) {
    // Eine oder zwei Gruppen (z.B. 6 = 5+1, 8 = 5+3 oder 4+4).
    if (total <= 5 || Math.random() < 0.3) return [total];
    return [5, total - 5];
  }
  if (total <= 15) {
    // Zwei oder drei Gruppen, mit einer Fünfer-Bündelung.
    // Bsp.: 12 → 5+5+2 oder 5+4+3.
    const first = 5;
    const remaining = total - first;
    if (remaining <= 5) return [first, remaining];
    return [first, 5, remaining - 5];
  }
  // 16..20 — drei oder vier Gruppen, Fünferbündel-lastig.
  // Bsp.: 17 → 5+5+5+2, 20 → 5+5+5+5.
  const fives = Math.floor(total / 5);
  const rest = total - fives * 5;
  const groups = Array.from({ length: fives }, () => 5);
  if (rest > 0) groups.push(rest);
  return groups;
}

function nameFor(glyph: string): string {
  switch (glyph) {
    case "🪨":
      return "Steine";
    case "⭐":
      return "Sterne";
    case "🐦":
      return "Vögel";
    case "🌿":
      return "Blätter";
    default:
      return "Dinge";
  }
}
