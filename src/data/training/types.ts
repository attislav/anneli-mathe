// Typen für das Kopfrechnen-Training.
//
// Das Training ist bewusst UNABHÄNGIG vom Story-Modus:
// eigene Route (/training), eigene Persistenz (`anneli.training.v1`),
// eigene Aufgaben-Generatoren. Hier geht es um blankes, schnelles
// Kopfrechnen mit Rechentricks. Zielgruppe: Klasse 2–3.
//

/** Schwierigkeit einer Trainingsaufgabe. */
export type Level = "easy" | "normal" | "hard";


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

/** Zufallszahl in [min, max], beide inklusive. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Ein zufälliges Element aus einer nicht-leeren Liste. */
export function pickOne<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("pickOne: empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}
