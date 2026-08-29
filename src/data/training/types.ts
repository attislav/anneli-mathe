// Typen für das Kopfrechnen-Training.
//
// Das Training ist bewusst UNABHÄNGIG vom Story-Modus:
// eigene Route (/training), eigene Persistenz (`anneli.training.v1`),
// eigene Aufgaben-Generatoren. Keine Vignetten, keine Brücken, keine
// Sky-Kingdom-Welt — hier geht es um blankes, schnelles Kopfrechnen
// mit Rechentricks. Zielgruppe: Klasse 2–3.
//
// Level ("easy" | "normal" | "hard") teilen wir uns mit der Story-Engine,
// damit das Adaptive-Verhalten in beiden Modi identisch gedacht ist.

import type { Level } from "@/data/exercises/types";

export type { Level };

/**
 * Eine einzelne Kopfrechen-Aufgabe.
 *
 * - `prompt`: der reine Term, ohne „= ?" — das rendert die UI groß und
 *   ergänzt selbst das Fragezeichen (z.B. "8 + 7").
 * - `hint`: wendet den Modul-Trick auf GENAU DIESE Zahlen an
 *   ("8 + 7: erst 8 + 2 = 10, dann 10 + 5 = 15"). Wird nach einer
 *   falschen Antwort oder auf Wunsch eingeblendet.
 * - `solution`: Klartext-Auflösung, wenn Anneli mehrfach danebenliegt.
 *   Kein „falsch!", sondern „so geht's" — dann weiter.
 */
export type TrainingTask = {
  id: string;
  moduleId: string;
  prompt: string;
  correctAnswer: number;
  hint: string;
  solution: string;
  level: Level;
};

/** Kurz-ID für React-Keys innerhalb einer Runde. */
export function taskId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export { randInt, pickOne } from "@/data/exercises/types";
