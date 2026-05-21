// Source of truth for the 6 bridges in Sky Kingdom (Kapitel 1).
// See memory/story_concept_chapter1.md for the full design rationale.
// Schwierigkeitsstufe: Übergang Klasse 1 → Klasse 2.

export type Skill =
  | "counting20"
  | "addition20"
  | "subtraction20"
  | "compare100"
  | "tensNeighbors"
  | "doubleHalf";

export type Bridge = {
  id: string;
  order: number;
  name: string;
  skill: Skill;
  skillLabel: string;
  description: string;
  bookHint: string;
  totalTasks: number;
};

export const BRIDGES: Bridge[] = [
  {
    id: "steinzaehl",
    order: 1,
    name: "Steinzählbrücke",
    skill: "counting20",
    skillLabel: "Mengen erfassen bis 20",
    description:
      "Eine breite Brücke aus Steinen. Anneli erkennt schnell, wie viele es sind — ohne einzeln zu zählen.",
    bookHint: "Schau die Gruppen an. Fünfer, Zehner. Dann zählst du nicht mehr — du siehst es.",
    totalTasks: 4,
  },
  {
    id: "holzplanken",
    order: 2,
    name: "Holzplankenbrücke",
    skill: "addition20",
    skillLabel: "Plus bis 20 mit Zehnerübergang",
    description:
      "Eine Brücke aus Holzbrettern. Manche fehlen — Anneli rechnet aus, wie viele dazu müssen, auch über die Zehn hinweg.",
    bookHint: "Erst zur Zehn ergänzen, dann den Rest dazu. 8 + 7 = 8 + 2 + 5 = 10 + 5.",
    totalTasks: 5,
  },
  {
    id: "bruechig",
    order: 3,
    name: "Brüchige Brücke",
    skill: "subtraction20",
    skillLabel: "Minus bis 20 mit Zehnerübergang",
    description:
      "Eine alte Brücke, Steine fallen herunter. Anneli rechnet, wie viele übrig bleiben — auch über die Zehn zurück.",
    bookHint: "Erst zur Zehn runter, dann den Rest. 15 − 8 = 15 − 5 − 3 = 10 − 3.",
    totalTasks: 5,
  },
  {
    id: "waage",
    order: 4,
    name: "Waagebrücke",
    skill: "compare100",
    skillLabel: "Zahlen vergleichen bis 100",
    description:
      "Zwei Inseln, eine große Waage, eine Frage: welche Seite wiegt mehr? Anneli vergleicht zweistellige Zahlen.",
    bookHint: "Schau zuerst die Zehner an. Bei gleichen Zehnern entscheiden die Einer.",
    totalTasks: 4,
  },
  {
    id: "nachbarn",
    order: 5,
    name: "Nachbarsbrücke",
    skill: "tensNeighbors",
    skillLabel: "Zehnernachbarn im Hunderterraum",
    description:
      "Eine Brücke aus nummerierten Bohlen — Anneli findet die Zehnernachbarn (die nächsten Zehner davor und danach).",
    bookHint: "Welcher Zehner ist gleich vor mir, welcher gleich nach mir? 47: davor 40, danach 50.",
    totalTasks: 4,
  },
  {
    id: "zehner",
    order: 6,
    name: "Spiegelbrücke",
    skill: "doubleHalf",
    skillLabel: "Verdoppeln und Halbieren bis 100",
    description:
      "Die letzte Brücke ist ein Spiegel: was du auf der einen Seite legst, muss auf der anderen verdoppelt oder halbiert sein.",
    bookHint: "Verdoppeln: dieselbe Zahl noch mal dazu. Halbieren: in zwei gleiche Teile.",
    totalTasks: 6,
  },
];

export function getBridge(id: string): Bridge | undefined {
  return BRIDGES.find((b) => b.id === id);
}
