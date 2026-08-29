// Die Module des Kopfrechen-Trainings — Quelle der Wahrheit für Reihenfolge,
// Zahlenraum, Tricks und Rundenlänge.
//
// Aufbau-Logik (Klasse 2 → Klasse 3): der Zahlenraum wächst Modul für Modul.
//   1–3  kleiner Zahlenraum bis 20 (Zerlegung, Zehnerübergang)
//   4–5  Brücke in den Hunderterraum (Verdoppeln, volle Zehner)
//   6–7  Plus/Minus bis 100 inkl. Rechentricks
//   8–10 Einmaleins und Teilen
//
// Jedes Modul bringt mindestens einen TRICK mit: eine Strategie, die das
// Kopfrechnen wirklich schneller macht. Der Trick wird VOR der Übungsrunde
// erklärt und ist während der Runde jederzeit wieder aufrufbar. Die Hints
// der einzelnen Aufgaben wenden denselben Trick auf die konkreten Zahlen an
// — Erklärung und Übung sprechen also dieselbe Sprache.

export type TrainingModuleId =
  | "zahlenfreunde"
  | "bis20"
  | "zehnersprung"
  | "verdoppeln"
  | "volle-zehner"
  | "bis100"
  | "fast-zehner"
  | "einmaleins-kern"
  | "einmaleins"
  | "teilen";

/** Pastell-Akzent pro Modul — mappt in der UI auf die CSS-Variablen. */
export type Accent = "mint" | "lavender" | "peach" | "turquoise" | "honey" | "rose";

export type Trick = {
  /** Name des Tricks, wie ein Kind ihn sich merken kann. */
  title: string;
  /** 1–2 Sätze: was der Trick tut und warum er hilft. */
  idea: string;
  /** Beispiel-Aufgabe, groß dargestellt. */
  example: string;
  /** Schritt-für-Schritt am Beispiel — kurze Zeilen, eine pro Denkschritt. */
  steps: string[];
};

export type TrainingModule = {
  id: TrainingModuleId;
  order: number;
  title: string;
  /** Zahlenraum-Label für die Modul-Karte, z.B. „bis 20". */
  range: string;
  /** Einordnung für Eltern, z.B. „Klasse 2 · Anfang". */
  grade: string;
  /** 1–2 Sätze, was hier geübt wird — kindgerecht formuliert. */
  summary: string;
  tricks: Trick[];
  /** Aufgaben pro Runde. */
  taskCount: number;
  accent: Accent;
};

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "zahlenfreunde",
    order: 1,
    title: "Zahlenfreunde bis 10",
    range: "bis 10",
    grade: "Klasse 2 · Anfang",
    summary:
      "Welche zwei Zahlen ergeben zusammen 10? Wer die Paare im Kopf hat, rechnet später alles schneller.",
    taskCount: 10,
    accent: "mint",
    tricks: [
      {
        title: "Die Zehner-Paare",
        idea:
          "Zu jeder Zahl gibt es genau einen Freund, mit dem sie 10 ergibt. Diese fünf Paare lernst du auswendig — dann musst du nie wieder zählen.",
        example: "1+9 · 2+8 · 3+7 · 4+6 · 5+5",
        steps: [
          "Halte beide Hände hoch: das sind 10 Finger.",
          "Klappe 3 Finger weg — wie viele stehen noch? 7.",
          "Also: 3 und 7 sind Zahlenfreunde.",
          "Merke dir die fünf Paare wie fünf beste Freunde.",
        ],
      },
    ],
  },
  {
    id: "bis20",
    order: 2,
    title: "Plus und Minus bis 20",
    range: "bis 20",
    grade: "Klasse 2 · Anfang",
    summary:
      "Rechnen im Zwanzigerraum, ohne über die Zehn zu springen. Die Zehn bleibt stehen, du rechnest nur mit den Einern.",
    taskCount: 10,
    accent: "lavender",
    tricks: [
      {
        title: "Die Zehn bleibt stehen",
        idea:
          "Bei Aufgaben wie 13 + 5 passiert mit der Zehn gar nichts. Du rechnest nur mit den Einern und setzt die Zehn wieder davor.",
        example: "13 + 5",
        steps: [
          "Zerlege 13 in 10 und 3.",
          "Rechne nur die Einer: 3 + 5 = 8.",
          "Setze die Zehn wieder davor: 18.",
        ],
      },
    ],
  },
  {
    id: "zehnersprung",
    order: 3,
    title: "Über die Zehn springen",
    range: "bis 20",
    grade: "Klasse 2 · Mitte",
    summary:
      "8 + 7 oder 15 − 8: Aufgaben, bei denen du über die Zehn hinweg musst. Mit dem Zwischenstopp auf der 10 geht das ganz leicht.",
    taskCount: 10,
    accent: "peach",
    tricks: [
      {
        title: "Zwischenstopp auf der 10",
        idea:
          "Die 10 ist wie ein Rastplatz. Du gehst erst bis zur 10 — und erst dann den Rest.",
        example: "8 + 7",
        steps: [
          "Wie weit ist es von 8 bis 10? 2 Schritte.",
          "Zerlege die 7 in 2 und 5.",
          "8 + 2 = 10.",
          "10 + 5 = 15.",
        ],
      },
      {
        title: "Rückwärts genauso",
        idea:
          "Beim Minus machst du den Zwischenstopp auch auf der 10 — nur rückwärts.",
        example: "15 − 8",
        steps: [
          "Von 15 bis zur 10 sind es 5 zurück.",
          "Zerlege die 8 in 5 und 3.",
          "15 − 5 = 10.",
          "10 − 3 = 7.",
        ],
      },
    ],
  },
  {
    id: "verdoppeln",
    order: 4,
    title: "Verdoppeln und Halbieren",
    range: "bis 100",
    grade: "Klasse 2 · Mitte",
    summary:
      "Das Doppelte und die Hälfte hast du blitzschnell im Kopf. Und mit den Nachbaraufgaben löst du damit noch viel mehr.",
    taskCount: 10,
    accent: "turquoise",
    tricks: [
      {
        title: "Nachbaraufgaben",
        idea:
          "Wenn du die Verdopplungen kennst, kennst du auch alle Aufgaben direkt daneben. 6 + 7 ist nur eins mehr als 6 + 6.",
        example: "6 + 7",
        steps: [
          "Suche die Verdopplung in der Nähe: 6 + 6 = 12.",
          "7 ist eins mehr als 6.",
          "Also 12 + 1 = 13.",
        ],
      },
      {
        title: "Große Zahlen halbieren",
        idea:
          "Halbiere erst die Zehner, dann die Einer — und zähle beides zusammen.",
        example: "Die Hälfte von 48",
        steps: [
          "Zerlege 48 in 40 und 8.",
          "Die Hälfte von 40 ist 20.",
          "Die Hälfte von 8 ist 4.",
          "20 + 4 = 24.",
        ],
      },
    ],
  },
  {
    id: "volle-zehner",
    order: 5,
    title: "Volle Zehner bis 100",
    range: "bis 100",
    grade: "Klasse 2 · Mitte",
    summary:
      "30 + 40, 90 − 50: Mit vollen Zehnern rechnest du genauso wie mit kleinen Zahlen — nur mit einer Null hinten dran.",
    taskCount: 10,
    accent: "honey",
    tricks: [
      {
        title: "Rechne klein, häng die Null an",
        idea:
          "3 Zehner plus 4 Zehner sind 7 Zehner. Du rechnest also 3 + 4 und hängst die Null wieder an.",
        example: "30 + 40",
        steps: [
          "Denk dir die Nullen weg: 3 + 4.",
          "3 + 4 = 7.",
          "Null wieder dran: 70.",
        ],
      },
    ],
  },
  {
    id: "bis100",
    order: 6,
    title: "Plus und Minus bis 100",
    range: "bis 100",
    grade: "Klasse 2 · Ende",
    summary:
      "Jetzt kommt der ganze Hunderterraum. Du rechnest in zwei Schritten: erst die Zehner, dann die Einer.",
    taskCount: 10,
    accent: "lavender",
    tricks: [
      {
        title: "Erst Zehner, dann Einer",
        idea:
          "Zerlege die zweite Zahl in Zehner und Einer und rechne in zwei Schritten. Nie alles auf einmal.",
        example: "43 + 25",
        steps: [
          "Zerlege 25 in 20 und 5.",
          "43 + 20 = 63.",
          "63 + 5 = 68.",
        ],
      },
      {
        title: "Am Zehner Pause machen",
        idea:
          "Wenn du über einen Zehner musst, halte kurz auf dem Zehner an — genau wie bei der 10.",
        example: "36 + 8",
        steps: [
          "Von 36 bis 40 sind es 4.",
          "Zerlege 8 in 4 und 4.",
          "36 + 4 = 40.",
          "40 + 4 = 44.",
        ],
      },
    ],
  },
  {
    id: "fast-zehner",
    order: 7,
    title: "Der Fast-Zehner-Trick",
    range: "bis 100",
    grade: "Klasse 3 · Anfang",
    summary:
      "Plus 9 ist schwer? Plus 10 ist leicht. Rechne einfach mit dem glatten Zehner und korrigiere danach.",
    taskCount: 10,
    accent: "rose",
    tricks: [
      {
        title: "Erst zu viel, dann zurück",
        idea:
          "9 ist fast 10. Rechne + 10 (das kannst du blind) und nimm hinterher 1 wieder weg.",
        example: "47 + 9",
        steps: [
          "Rechne 47 + 10 = 57.",
          "Du hast 1 zu viel dazugetan.",
          "57 − 1 = 56.",
        ],
      },
      {
        title: "Beim Minus andersherum",
        idea:
          "Minus 9 heißt: minus 10 — und dann 1 wieder zurückgeben.",
        example: "62 − 9",
        steps: [
          "Rechne 62 − 10 = 52.",
          "Du hast 1 zu viel weggenommen.",
          "52 + 1 = 53.",
        ],
      },
    ],
  },
  {
    id: "einmaleins-kern",
    order: 8,
    title: "Kernaufgaben im Einmaleins",
    range: "2er · 5er · 10er",
    grade: "Klasse 3 · Anfang",
    summary:
      "Die drei leichtesten Reihen zuerst. Wer sie sicher kann, hat den Schlüssel für das ganze Einmaleins.",
    taskCount: 10,
    accent: "mint",
    tricks: [
      {
        title: "Die 5er ist die halbe 10er",
        idea:
          "Die 10er-Reihe kannst du sofort. Und die 5er-Reihe ist immer genau die Hälfte davon.",
        example: "5 · 7",
        steps: [
          "Rechne zuerst 10 · 7 = 70.",
          "Nimm die Hälfte davon.",
          "Die Hälfte von 70 ist 35.",
        ],
      },
      {
        title: "Malnehmen ist Springen",
        idea:
          "2 · 8 heißt: zwei Achter-Sprünge. Malnehmen ist nichts anderes als mehrmals dieselbe Zahl dazuzählen.",
        example: "2 · 8",
        steps: [
          "Ein Sprung: 8.",
          "Noch ein Sprung: 8 + 8.",
          "Das ist die Verdopplung: 16.",
        ],
      },
    ],
  },
  {
    id: "einmaleins",
    order: 9,
    title: "Das ganze Einmaleins",
    range: "1×1 bis 10×10",
    grade: "Klasse 3 · Mitte",
    summary:
      "Jetzt alle Reihen. Mit Tauschaufgabe, Nachbaraufgabe und dem 9er-Trick musst du viel weniger auswendig lernen, als es aussieht.",
    taskCount: 12,
    accent: "turquoise",
    tricks: [
      {
        title: "Tauschaufgabe",
        idea:
          "7 · 3 und 3 · 7 haben dasselbe Ergebnis. Dreh die Aufgabe immer so, dass sie für dich leichter ist.",
        example: "3 · 8",
        steps: [
          "3 · 8 ist dasselbe wie 8 · 3.",
          "8 · 3 = 24.",
          "Also ist auch 3 · 8 = 24.",
        ],
      },
      {
        title: "Nachbaraufgabe",
        idea:
          "Kennst du 5 · 7, dann kennst du auch 6 · 7 — es ist nur eine Siebener-Reihe mehr.",
        example: "6 · 7",
        steps: [
          "Nimm die Kernaufgabe: 5 · 7 = 35.",
          "6 · 7 ist eine 7 mehr.",
          "35 + 7 = 42.",
        ],
      },
      {
        title: "Der 9er-Trick",
        idea:
          "9 ist fast 10. Rechne mit der 10 und nimm die Zahl einmal wieder weg.",
        example: "9 · 6",
        steps: [
          "Rechne 10 · 6 = 60.",
          "Nimm eine 6 wieder weg.",
          "60 − 6 = 54.",
        ],
      },
    ],
  },
  {
    id: "teilen",
    order: 10,
    title: "Teilen und Umkehraufgaben",
    range: "1×1 rückwärts",
    grade: "Klasse 3 · Mitte",
    summary:
      "Teilen musst du gar nicht extra lernen — du suchst einfach die passende Malaufgabe.",
    taskCount: 10,
    accent: "peach",
    tricks: [
      {
        title: "Such die Malaufgabe",
        idea:
          "Jede Geteilt-Aufgabe hat eine Mal-Aufgabe als Zwilling. Frage dich: mal wie viel ergibt das?",
        example: "24 : 4",
        steps: [
          "Frage dich: 4 · wie viel = 24?",
          "Geh die 4er-Reihe: 4, 8, 12, 16, 20, 24.",
          "Das waren 6 Sprünge.",
          "Also 24 : 4 = 6.",
        ],
      },
    ],
  },
];

export function getTrainingModule(id: string): TrainingModule | undefined {
  return TRAINING_MODULES.find((m) => m.id === id);
}

/** Nächstes Modul in der Reihenfolge — für „Weiter üben" nach einer Runde. */
export function nextTrainingModule(id: string): TrainingModule | undefined {
  const current = getTrainingModule(id);
  if (!current) return undefined;
  return TRAINING_MODULES.find((m) => m.order === current.order + 1);
}
