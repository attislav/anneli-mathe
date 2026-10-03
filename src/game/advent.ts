// Adventskalender: 24 Türchen, jedes ab seinem Tag im Dezember zu öffnen
// (verpasste Türchen darf man nachholen). Eltern sehen vorab, was drin ist.

import { STICKERS } from "./collection";
import { getPage } from "./coloring";
import { adventDay } from "./season";
import { applyRewards, readSave, rollSticker, update, type Reward, type SaveState } from "./state";

type DoorPlan = { kind: "coins"; amount: number } | { kind: "sticker"; rare: boolean } | { kind: "page"; id: string } | { kind: "finale" };

/** Was hinter Türchen 1–24 steckt (Sticker werden beim Öffnen gewürfelt). */
export function doorPlan(n: number): DoorPlan {
  if (n === 24) return { kind: "finale" };
  if (n === 6) return { kind: "page", id: "schneemann" };
  if (n === 13) return { kind: "page", id: "tannenbaum" };
  if (n % 2 === 0) return { kind: "sticker", rare: n === 18 };
  return { kind: "coins", amount: 15 + n };
}

export function doorLabel(n: number): string {
  const p = doorPlan(n);
  if (p.kind === "coins") return `${p.amount} Münzen`;
  if (p.kind === "sticker") return p.rare ? "Winter-Sticker (vielleicht ein seltener!)" : "Winter-Sticker";
  if (p.kind === "page") return `Ausmalbild „${getPage(p.id)?.title ?? p.id}“`;
  return "Großes Finale: Weihnachtswichtel-Sticker + 100 Münzen";
}

/** Türchen in der Reihenfolge, wie sie im Kalender hängen (fest gemischt). */
export const DOOR_ORDER = [7, 15, 2, 21, 11, 18, 4, 23, 9, 13, 1, 16, 20, 6, 24, 12, 3, 19, 10, 22, 5, 14, 17, 8];

export function openedDoors(s: SaveState, year = new Date().getFullYear()): number[] {
  return s.advent.year === year ? s.advent.opened : [];
}

export function canOpen(s: SaveState, n: number, d = new Date()): boolean {
  return n <= adventDay(d) && !openedDoors(s, d.getFullYear()).includes(n);
}

export function openDoor(n: number): Reward[] {
  const s = readSave();
  if (!canOpen(s, n)) return [];
  const plan = doorPlan(n);
  let rewards: Reward[];
  if (plan.kind === "coins") rewards = [{ kind: "coins", amount: plan.amount }];
  else if (plan.kind === "sticker") rewards = [rollSticker(s, "winter", plan.rare)];
  else if (plan.kind === "page") rewards = [{ kind: "page", id: plan.id }, { kind: "coins", amount: 10 }];
  else {
    const elf = STICKERS.find((st) => st.world === "winter" && st.name === "Weihnachtswichtel")!;
    rewards = [{ kind: "sticker", id: elf.id, duplicate: (s.stickers[elf.id] ?? 0) > 0 }, { kind: "coins", amount: 100 }];
  }
  const year = new Date().getFullYear();
  update((cur) => {
    const opened = cur.advent.year === year ? cur.advent.opened : [];
    return { ...applyRewards(cur, rewards), advent: { year, opened: [...opened, n] } };
  });
  return rewards;
}
