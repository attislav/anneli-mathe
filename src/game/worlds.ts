// Die Welten und ihre Pfad-Knoten — Quelle der Wahrheit für den Pfad.
//
// Knoten-Arten:
//   lesson  — 7 Aufgaben aus einer Kompetenz, 1–3 Sterne
//   trick   — erst ein Rechentrick zum Durchtippen, dann eine Lektion dazu
//   review  — Mischung aus allen Kompetenzen der Welt, die schwächsten öfter
//   chest   — Schatzkiste: Ausmalbild + Sticker + Münzen
//   boss    — Weltende: Aufgaben sind Angriffe, Sieg öffnet die nächste Welt

import type { WorldId } from "./skills";

export type NodeKind = "lesson" | "trick" | "review" | "chest" | "boss";

export type PathNode = {
  id: string;
  kind: NodeKind;
  title: string;
  skills: string[];
  /** Für Schatzkisten und Bosse: welches Ausmalbild drin ist. */
  coloring?: string;
};

export type Boss = { name: string; color: string; shade: string };

export type World = {
  id: WorldId;
  index: number;
  name: string;
  tagline: string;
  /** Sterne, die man insgesamt braucht, um die Welt zu betreten. */
  starsToEnter: number;
  theme: { ground: string; band: string; bandShade: string; deco: string; decoDark: string };
  boss: Boss;
  nodes: PathNode[];
};

export const WORLDS: World[] = [
  {
    id: "start",
    index: 0,
    name: "Startinsel",
    tagline: "Rechnen bis 20",
    starsToEnter: 0,
    theme: { ground: "#FFF0C9", band: "#FF9F1C", bandShade: "#D97B00", deco: "#FFD98A", decoDark: "#F2B84B" },
    boss: { name: "Krabbe Knacks", color: "#FF5D5D", shade: "#C93B3B" },
    nodes: [
      { id: "start-1", kind: "lesson", title: "Zahlenfreunde", skills: ["freunde10"] },
      { id: "start-2", kind: "lesson", title: "Plus & Minus", skills: ["plus20"] },
      { id: "start-3", kind: "chest", title: "Schatzkiste", skills: [], coloring: "fisch" },
      { id: "start-4", kind: "trick", title: "Erst zur 10", skills: ["uebergang20"] },
      { id: "start-5", kind: "lesson", title: "Über die 10", skills: ["uebergang20"] },
      { id: "start-6", kind: "lesson", title: "Verdoppeln", skills: ["doppelt"] },
      { id: "start-7", kind: "review", title: "Gemischt", skills: ["freunde10", "plus20", "uebergang20", "doppelt"] },
      { id: "start-boss", kind: "boss", title: "Krabbe Knacks", skills: ["freunde10", "plus20", "uebergang20", "doppelt"], coloring: "schmetterling" },
    ],
  },
  {
    id: "wald",
    index: 1,
    name: "Zahlenwald",
    tagline: "Zahlen bis 100",
    starsToEnter: 10,
    theme: { ground: "#CFF5D6", band: "#2BB673", bandShade: "#1E8F57", deco: "#8FDCA0", decoDark: "#5FBF77" },
    boss: { name: "Eulenkönig Uhu", color: "#3B2F80", shade: "#241B5C" },
    nodes: [
      { id: "wald-1", kind: "trick", title: "Zehner & Einer", skills: ["zehnerEiner"] },
      { id: "wald-2", kind: "lesson", title: "Zahlenstrahl", skills: ["zahlenstrahl"] },
      { id: "wald-3", kind: "lesson", title: "Größer, kleiner?", skills: ["vergleichen"] },
      { id: "wald-4", kind: "chest", title: "Schatzkiste", skills: [], coloring: "eule" },
      { id: "wald-5", kind: "lesson", title: "Nachbarzahlen", skills: ["nachbarn"] },
      { id: "wald-6", kind: "lesson", title: "Zahlenreihen", skills: ["reihen"] },
      { id: "wald-7", kind: "lesson", title: "Gerade & ungerade", skills: ["geradeUngerade"] },
      { id: "wald-8", kind: "review", title: "Gemischt", skills: ["zehnerEiner", "zahlenstrahl", "vergleichen", "nachbarn", "reihen", "geradeUngerade"] },
      { id: "wald-boss", kind: "boss", title: "Eulenkönig Uhu", skills: ["zehnerEiner", "zahlenstrahl", "vergleichen", "nachbarn", "reihen"], coloring: "drache" },
    ],
  },
  {
    id: "strand",
    index: 2,
    name: "Plus-Minus-Strand",
    tagline: "Rechnen bis 100",
    starsToEnter: 26,
    theme: { ground: "#D3F1FF", band: "#2A9FD9", bandShade: "#1C7BB0", deco: "#FFE7A8", decoDark: "#9ADCF7" },
    boss: { name: "Pirat Plumps", color: "#7A4E2D", shade: "#55341C" },
    nodes: [
      { id: "strand-1", kind: "lesson", title: "Mit Zehnern", skills: ["zehnerPlus"] },
      { id: "strand-2", kind: "lesson", title: "Einer dazu", skills: ["einerPlus"] },
      { id: "strand-3", kind: "chest", title: "Schatzkiste", skills: [], coloring: "rakete" },
      { id: "strand-4", kind: "lesson", title: "Ergänzen", skills: ["ergaenzen"] },
      { id: "strand-5", kind: "lesson", title: "Zahlenmauern", skills: ["mauern"] },
      { id: "strand-6", kind: "trick", title: "Am Zehner Pause", skills: ["uebergang100"] },
      { id: "strand-7", kind: "lesson", title: "Über den Zehner", skills: ["uebergang100"] },
      { id: "strand-8", kind: "review", title: "Gemischt", skills: ["zehnerPlus", "einerPlus", "ergaenzen", "mauern", "uebergang100"] },
      { id: "strand-boss", kind: "boss", title: "Pirat Plumps", skills: ["zehnerPlus", "einerPlus", "ergaenzen", "uebergang100"], coloring: "pilzhaus" },
    ],
  },
];

/** Welten, die als Nebel-Vorschau am Pfadende warten. */
export const COMING_SOON = ["Vulkaninsel", "Knobel-Labor", "Piratenhafen", "Einmaleins-Zirkus", "Bäckerei", "Uhrenschloss"];

export function findNode(nodeId: string): { world: World; node: PathNode; index: number } | null {
  for (const world of WORLDS) {
    const index = world.nodes.findIndex((n) => n.id === nodeId);
    if (index >= 0) return { world, node: world.nodes[index], index };
  }
  return null;
}

export function getWorld(id: WorldId): World {
  return WORLDS.find((w) => w.id === id)!;
}

/** Knoten, die Sterne geben können (für Sternen-Summen). */
export function starNodes(world: World): PathNode[] {
  return world.nodes.filter((n) => n.kind !== "chest");
}
