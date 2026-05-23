// Shared types and helpers for the per-skill exercise generators.
// Each generator returns a single, randomized `Exercise` per call.
// Level target: Übergang Klasse 1 → Klasse 2 (siehe ROADMAP.md, Kapitel 1).

import type { Skill } from "@/data/bridges";

/**
 * Difficulty level passed *into* a generator by the adaptive engine.
 *   - "easy"   = 1 Stufe leichter (z.B. kleinere Zahlen, weniger Übergang)
 *   - "normal" = Standard für Klasse 1→2
 *   - "hard"   = 1 Stufe schwerer (z.B. größere Zahlen, mehr Übergang)
 *
 * Innerhalb von BridgeChallenge: 3 richtig in Folge → "hard",
 * 2 falsch in Folge → "easy", sonst "normal".
 */
export type Level = "easy" | "normal" | "hard";

/**
 * A single math task shown to the child inside `BridgeChallenge`.
 *
 * - `id`: unique within a generated session — used as React key.
 * - `prompt`: the question text (may include line breaks).
 * - `vignette`: optional 1-2 Satz Story-Kontext aus der Sky-Kingdom-Welt,
 *   in dem die Mathe-Frage steckt. Wird ÜBER dem Prompt angezeigt
 *   ("Vogelmama zählt 3 Eier. Dann legt sie 5 dazu."). Generator entscheidet,
 *   ob die Aufgabe nackt oder als Vignette präsentiert wird.
 * - `visual`: optional, generator-defined extra payload for richer rendering
 *   (e.g. an array of "stones" for counting). Components opt into reading this.
 * - `correctAnswer`: canonical numeric answer; the input is parsed as Number.
 * - `acceptableAnswers`: alternative string forms that should also count as
 *   correct (e.g. for compare100 we accept both "47" and "74" representations
 *   if the prompt asks for the larger number — kept simple for now).
 * - `hint`: optional per-task nudge the UI may show after ~3s ohne Antwort
 *   bzw. nach falscher Antwort.
 * - `level`: Schwierigkeitsgrad, mit dem die Aufgabe erzeugt wurde.
 */
/**
 * Aufgaben-Variante innerhalb eines Skills. Optional — falls nicht gesetzt,
 * gilt "plain" (Standard-Form des Skills).
 *
 * Werte:
 *   - "plain"     : nackte Standard-Form (z.B. a+b=?, "Wie viele?")
 *   - "gap-a"     : Lücke vorne (z.B. ?+b=c, ?-b=c)
 *   - "gap-b"     : Lücke hinten (z.B. a+?=c, a-?=c)
 *   - "missing"   : "wie viele fehlen bis X?" (counting20)
 *   - "even-only" : nur Gerade zählen (counting20)
 *   - "context"   : Sachaufgabe (z.B. "Anneli hatte ... wie viele verloren?")
 *   - "commutative": Kommutativ-Frage (a+b vs b+a)
 *   - "multi-pick": aus mehreren Werten den größten/kleinsten wählen
 *   - "set-compare": zwei Sets vergleichen
 *   - "step-before"/"step-after": 5 vor/nach X (tensNeighbors)
 *   - "closer-tens": welcher Zehner ist näher (tensNeighbors)
 *   - "quarter"   : Hälfte von Hälfte = Viertel (doubleHalf)
 *   - "quadruple" : Doppelt von Doppelt = ×4 (doubleHalf)
 *   - "mix"       : Verkettete Operation (doubleHalf)
 */
export type ExerciseVariant =
  | "plain"
  | "gap-a"
  | "gap-b"
  | "missing"
  | "even-only"
  | "context"
  | "commutative"
  | "multi-pick"
  | "set-compare"
  | "step-before"
  | "step-after"
  | "closer-tens"
  | "quarter"
  | "quadruple"
  | "mix";

export type Exercise = {
  id: string;
  skill: Skill;
  prompt: string;
  vignette?: string;
  visual?: ExerciseVisual;
  correctAnswer: number;
  acceptableAnswers?: string[];
  hint?: string;
  level: Level;
  /**
   * Optionale Variante innerhalb des Skills. Generatoren setzen das, wenn
   * sie verschiedene Aufgaben-Formen produzieren. UI darf das auswerten,
   * muss aber nicht — die Mechanik (`correctAnswer`-Vergleich) funktioniert
   * unverändert.
   */
  variant?: ExerciseVariant;
};

export type ExerciseVisual =
  | { kind: "stones"; groups: number[] } // groups of items, e.g. [5,5,4] = three clusters
  | { kind: "tens-ones"; tens: number; ones: number }
  | { kind: "compare"; left: number; right: number } // visual for compare100
  | { kind: "number-line"; from: number; to: number; markers: number[] } // tensNeighbors
  | { kind: "mirror"; value: number; mode: "double" | "half" }; // doubleHalf

/**
 * Random integer in [min, max] inclusive.
 */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick one element from a non-empty array.
 */
export function pickOne<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("pickOne: empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Short stable id for an exercise. Not cryptographically unique — just enough
 * to avoid React key collisions inside a single bridge session.
 */
export function exerciseId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
