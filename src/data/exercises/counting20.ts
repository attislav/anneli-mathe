// Counting bis 20 — Mengen erfassen ohne einzeln zählen.
// Niveau: Übergang Klasse 1 → Klasse 2. Kein "73 Striche zählen"-Format,
// sondern strukturierte Gruppen (Fünferbündel + Rest), wie es im
// Mathestoff der 1. Klasse eingeführt wird.
//
// Visual hint: die Aufgabe liefert `visual.groups` — die Komponente kann
// daraus z.B. Stein-Cluster rendern. Solange das noch nicht passiert,
// erscheint im `prompt` eine ASCII-Repräsentation mit Emoji, die für
// sich genommen schon spielbar ist.
//
// Varianten (M1, 2026-05-23):
//   - "plain"     : klassisch zählen (Standard)
//   - "missing"   : "Bis 20 fehlen ?" — wie viele fehlen bis 20
//   - "even-only" : nur Gerade zählen — Filtere die Hälfte raus
//
// "missing" und "even-only" sind kompatibel mit tap-count und keypad-Inputs
// (die Antwort bleibt eine Zahl).

import type { Exercise, Level } from "./types";
import { exerciseId, pickOne, randInt } from "./types";
import { vignetteCounting } from "./vignettes";

// Sichtbare Items in den Gruppen — die Komponente entscheidet später,
// ob sie das `visual` oder den Prompt rendert.
const ITEM_GLYPHS = ["🪨", "⭐", "🐦", "🌿"] as const;

type Variant = "plain" | "missing" | "even-only";

/**
 * Erzeugt eine Zähl-Aufgabe.
 * Range hängt vom Level ab:
 *   - "easy":   6..12 (kleinere Mengen, schnell überschaubar)
 *   - "normal": 6..20 (Standard für K1→K2)
 *   - "hard":   14..20 (knapp unter 20, mit zwei vollen Fünferbündeln)
 *
 * Varianten-Verteilung:
 *   - "easy":   90 % plain, 10 % missing
 *   - "normal": 70 % plain, 20 % missing, 10 % even-only
 *   - "hard":   55 % plain, 25 % missing, 20 % even-only
 */
export function generateCounting20(level: Level = "normal"): Exercise {
  const variant = pickVariant(level);
  if (variant === "missing") return buildMissing(level);
  if (variant === "even-only") return buildEvenOnly(level);
  return buildPlain(level);
}

function pickVariant(level: Level): Variant {
  const r = Math.random();
  if (level === "easy") {
    if (r < 0.9) return "plain";
    return "missing";
  }
  if (level === "hard") {
    if (r < 0.55) return "plain";
    if (r < 0.8) return "missing";
    return "even-only";
  }
  // normal
  if (r < 0.7) return "plain";
  if (r < 0.9) return "missing";
  return "even-only";
}

function buildPlain(level: Level): Exercise {
  const total = pickTotal(level);
  const groups = splitIntoGroups(total);
  const glyph = pickOne(ITEM_GLYPHS);

  const visualBlocks = groups.map((n) => glyph.repeat(n)).join("  ");

  const prompt = `${visualBlocks}\n\nWie viele ${nameFor(glyph)} sind das?`;
  const vignette = vignetteCounting({ total, variant: "plain" });

  return {
    id: exerciseId("c20"),
    skill: "counting20",
    prompt,
    vignette,
    visual: { kind: "stones", groups },
    correctAnswer: total,
    hint: "Schau die Gruppen an — fünf, fünf, Rest. Dann musst du nicht einzeln zählen.",
    level,
    variant: "plain",
  };
}

function buildMissing(level: Level): Exercise {
  // "Bis 20 fehlen ?" — wir zeigen `current` Items und fragen nach 20 - current.
  // Für "easy": current 12..18 (wenig Lücke), "hard": 1..10 (viel Lücke).
  let current: number;
  if (level === "easy") current = randInt(12, 18);
  else if (level === "hard") current = randInt(1, 10);
  else current = randInt(5, 16);

  const missing = 20 - current;
  const groups = splitIntoGroups(current);
  const glyph = pickOne(ITEM_GLYPHS);
  const visualBlocks = groups.map((n) => glyph.repeat(n)).join("  ");

  const prompt = `${visualBlocks}\n\nBis 20 fehlen ?`;
  const vignette = vignetteCounting({ total: current, variant: "missing" });

  return {
    id: exerciseId("c20"),
    skill: "counting20",
    prompt,
    vignette,
    visual: { kind: "stones", groups },
    correctAnswer: missing,
    hint: "Zähle erst, was da ist. Dann: was muss noch dazu, damit es 20 sind?",
    level,
    variant: "missing",
  };
}

function buildEvenOnly(level: Level): Exercise {
  // Generate eine Menge gerader Items zwischen 2 und 20.
  let evenCount: number;
  if (level === "easy") evenCount = randInt(2, 5) * 2; // 4..10
  else if (level === "hard") evenCount = randInt(6, 10) * 2; // 12..20
  else evenCount = randInt(3, 9) * 2; // 6..18

  const groups = splitIntoGroups(evenCount);
  const glyph = pickOne(ITEM_GLYPHS);
  const visualBlocks = groups.map((n) => glyph.repeat(n)).join("  ");

  const prompt = `${visualBlocks}\n\nNur die GERADEN ${nameFor(glyph)} zählen — wie viele?`;
  const vignette = vignetteCounting({ total: evenCount, variant: "even-only" });

  return {
    id: exerciseId("c20"),
    skill: "counting20",
    prompt,
    vignette,
    visual: { kind: "stones", groups },
    correctAnswer: evenCount,
    hint: "Bilde Paare. Jedes Paar zählt zwei. Zähl in Zweier-Schritten.",
    level,
    variant: "even-only",
  };
}

function pickTotal(level: Level): number {
  if (level === "easy") return randInt(6, 12);
  if (level === "hard") return randInt(14, 20);
  return randInt(6, 20);
}

function splitIntoGroups(total: number): number[] {
  if (total <= 0) return [];
  if (total <= 9) {
    if (total <= 5 || Math.random() < 0.3) return [total];
    return [5, total - 5];
  }
  if (total <= 15) {
    const first = 5;
    const remaining = total - first;
    if (remaining <= 5) return [first, remaining];
    return [first, 5, remaining - 5];
  }
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
