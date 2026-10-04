// Grundtypen der Spiel-Engine.
//
// Eine Aufgabe (`Task`) ist reine Daten: Zahlen, Lösung, Tipp, Rechenweg
// und das FORMAT, in dem sie gestellt wird. Welche Komponente sie rendert,
// entscheidet allein `format` — die Generatoren wissen nichts von React.

/** Schwierigkeit 1 (sehr leicht) bis 5 (Meister). */
export type Level = 1 | 2 | 3 | 4 | 5;

export type Format = "choice" | "input" | "tens-ones" | "number-line" | "wall" | "compare" | "money-build" | "share" | "clock-set" | "mirror" | "pattern" | "ruler" | "bar-build";

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

/** Bild über der Aufgabe — z. B. Münzen und Scheine zum Zählen (Werte in Cent). */
export type Visual = { kind: "money"; items: number[] } | { kind: "dots"; rows: number; cols: number } | { kind: "clock"; hour: number; minute: number }
  | { kind: "shapes"; items: ShapeItem[]; scatter?: boolean }
  | { kind: "solid"; solid: SolidId }
  /** Ein Gegenstand liegt am Lineal, von `from` bis `to` (cm). */
  | { kind: "ruler"; from: number; to: number; max: number; item: RulerItem }
  /** Strichliste: pro Zeile ein Ding und wie oft es gezählt wurde. */
  | { kind: "tally"; rows: DataRow[] }
  /** Säulendiagramm. `step`: Wert pro Kästchen. */
  | { kind: "bars"; rows: DataRow[]; step: number; max: number };

export type DataIcon = "apfel" | "banane" | "birne" | "kirsche" | "traube" | "hund" | "katze" | "hase" | "vogel" | "sonne" | "regen" | "wolke";
/** Eine Zeile Daten für Strichliste oder Diagramm. */
export type DataRow = { label: string; icon: DataIcon; value: number };

export type RulerItem = "stift" | "band" | "wurm" | "nagel";

export type ShapeId = "kreis" | "dreieck" | "quadrat" | "rechteck" | "fuenfeck" | "sechseck";
export type SolidId = "wuerfel" | "quader" | "kugel" | "zylinder" | "kegel" | "pyramide";
/** Eine Form mit Farbe (und Größe 1 = normal). */
export type ShapeItem = { shape: ShapeId; color: string; size?: number };

/** Antwort antippen. `term` ist die große Aufgabe, z.B. „38 + 7 = ?". */
export type ChoiceTask = TaskBase & {
  format: "choice";
  term?: string;
  visual?: Visual;
  options: string[];
  answer: string;
};

/** Zahl eintippen. `term` enthält genau ein „?" als Lücke. */
export type InputTask = TaskBase & {
  format: "input";
  term: string;
  visual?: Visual;
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
  /** Werte der Seiten, wenn sie keine Rechenterme sind (z. B. „2 € 5 ct"). */
  values?: [number, number];
};

/** Geldbetrag mit Münzen und Scheinen legen. Alles in Cent. */
export type MoneyBuildTask = TaskBase & {
  format: "money-build";
  target: number;
  /** Welche Münzen/Scheine zur Auswahl stehen. */
  pieces: number[];
};

/** Gebäck gerecht auf Teller verteilen. Richtig: alles verteilt, überall gleich viel. */
export type ShareTask = TaskBase & {
  format: "share";
  total: number;
  plates: number;
  item: Treat;
};

export type Treat = "keks" | "muffin" | "brezel";

/** Spiegeln im Gitter: links ist ein Muster, rechts soll das Spiegelbild hin. */
export type MirrorTask = TaskBase & {
  format: "mirror";
  rows: number;
  /** Spalten pro Hälfte. */
  half: number;
  /** Ausgemalte Kästchen der linken Hälfte als [Zeile, Spalte]. */
  cells: [number, number][];
  color: string;
};

/** Muster fortsetzen: Was kommt als Nächstes? `answer` ist der Index in `options`. */
export type PatternTask = TaskBase & {
  format: "pattern";
  items: ShapeItem[];
  options: ShapeItem[];
  answer: number;
};

/** Am Lineal eine Linie zeichnen: bis zum richtigen Strich tippen. */
export type RulerTask = TaskBase & {
  format: "ruler";
  target: number;
  max: number;
};

/** Säulendiagramm zeichnen: Säulen auf die Werte aus der Strichliste ziehen. */
export type BarBuildTask = TaskBase & {
  format: "bar-build";
  rows: DataRow[];
  step: number;
  max: number;
};

/** Zeiger einer Uhr stellen. `step`: in welchen Minuten-Schritten der Minutenzeiger springt. */
export type ClockSetTask = TaskBase & {
  format: "clock-set";
  hour: number;
  minute: number;
  step: 5 | 15 | 30 | 60;
};

export type Task = ChoiceTask | InputTask | TensOnesTask | NumberLineTask | WallTask | CompareTask | MoneyBuildTask | ShareTask | ClockSetTask | MirrorTask | PatternTask | RulerTask | BarBuildTask;

/** `Omit`, das über jede Variante einer Union einzeln läuft. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** Was ein Generator liefert — ID, Kompetenz und Stufe setzt die Engine. */
export type TaskDraft = DistributiveOmit<Task, "id" | "skillId" | "level">;
