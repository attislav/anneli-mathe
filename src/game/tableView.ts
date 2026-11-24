import { chance, pick, shuffle } from "./random";
import type { Level, TableItem, TableSide, ViewpointTask } from "./types";

export const SIDES: TableSide[] = ["unten", "oben", "links", "rechts"];
export const LOOKS = { unten: "oben", oben: "unten", links: "rechts", rechts: "links" } as const;
const turns = { unten: 0, rechts: 1, oben: 2, links: 3 };
const items: TableItem[] = ["Tasse", "Buch", "Schlüssel", "Apfel", "Stift", "Uhr"];

export function ownView<T>(table: T[], side: TableSide): T[] {
  let view = [...table];
  for (let i = 0; i < turns[side]; i++) view = [view[2], view[0], view[3], view[1]];
  return view;
}

export function checkView(task: Pick<ViewpointTask, "side" | "items" | "reverse">, pair: (TableItem | null)[], side: TableSide | null) {
  const [, , left, right] = ownView(task.items, task.side);
  if (task.reverse) return side === task.side ? { correct: true }
    : { correct: false, hint: "Suche die Kante mit beiden genannten Dingen. Stell dich dort hin und prüfe ihre Reihenfolge." };
  if (pair[0] === left && pair[1] === right) return { correct: true };
  return { correct: false, hint: pair[0] === right && pair[1] === left
    ? "Du hast die nahe Kante gefunden. Prüfe links und rechts aus Milas Blickrichtung."
    : "Stell dich in Gedanken an Milas Platz. Welche beiden Dinge stehen direkt vor ihr?" };
}

export function tableView(level: Level): Omit<ViewpointTask, "id" | "level" | "skillId"> {
  const side = level === 1 ? "unten" : level === 2 ? pick(SIDES.slice(0, 2)) : pick(SIDES);
  const table = shuffle(items).slice(0, 4);
  const [, , left, right] = ownView(table, side);
  const reverse = level === 5 || level === 4 && chance(0.5);
  return { format: "table-view", items: table, side, reverse,
    question: reverse ? "An welcher Tischseite steht Mila?" : "Was steht direkt vor Mila links und rechts?",
    hint: reverse ? "Suche die Kante mit den beiden genannten Dingen. Prüfe von dort links und rechts." : `Mila steht ${side} und schaut nach ${LOOKS[side]}. Stell dich in Gedanken neben sie.`,
    solution: `Mila steht ${side} und schaut nach ${LOOKS[side]}. An ihrer Kante sieht sie links: ${left}. Rechts: ${right}.` };
}
