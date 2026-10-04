// Einstufungs-Abenteuer: In ein paar Minuten herausfinden, wo ein Kind
// einsteigt. Pro Welt kommen zwei typische Aufgaben auf Silber-Niveau.
// Beide richtig → weiter zur nächsten Welt. Eine richtig → eine dritte
// entscheidet. Sonst: Hier geht's los. Frühere Welten gelten als geschafft
// (übersprungen) und ihre Kompetenzen bekommen einen guten Startwert.

import { getSkill } from "./skills";
import type { Level, Task } from "./types";
import { uid } from "./random";
import { WORLDS, type World } from "./worlds";
import type { WorldId } from "./genkit";

/** Die typische Kompetenz jeder Welt — der „Prüfstein". */
const PROBE: Record<WorldId, string[]> = {
  start: ["uebergang20", "plus20"],
  wald: ["zehnerEiner", "zehnerPlus"],
  strand: ["uebergang100", "ergaenzen"],
  hafen: ["geldZaehlen", "einkaufen"],
  zirkus: ["kernaufgaben", "malReihen"],
  baeckerei: ["geteilt", "halbieren"],
  schloss: ["uhrLesen", "zeitWoerter"],
  ozean: ["formen", "spiegeln"],
  werkstatt: ["lineal", "einheiten"],
  detektiv: ["strichliste", "sachaufgaben"],
};

const LEVEL: Level = 3;

export type PlacementState = {
  world: number;
  asked: number;
  right: number;
  /** Ergebnis: Index der Startwelt, sobald feststeht. */
  start: number | null;
  total: number;
};

export function startPlacement(): PlacementState {
  return { world: 0, asked: 0, right: 0, start: null, total: 0 };
}

export function placementTask(p: PlacementState): Task {
  const world = WORLDS[p.world];
  const skills = PROBE[world.id];
  const skillId = skills[p.asked % skills.length];
  const draft = getSkill(skillId).gen({ level: LEVEL, avoid: [] });
  return { ...draft, id: uid(), skillId, level: LEVEL } as Task;
}

export function placementAnswer(p: PlacementState, correct: boolean): PlacementState {
  const asked = p.asked + 1;
  const right = p.right + (correct ? 1 : 0);
  const total = p.total + 1;
  const wrong = asked - right;
  const passed = right >= 2;
  const failed = wrong >= 2;
  if (!passed && !failed) return { ...p, asked, right, total };
  if (failed) return { ...p, asked, right, total, start: p.world };
  const nextWorld = p.world + 1;
  if (nextWorld >= WORLDS.length) return { ...p, asked, right, total, start: WORLDS.length - 1 };
  return { world: nextWorld, asked: 0, right: 0, start: null, total };
}

/** Was nach der Einstufung im Spielstand landet. */
export function placementResult(startIndex: number): { skipped: WorldId[]; mastery: Record<string, number>; world: World } {
  const skipped = WORLDS.slice(0, startIndex).map((w) => w.id);
  const mastery: Record<string, number> = {};
  for (const w of WORLDS.slice(0, startIndex)) for (const n of w.nodes) for (const s of n.skills) mastery[s] = 3.4;
  return { skipped, mastery, world: WORLDS[startIndex] };
}

export const PLACEMENT_WORLDS = WORLDS.length;
