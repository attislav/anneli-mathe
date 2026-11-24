import { pick } from "./random";
import type { ChocolateTask, Level } from "./types";

type Bar = Pick<ChocolateTask, "rows" | "cols" | "children">;
export const shareWord = (children: number) => children === 2 ? "eine Hälfte" : "ein Viertel";
export function examplePortions({ rows, cols, children }: Bar) {
  const size = rows * cols / children;
  return Array.from({ length: rows * cols }, (_, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    return Math.floor((row * cols + (row % 2 ? cols - 1 - col : col)) / size);
  });
}
export function checkPortions({ rows, cols, children }: Bar, cells: number[]) {
  if (cells.length !== rows * cols || cells.some(child => !Number.isInteger(child) || child < 0 || child >= children))
    return "Ordne jedes Kästchen einem Kind zu. Schau nach den freien Kästchen.";
  const portions = Array.from({ length: children }, (_, child) => cells.flatMap((v, i) => v === child ? [i] : []));
  const fairSize = rows * cols / children;
  const small = portions.findIndex(squares => squares.length < fairSize);
  if (small !== -1) {
    const large = portions.findIndex(squares => squares.length > fairSize);
    return `Kind ${small + 1} hat zu wenige Kästchen, Kind ${large + 1} hat zu viele. Verteile so, dass beide gleich viele bekommen.`;
  }
  for (const [child, squares] of portions.entries()) {
    const reached = new Set([squares[0]]);
    for (const i of reached) {
      const neighbors = [i - cols, i + cols];
      if (i % cols > 0) neighbors.push(i - 1);
      if (i % cols < cols - 1) neighbors.push(i + 1);
      for (const n of neighbors) if (cells[n] === child) reached.add(n);
    }
    if (reached.size !== squares.length) return `Die Kästchen für Kind ${child + 1} sollen an den Seiten zusammenhängen. Eine gemeinsame Ecke reicht nicht.`;
  }
  return null;
}
export function checkShare(bar: Bar, count: string, part: string) {
  if (!/^\d+$/.test(count) || Number(count) !== bar.rows * bar.cols / bar.children) return "Zähle nur die Kästchen einer Portion.";
  if (part !== shareWord(bar.children)) return "In wie viele gleich große Portionen hast du die ganze Tafel geteilt?";
  return null;
}
export function chocolate(level: Level): Omit<ChocolateTask, "id" | "level" | "skillId"> {
  const sizes: Record<Level, [number, number, 2 | 4][]> = {
    1: [[2, 3, 2], [3, 2, 2]], 2: [[2, 4, 2], [4, 2, 2], [2, 5, 2]],
    3: [[2, 4, 4], [4, 2, 4], [3, 4, 2]], 4: [[3, 4, 4], [4, 3, 4], [4, 3, 2]],
    5: [[3, 4, 4], [4, 3, 4], [4, 4, 4], [4, 4, 2]],
  };
  const [rows, cols, children] = pick(sizes[level]);
  return { format: "chocolate-share", rows, cols, children,
    question: `Teile die Schokolade gerecht unter ${children} Kindern. Jedes Kind möchte ein zusammenhängendes Stück.`,
    hint: "Gib jedem Kind gleich viele Kästchen. Die Kästchen einer Portion sollen sich an den Seiten berühren.",
    solution: `Jedes Kind bekommt ${rows * cols / children} von ${rows * cols} Kästchen. Das ist ${shareWord(children)} der Tafel.` };
}
