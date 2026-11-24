import { pick, randInt, shuffle } from "./random";
import type { Level, TowerTask } from "./types";

export const towerCells = ["A1", "B1", "A2", "B2"];
export const directions = {
  south: { text: "von Süden nach Norden", halves: ["Spalte A", "Spalte B"], groups: [[0,2],[1,3]] },
  north: { text: "von Norden nach Süden", halves: ["Spalte B", "Spalte A"], groups: [[1,3],[0,2]] },
  east: { text: "von Osten nach Westen", halves: ["Zeile 2", "Zeile 1"], groups: [[2,3],[0,1]] },
  west: { text: "von Westen nach Osten", halves: ["Zeile 1", "Zeile 2"], groups: [[0,1],[2,3]] },
} as const;
export const towerTotal = (heights: number[]) => heights.reduce((sum, h) => sum + h, 0);
type Build = Pick<TowerTask, "initial" | "changes" | "reserve">;
export function targetTower(p: Build) {
  const target = [...p.initial];
  for (const change of p.changes) target[change.cell] += change.delta;
  return target;
}
export function leftInBox(p: Build, heights: number[]) { return p.reserve + towerTotal(p.initial) - towerTotal(heights); }
export function moveCube(p: Build, heights: number[], cell: number, delta: -1 | 1) {
  if (!Number.isInteger(cell) || cell < 0 || cell > 3 || heights[cell] + delta < 0 || heights[cell] + delta > 4 || delta > leftInBox(p, heights)) return heights;
  return heights.map((n,i) => i === cell ? n+delta : n);
}
export function buildHint(p: Build, heights: number[]) {
  const target = targetTower(p), cell = target.findIndex((n,i) => heights[i] !== n);
  return cell < 0 ? null : `Schau auf ${towerCells[cell]}. Dort standen zuerst ${p.initial[cell]} Würfel. Prüfe den Umbauauftrag für dieses Feld.`;
}
export function silhouette(heights: number[], side: TowerTask["side"]) {
  return directions[side].groups.map(([i,j]) => Math.max(heights[i], heights[j]));
}
export function checkTowerAnswer(heights: number[], side: TowerTask["side"], columns: number[], answer: string) {
  const expected = silhouette(heights, side);
  const wrong = expected.findIndex((n,i) => columns[i] !== n);
  if (wrong >= 0) return `Schau auf ${directions[side].halves[wrong]}. Die höhere der beiden Säulen bestimmt den Umriss.`;
  if (!/^\d+$/.test(answer) || Number(answer) !== towerTotal(heights)) return "Zähle die Würfel aller vier Felder. Hinter einer Säule können weitere Würfel stehen.";
  return null;
}
export function tower(level: Level): Omit<TowerTask, "id" | "skillId" | "level"> {
  const initial = Array.from({ length: 4 }, () => randInt(1, level <= 2 ? 2 : 3));
  const cells = shuffle([0,1,2,3]);
  const first = level <= 1 ? 1 : pick([-1,1] as const);
  const changes: TowerTask["changes"] = [{ cell: cells[0], delta: first }];
  if (level >= 3) changes.push({ cell: cells[1], delta: level >= 4 ? pick([-1,1] as const) : first === 1 ? -1 : 1 });
  const reserve = changes.filter(c => c.delta === 1).length;
  const side = level <= 2 ? "south" : pick(["south","north","east","west"] as const);
  const p = { initial, changes, reserve, side };
  const built = targetTower(p);
  if (towerTotal(built) === towerTotal(silhouette(built, side))) {
    // Restore one cube behind an occupied column so the view really hides material.
    initial[built.indexOf(0)]++;
  }
  const heights = targetTower(p), [left,right] = silhouette(heights, side);
  return { ...p, format: "tower", question: "Baue den Aussichtsturm nach dem Auftrag um.",
    hint: "Die Zahl im Höhenplan gibt an, wie viele Würfel auf diesem Feld stehen.",
    solution: `Nach dem Umbau sind die Stapel ${heights.join(", ")} Würfel hoch. Von deiner Seite siehst du links ${left}, rechts ${right}. Zusammen sind es ${towerTotal(heights)} Würfel.` };
}
