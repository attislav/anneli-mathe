// Grundtypen der Spiel-Engine.
//
// Eine Aufgabe (`Task`) ist reine Daten: Zahlen, Lösung, Tipp, Rechenweg
// und das FORMAT, in dem sie gestellt wird. Welche Komponente sie rendert,
// entscheidet allein `format` — die Generatoren wissen nichts von React.

/** Schwierigkeit 1 (sehr leicht) bis 5 (Meister). */
export type Level = 1 | 2 | 3 | 4 | 5;

export type Format = "choice" | "input" | "tens-ones" | "number-line" | "wall" | "compare";

type TaskBase = {
  id: string;
  skillId: string;
  level: Level;
  /** Die Frage in Kinder-Sprache, z.B. „Wie viel ist das?". */
  question: string;
  /** Tipp nach dem ersten Fehlversuch — wendet den Trick auf GENAU diese Zahlen an. */
  hint: string;
  /** Rechenweg nach dem zweiten Fehlversuch. Kein „falsch", sondern „so geht's". */
  solution: string;
};

/** Antwort antippen. `term` ist die große Aufgabe, z.B. „38 + 7 = ?". */
export type ChoiceTask = TaskBase & {
  format: "choice";
  term?: string;
  options: string[];
  answer: string;
};

/** Zahl eintippen. `term` enthält genau ein „?" als Lücke. */
export type InputTask = TaskBase & {
  format: "input";
  term: string;
  answer: number;
};

/** Zahl mit Zehnerstangen und Einerwürfeln legen. */
export type TensOnesTask = TaskBase & {
  format: "tens-ones";
  target: number;
};

/** Auf dem Zahlenstrahl den richtigen Strich antippen. */
export type NumberLineTask = TaskBase & {
  format: "number-line";
  from: number;
  to: number;
  step: number;
  /** Welche Striche beschriftet sind. */
  labels: number[];
  target: number;
};

/** Zahlenmauer: Zeilen von OBEN nach unten, genau ein Feld ist `null`. */
export type WallTask = TaskBase & {
  format: "wall";
  rows: (number | null)[][];
  answer: number;
};

/** Größer, kleiner oder gleich? Seiten können Zahlen oder Terme sein. */
export type CompareTask = TaskBase & {
  format: "compare";
  left: string;
  right: string;
  answer: "<" | ">" | "=";
};

export type Task = ChoiceTask | InputTask | TensOnesTask | NumberLineTask | WallTask | CompareTask;

/** `Omit`, das über jede Variante einer Union einzeln läuft. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** Was ein Generator liefert — ID, Kompetenz und Stufe setzt die Engine. */
export type TaskDraft = DistributiveOmit<Task, "id" | "skillId" | "level">;
