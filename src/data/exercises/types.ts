// Shared types and helpers for the per-skill exercise generators.
// Each generator returns a single, randomized `Exercise` per call.
// Level target: Übergang Klasse 1 → Klasse 2 (siehe ROADMAP.md, Kapitel 1).

import type { Skill } from "@/data/bridges";

/**
 * A single math task shown to the child inside `BridgeChallenge`.
 *
 * - `id`: unique within a generated session — used as React key.
 * - `prompt`: the question text (may include line breaks).
 * - `visual`: optional, generator-defined extra payload for richer rendering
 *   (e.g. an array of "stones" for counting). Components opt into reading this.
 * - `correctAnswer`: canonical numeric answer; the input is parsed as Number.
 * - `acceptableAnswers`: alternative string forms that should also count as
 *   correct (e.g. for compare100 we accept both "47" and "74" representations
 *   if the prompt asks for the larger number — kept simple for now).
 * - `hint`: optional per-task nudge the UI may show after a wrong answer.
 */
export type Exercise = {
  id: string;
  skill: Skill;
  prompt: string;
  visual?: ExerciseVisual;
  correctAnswer: number;
  acceptableAnswers?: string[];
  hint?: string;
};

export type ExerciseVisual =
  | { kind: "stones"; groups: number[] } // groups of items, e.g. [5,5,4] = three clusters
  | { kind: "tens-ones"; tens: number; ones: number };

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
