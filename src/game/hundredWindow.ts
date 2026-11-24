import { randInt, shuffle } from "./random";
import type { HundredWindowTask, Level } from "./types";

type WindowData = Pick<HundredWindowTask, "start" | "size" | "gaps">;

export function windowValue({ start, size }: WindowData, cell: number): number {
  return start + 10 * Math.floor(cell / size) + cell % size;
}

export function cellPosition(size: number, cell: number): string {
  return `Zeile ${Math.floor(cell / size) + 1}, Spalte ${cell % size + 1}`;
}

export function windowHint(task: WindowData, gap: number): string {
  const { size, gaps } = task;
  const row = Math.floor(gap / size), col = gap % size;
  const neighbors = [
    { cell: gap - size, inside: row > 0, step: "Gehe ein Feld nach unten und zähle 10 dazu." },
    { cell: gap + size, inside: row < size - 1, step: "Gehe ein Feld nach oben und ziehe 10 ab." },
    { cell: gap - 1, inside: col > 0, step: "Gehe ein Feld nach rechts und zähle 1 dazu." },
    { cell: gap + 1, inside: col < size - 1, step: "Gehe ein Feld nach links und ziehe 1 ab." },
  ].filter(n => n.inside && !gaps.includes(n.cell));
  const neighbor = neighbors[(task.start + gap) % neighbors.length];
  return `${cellPosition(size, gap)}: Starte bei ${windowValue(task, neighbor.cell)}. ${neighbor.step}`;
}

export function firstIncorrectGap(task: WindowData, entries: Record<number, string>): number | undefined {
  return task.gaps.find(gap => Number(entries[gap]) !== windowValue(task, gap));
}

export function hundredWindow(level: Level): Omit<HundredWindowTask, "id" | "skillId" | "level"> {
  const size = level <= 2 ? 2 : 3;
  const start = 1 + randInt(0, 10 - size) * 10 + randInt(0, 10 - size);
  const cells = Array.from({ length: size * size }, (_, i) => i);
  // Abwechselnde Felder lassen für jede Lücke mindestens einen sichtbaren Nachbarn.
  const parity = randInt(0, 1);
  const candidates = cells.filter(i => (Math.floor(i / size) + i % size) % 2 === parity);
  const count = [1, 2, 2, 3, 4][level - 1];
  const gaps = shuffle(candidates).slice(0, count).sort((a, b) => a - b);
  const data = { start, size, gaps } as const;
  return { ...data, format: "hundred-window", question: "Welche Zahlen fehlen im Fenster der Hundertertafel?",
    hint: windowHint(data, gaps[0]),
    solution: gaps.map(gap => `${cellPosition(size, gap)}: ${windowValue(data, gap)}.`).join(" ") };
}
