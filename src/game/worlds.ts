// Die Welten und ihre Pfad-Knoten — Quelle der Wahrheit für den Pfad.
//
// Knoten-Arten:
//   lesson  — 7 Aufgaben aus einer Kompetenz, 1–3 Sterne
//   trick   — erst ein Rechentrick zum Durchtippen, dann eine Lektion dazu
//   review  — Mischung aus allen Kompetenzen der Welt, die schwächsten öfter
//   chest   — Schatzkiste: Ausmalbild + Sticker + Münzen
//   boss    — Weltende: Aufgaben sind Angriffe, Sieg öffnet die nächste Welt
//
// Jede Welt hat zwei Runden: erst lernt man jede Kompetenz kennen, dann
// kommt sie mit `boost: 1` noch einmal — eine Stufe schwerer (Profi-Niveau
// schon auf Bronze). So wird der Pfad lang, ohne sich zu wiederholen.

import type { WorldId } from "./skills";
import type { Level, TaskDraft } from "./types";

export type NodeKind = "lesson" | "trick" | "review" | "chest" | "boss";

export type PathNode = {
  id: string;
  kind: NodeKind;
  title: string;
  skills: string[];
  /** Für Schatzkisten und Bosse: welches Ausmalbild drin ist. */
  coloring?: string;
  /** Zweite Runde: Aufgaben eine Stufe schwerer. */
  boost?: 1;
  /** Übungskiste: feste Aufgaben statt neu erzeugter. */
  practice?: (TaskDraft & { skillId: string; level: Level })[];
};

const chest = (id: string, coloring?: string): PathNode => ({ id, kind: "chest", title: "Schatzkiste", skills: [], coloring });
const round2 = (id: string, title: string, skills: string[]): PathNode => ({ id, kind: "lesson", title, skills, boost: 1 });
const mix2 = (id: string, skills: string[]): PathNode => ({ id, kind: "review", title: "Großes Gemisch", skills, boost: 1 });

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
      round2("start-8", "Zahlenfreunde 2", ["freunde10"]),
      chest("start-9"),
      round2("start-10", "Plus & Minus 2", ["plus20"]),
      round2("start-11", "Über die 10 2", ["uebergang20"]),
      round2("start-12", "Verdoppeln 2", ["doppelt"]),
      chest("start-13"),
      mix2("start-14", ["freunde10", "plus20", "uebergang20", "doppelt"]),
      { id: "start-boss", kind: "boss", title: "Krabbe Knacks", skills: ["freunde10", "plus20", "uebergang20", "doppelt"], coloring: "schmetterling" },
    ],
  },
  {
    id: "wald",
    index: 1,
    name: "Zahlenwald",
    tagline: "Zahlen bis 100",
    starsToEnter: 20,
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
      round2("wald-9", "Zehner & Einer 2", ["zehnerEiner"]),
      chest("wald-10"),
      round2("wald-11", "Zahlenstrahl 2", ["zahlenstrahl"]),
      round2("wald-12", "Größer, kleiner? 2", ["vergleichen"]),
      round2("wald-13", "Nachbarzahlen 2", ["nachbarn"]),
      round2("wald-14", "Zahlenreihen 2", ["reihen"]),
      chest("wald-15"),
      mix2("wald-16", ["zehnerEiner", "zahlenstrahl", "vergleichen", "nachbarn", "reihen", "geradeUngerade"]),
      { id: "wald-boss", kind: "boss", title: "Eulenkönig Uhu", skills: ["zehnerEiner", "zahlenstrahl", "vergleichen", "nachbarn", "reihen"], coloring: "drache" },
    ],
  },
  {
    id: "strand",
    index: 2,
    name: "Plus-Minus-Strand",
    tagline: "Rechnen bis 100",
    starsToEnter: 42,
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
      round2("strand-9", "Mit Zehnern 2", ["zehnerPlus"]),
      round2("strand-10", "Einer dazu 2", ["einerPlus"]),
      chest("strand-11"),
      round2("strand-12", "Ergänzen 2", ["ergaenzen"]),
      round2("strand-13", "Zahlenmauern 2", ["mauern"]),
      round2("strand-14", "Über den Zehner 2", ["uebergang100"]),
      chest("strand-15"),
      mix2("strand-16", ["zehnerPlus", "einerPlus", "ergaenzen", "mauern", "uebergang100"]),
      { id: "strand-boss", kind: "boss", title: "Pirat Plumps", skills: ["zehnerPlus", "einerPlus", "ergaenzen", "uebergang100"], coloring: "pilzhaus" },
    ],
  },
  {
    id: "hafen",
    index: 3,
    name: "Piratenhafen",
    tagline: "Rechnen mit Geld",
    starsToEnter: 64,
    theme: { ground: "#D6F3F1", band: "#0E9AA7", bandShade: "#0A7580", deco: "#F2C27B", decoDark: "#8FD3CF" },
    boss: { name: "Papagei Polly", color: "#2BB673", shade: "#1E8F57" },
    nodes: [
      { id: "hafen-1", kind: "trick", title: "Große zuerst", skills: ["geldZaehlen"] },
      { id: "hafen-2", kind: "lesson", title: "Geld legen", skills: ["geldLegen"] },
      { id: "hafen-3", kind: "lesson", title: "Euro und Cent", skills: ["euroCent"] },
      { id: "hafen-4", kind: "chest", title: "Schatzkiste", skills: [], coloring: "schiff" },
      { id: "hafen-5", kind: "lesson", title: "Was ist mehr?", skills: ["geldVergleichen"] },
      { id: "hafen-6", kind: "trick", title: "Rückgeld", skills: ["einkaufen"] },
      { id: "hafen-7", kind: "lesson", title: "Einkaufen", skills: ["einkaufen"] },
      { id: "hafen-8", kind: "review", title: "Gemischt", skills: ["geldZaehlen", "geldLegen", "euroCent", "geldVergleichen", "einkaufen"] },
      round2("hafen-9", "Geld zählen 2", ["geldZaehlen"]),
      round2("hafen-10", "Geld legen 2", ["geldLegen"]),
      chest("hafen-11"),
      round2("hafen-12", "Euro und Cent 2", ["euroCent"]),
      round2("hafen-13", "Was ist mehr? 2", ["geldVergleichen"]),
      round2("hafen-14", "Einkaufen 2", ["einkaufen"]),
      chest("hafen-15"),
      mix2("hafen-16", ["geldZaehlen", "geldLegen", "euroCent", "geldVergleichen", "einkaufen"]),
      { id: "hafen-boss", kind: "boss", title: "Papagei Polly", skills: ["geldZaehlen", "euroCent", "geldVergleichen", "einkaufen"], coloring: "papagei" },
    ],
  },
  {
    id: "zirkus",
    index: 4,
    name: "Einmaleins-Zirkus",
    tagline: "Malnehmen",
    starsToEnter: 86,
    theme: { ground: "#FFE8EF", band: "#E2588A", bandShade: "#B23A66", deco: "#FFD23F", decoDark: "#F7A8C3" },
    boss: { name: "Zauberer Zahlobert", color: "#7B4DFF", shade: "#5A2FE0" },
    nodes: [
      { id: "zirkus-1", kind: "lesson", title: "Malnehmen verstehen", skills: ["malVerstehen"] },
      { id: "zirkus-2", kind: "trick", title: "Kernaufgaben", skills: ["kernaufgaben"] },
      { id: "zirkus-3", kind: "lesson", title: "Tauschen", skills: ["tauschen"] },
      chest("zirkus-4", "zelt"),
      { id: "zirkus-5", kind: "trick", title: "Nachbaraufgabe", skills: ["malReihen"] },
      { id: "zirkus-6", kind: "lesson", title: "Einmaleins-Reihen", skills: ["malReihen"] },
      { id: "zirkus-7", kind: "lesson", title: "Zirkus-Geschichten", skills: ["malSach"] },
      { id: "zirkus-8", kind: "review", title: "Gemischt", skills: ["malVerstehen", "kernaufgaben", "tauschen", "malReihen", "malSach"] },
      round2("zirkus-9", "Malnehmen verstehen 2", ["malVerstehen"]),
      round2("zirkus-10", "Kernaufgaben 2", ["kernaufgaben"]),
      chest("zirkus-11"),
      round2("zirkus-12", "Einmaleins-Reihen 2", ["malReihen"]),
      round2("zirkus-13", "Quadrate", ["tauschen"]),
      round2("zirkus-14", "Zirkus-Geschichten 2", ["malSach"]),
      chest("zirkus-15"),
      mix2("zirkus-16", ["malVerstehen", "kernaufgaben", "tauschen", "malReihen", "malSach"]),
      { id: "zirkus-boss", kind: "boss", title: "Zauberer Zahlobert", skills: ["kernaufgaben", "malReihen", "tauschen", "malSach"], coloring: "seehund" },
    ],
  },
  {
    id: "baeckerei",
    index: 5,
    name: "Bäckerei",
    tagline: "Teilen",
    starsToEnter: 108,
    theme: { ground: "#FFF1E0", band: "#C8763A", bandShade: "#9A5524", deco: "#F7C99B", decoDark: "#E3A36B" },
    boss: { name: "Teigmonster Knetbert", color: "#F2C48D", shade: "#C8915A" },
    nodes: [
      { id: "baeckerei-1", kind: "lesson", title: "Gerecht verteilen", skills: ["verteilen"] },
      { id: "baeckerei-2", kind: "trick", title: "Halbieren", skills: ["halbieren"] },
      { id: "baeckerei-3", kind: "trick", title: "Umkehraufgabe", skills: ["geteilt"] },
      chest("baeckerei-4", "torte"),
      { id: "baeckerei-5", kind: "lesson", title: "Mal und Geteilt", skills: ["umkehr"] },
      { id: "baeckerei-6", kind: "lesson", title: "Geteilt rechnen", skills: ["geteilt"] },
      { id: "baeckerei-7", kind: "lesson", title: "Bäckerei-Geschichten", skills: ["backSach"] },
      { id: "baeckerei-8", kind: "review", title: "Gemischt", skills: ["verteilen", "halbieren", "geteilt", "umkehr", "backSach"] },
      round2("baeckerei-9", "Verteilen 2", ["verteilen"]),
      round2("baeckerei-10", "Halbieren 2", ["halbieren"]),
      chest("baeckerei-11"),
      round2("baeckerei-12", "Geteilt rechnen 2", ["geteilt"]),
      round2("baeckerei-13", "Mal und Geteilt 2", ["umkehr"]),
      round2("baeckerei-14", "Bäckerei-Geschichten 2", ["backSach"]),
      chest("baeckerei-15"),
      mix2("baeckerei-16", ["verteilen", "halbieren", "geteilt", "umkehr", "backSach"]),
      { id: "baeckerei-boss", kind: "boss", title: "Teigmonster Knetbert", skills: ["geteilt", "umkehr", "halbieren", "backSach"], coloring: "cupcake" },
    ],
  },
  {
    id: "schloss",
    index: 6,
    name: "Uhrenschloss",
    tagline: "Uhr & Zeit",
    starsToEnter: 130,
    theme: { ground: "#EEF0FF", band: "#5B6BD6", bandShade: "#3E4CB0", deco: "#C9D0FF", decoDark: "#9AA6F0" },
    boss: { name: "Graf Tick-Tack", color: "#9B7BFF", shade: "#6F4FD8" },
    nodes: [
      { id: "schloss-1", kind: "lesson", title: "Uhr lesen", skills: ["uhrLesen"] },
      { id: "schloss-2", kind: "lesson", title: "Uhr stellen", skills: ["uhrStellen"] },
      { id: "schloss-3", kind: "trick", title: "Viertel und halb", skills: ["zeitWoerter"] },
      chest("schloss-4", "wecker"),
      { id: "schloss-5", kind: "lesson", title: "Stunden und Minuten", skills: ["zeitEinheiten"] },
      { id: "schloss-6", kind: "trick", title: "Wie lange dauert es?", skills: ["zeitspanne"] },
      { id: "schloss-7", kind: "lesson", title: "Uhr lesen & stellen", skills: ["uhrLesen", "uhrStellen"] },
      { id: "schloss-8", kind: "review", title: "Gemischt", skills: ["uhrLesen", "uhrStellen", "zeitWoerter", "zeitspanne", "zeitEinheiten"] },
      round2("schloss-9", "Uhr lesen 2", ["uhrLesen"]),
      round2("schloss-10", "Uhr stellen 2", ["uhrStellen"]),
      chest("schloss-11"),
      round2("schloss-12", "Viertel und halb 2", ["zeitWoerter"]),
      round2("schloss-13", "Wie lange? 2", ["zeitspanne"]),
      round2("schloss-14", "Stunden und Minuten 2", ["zeitEinheiten"]),
      chest("schloss-15"),
      mix2("schloss-16", ["uhrLesen", "uhrStellen", "zeitWoerter", "zeitspanne", "zeitEinheiten"]),
      { id: "schloss-boss", kind: "boss", title: "Graf Tick-Tack", skills: ["uhrLesen", "uhrStellen", "zeitWoerter", "zeitspanne"], coloring: "schloss" },
    ],
  },
  {
    id: "ozean",
    index: 7,
    name: "Formen-Ozean",
    tagline: "Formen & Muster",
    starsToEnter: 152,
    theme: { ground: "#E3F7FA", band: "#1C9AAE", bandShade: "#137585", deco: "#9BE3EC", decoDark: "#5CC6D6" },
    boss: { name: "Krake Kringel", color: "#FF5D9E", shade: "#C93B77" },
    nodes: [
      { id: "ozean-1", kind: "lesson", title: "Formen erkennen", skills: ["formen"] },
      { id: "ozean-2", kind: "lesson", title: "Formen zählen", skills: ["formenZaehlen"] },
      { id: "ozean-3", kind: "trick", title: "Spiegeln", skills: ["spiegeln"] },
      chest("ozean-4", "qualle"),
      { id: "ozean-5", kind: "lesson", title: "Muster", skills: ["muster"] },
      { id: "ozean-6", kind: "lesson", title: "Körper", skills: ["koerper"] },
      { id: "ozean-7", kind: "lesson", title: "Spiegeln & Muster", skills: ["spiegeln", "muster"] },
      { id: "ozean-8", kind: "review", title: "Gemischt", skills: ["formen", "formenZaehlen", "spiegeln", "muster", "koerper"] },
      round2("ozean-9", "Formen erkennen 2", ["formen"]),
      round2("ozean-10", "Spiegeln 2", ["spiegeln"]),
      chest("ozean-11"),
      round2("ozean-12", "Formen zählen 2", ["formenZaehlen"]),
      round2("ozean-13", "Muster 2", ["muster"]),
      round2("ozean-14", "Körper 2", ["koerper"]),
      chest("ozean-15"),
      mix2("ozean-16", ["formen", "formenZaehlen", "spiegeln", "muster", "koerper"]),
      { id: "ozean-boss", kind: "boss", title: "Krake Kringel", skills: ["formen", "spiegeln", "muster", "koerper"], coloring: "seestern" },
    ],
  },
  {
    id: "werkstatt",
    index: 8,
    name: "Mess-Werkstatt",
    tagline: "Längen messen",
    starsToEnter: 174,
    theme: { ground: "#FFF4E6", band: "#D9822B", bandShade: "#A85F17", deco: "#F7C99B", decoDark: "#C98A4B" },
    boss: { name: "Roboter Bolzi", color: "#9AA6B8", shade: "#6E7A8E" },
    nodes: [
      { id: "werkstatt-1", kind: "trick", title: "Lineal anlegen", skills: ["lineal"] },
      { id: "werkstatt-2", kind: "lesson", title: "Längen schätzen", skills: ["schaetzen"] },
      { id: "werkstatt-3", kind: "lesson", title: "Meter und Zentimeter", skills: ["einheiten"] },
      chest("werkstatt-4", "roboter"),
      { id: "werkstatt-5", kind: "lesson", title: "Mit Längen rechnen", skills: ["laengenRechnen"] },
      { id: "werkstatt-6", kind: "lesson", title: "Längen vergleichen", skills: ["laengenVergleichen"] },
      { id: "werkstatt-7", kind: "lesson", title: "Messen & schätzen", skills: ["lineal", "schaetzen"] },
      { id: "werkstatt-8", kind: "review", title: "Gemischt", skills: ["lineal", "einheiten", "schaetzen", "laengenRechnen", "laengenVergleichen"] },
      round2("werkstatt-9", "Lineal 2", ["lineal"]),
      round2("werkstatt-10", "Meter und Zentimeter 2", ["einheiten"]),
      chest("werkstatt-11"),
      round2("werkstatt-12", "Längen schätzen 2", ["schaetzen"]),
      round2("werkstatt-13", "Mit Längen rechnen 2", ["laengenRechnen"]),
      round2("werkstatt-14", "Längen vergleichen 2", ["laengenVergleichen"]),
      chest("werkstatt-15"),
      mix2("werkstatt-16", ["lineal", "einheiten", "schaetzen", "laengenRechnen", "laengenVergleichen"]),
      { id: "werkstatt-boss", kind: "boss", title: "Roboter Bolzi", skills: ["lineal", "einheiten", "laengenRechnen", "laengenVergleichen"], coloring: "werkzeugkiste" },
    ],
  },
  {
    id: "detektiv",
    index: 9,
    name: "Detektivbüro",
    tagline: "Spuren lesen",
    starsToEnter: 196,
    theme: { ground: "#F3EEE6", band: "#6B4F3A", bandShade: "#4A3424", deco: "#D8C3A5", decoDark: "#8C6B4F" },
    boss: { name: "Elster Klauzi", color: "#3A3E85", shade: "#262A63" },
    nodes: [
      { id: "detektiv-1", kind: "trick", title: "Strichlisten", skills: ["strichliste"] },
      { id: "detektiv-2", kind: "lesson", title: "Diagramme lesen", skills: ["diagramm"] },
      { id: "detektiv-3", kind: "lesson", title: "Fehler-Detektiv", skills: ["fehlerDetektiv"] },
      chest("detektiv-4", "lupe"),
      { id: "detektiv-5", kind: "lesson", title: "Sachaufgaben", skills: ["sachaufgaben"] },
      { id: "detektiv-6", kind: "lesson", title: "Wie viele Möglichkeiten?", skills: ["kombinatorik"] },
      { id: "detektiv-7", kind: "lesson", title: "Strichliste & Diagramm", skills: ["strichliste", "diagramm"] },
      { id: "detektiv-8", kind: "review", title: "Gemischt", skills: ["strichliste", "diagramm", "sachaufgaben", "kombinatorik", "fehlerDetektiv"] },
      round2("detektiv-9", "Strichlisten 2", ["strichliste"]),
      round2("detektiv-10", "Diagramme 2", ["diagramm"]),
      chest("detektiv-11"),
      round2("detektiv-12", "Sachaufgaben 2", ["sachaufgaben"]),
      round2("detektiv-13", "Fehler-Detektiv 2", ["fehlerDetektiv"]),
      round2("detektiv-14", "Möglichkeiten 2", ["kombinatorik"]),
      chest("detektiv-15"),
      mix2("detektiv-16", ["strichliste", "diagramm", "sachaufgaben", "kombinatorik", "fehlerDetektiv"]),
      { id: "detektiv-boss", kind: "boss", title: "Elster Klauzi", skills: ["diagramm", "sachaufgaben", "kombinatorik", "fehlerDetektiv"], coloring: "detektiv" },
    ],
  },
];

/** Welten, die als Nebel-Vorschau am Pfadende warten. */
export const COMING_SOON = ["Sternen-Expedition"];

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
