// Source of truth for the 6 bridges in Sky Kingdom (Kapitel 1).
// See memory/story_concept_chapter1.md for the full design rationale.

export type Skill =
  | "counting"
  | "addition"
  | "subtraction"
  | "compare"
  | "neighbors"
  | "tens";

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
    skill: "counting",
    skillLabel: "Zählen bis 10",
    description:
      "Eine kleine, breite Brücke aus losen Steinen. Anneli muss zählen, wie viele fehlen.",
    bookHint: "Schau genau hin und zähle mit dem Finger. Eins. Zwei. Drei.",
    totalTasks: 4,
  },
  {
    id: "holzplanken",
    order: 2,
    name: "Holzplankenbrücke",
    skill: "addition",
    skillLabel: "Plus bis 10",
    description:
      "Eine Brücke aus Holzbrettern. Manche fehlen — Anneli rechnet aus, wie viele dazu müssen.",
    bookHint: "Plus heißt: dazulegen. Was haben wir, was brauchen wir, was fehlt?",
    totalTasks: 5,
  },
  {
    id: "bruechig",
    order: 3,
    name: "Brüchige Brücke",
    skill: "subtraction",
    skillLabel: "Minus bis 10",
    description:
      "Eine alte Brücke, von der Steine herunterfallen. Anneli rechnet, wie viele übrig bleiben.",
    bookHint: "Minus heißt: wegnehmen. Was war da, was ist weg, was bleibt?",
    totalTasks: 5,
  },
  {
    id: "waage",
    order: 4,
    name: "Waagebrücke",
    skill: "compare",
    skillLabel: "Vergleichen (größer, kleiner, gleich)",
    description:
      "Zwei Inseln, eine Waage, eine Frage: welche Seite trägt mehr? Anneli vergleicht Zahlen.",
    bookHint: "Größer heißt: mehr. Kleiner heißt: weniger. Gleich heißt: dasselbe.",
    totalTasks: 4,
  },
  {
    id: "nachbarn",
    order: 5,
    name: "Nachbarsbrücke",
    skill: "neighbors",
    skillLabel: "Nachbarzahlen (+1, −1)",
    description:
      "Eine Brücke aus nummerierten Bohlen — die Nachbarn der gefragten Zahl müssen gefunden werden.",
    bookHint: "Vor und nach. Eins davor, eins danach. Wie Geschwister einer Zahl.",
    totalTasks: 4,
  },
  {
    id: "zehner",
    order: 6,
    name: "Zehnerbrücke",
    skill: "tens",
    skillLabel: "Zerlegung der 10 & Zehnerübergang",
    description:
      "Die letzte, größte Brücke. Sie trägt nur, wenn die Zahlen zusammen genau 10 ergeben.",
    bookHint: "Die Zehn ist ein guter Freund. Was fehlt zur Zehn? Wie viel ist drüber?",
    totalTasks: 6,
  },
];

export function getBridge(id: string): Bridge | undefined {
  return BRIDGES.find((b) => b.id === id);
}
