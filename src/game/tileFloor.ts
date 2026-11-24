import { chance, pick, randInt, shuffle } from "./random";
import type { Level, TilePlacement, TileTask } from "./types";

type Board = Pick<TileTask, "width" | "height" | "example">;
const PATTERNS = [
  [["AA", "BB"], ["AA.", ".BB"]],
  [["AAB", "A.B"], ["AA.", ".BB", ".B."]],
  [["AAB", "ABB"], ["AABB", ".CC."], ["AAB", "..B", ".CC"]],
  [["AABB", "ACCB"], ["AAB", "ABB", "CC."]],
  [["AABB", "ACCD", "...D"], ["ABB", "AAC", "DDC"]],
];

export function tileOffsets(length: number, turns: number): number[][] {
  const offsets = length === 2 ? [[0, 0], [1, 0]] : [[0, 0], [1, 0], [0, 1]];
  for (let i = 0; i < turns % 4; i++) for (const cell of offsets) [cell[0], cell[1]] = [-cell[1], cell[0]];
  return offsets;
}

export function tileFootprint(board: Board, placement: TilePlacement) {
  const x = placement.anchor % board.width, y = Math.floor(placement.anchor / board.width);
  return tileOffsets(board.example[placement.piece].length, placement.turns).map(([dx, dy]) => {
    const col = x + dx, row = y + dy;
    return col >= 0 && col < board.width && row >= 0 && row < board.height ? row * board.width + col : -1;
  });
}

export function tileIssue(board: Board, placed: TilePlacement[], next: TilePlacement): string | undefined {
  if (placed.some(p => p.piece === next.piece)) return "Dieser Stein liegt schon auf der Fläche.";
  const cells = tileFootprint(board, next);
  if (cells.some(cell => !board.example.some(group => group.includes(cell)))) return "Ein Stück ragt über die Fläche. Dreh den Stein oder wähle ein anderes Startfeld.";
  const used = placed.flatMap(p => tileFootprint(board, p));
  if (cells.some(cell => used.includes(cell))) return "Hier überlappen sich zwei Steine. Wähle freie Kästchen.";
}

export function floorComplete(board: Board, placed: TilePlacement[]): boolean {
  return placed.length === board.example.length && placed.every((p, i) => !tileIssue(board, placed.slice(0, i), p));
}

export function tileFloor(level: Level): Omit<TileTask, "id" | "level" | "skillId"> {
  let rows = pick(PATTERNS[level - 1]).map(row => [...row]);
  if (chance(0.5)) rows = rows.map(row => row.reverse());
  const turns = randInt(0, 3);
  for (let i = 0; i < turns; i++) rows = rows[0].map((_, x) => rows.map(row => row[x]).reverse());
  const labels = shuffle([...new Set(rows.flat().filter(v => v !== "."))]);
  const example = labels.map(label => rows.flat().flatMap((v, cell) => v === label ? [cell] : []));
  return { format: "tile-floor", example, width: rows[0].length, height: rows.length,
    question: "Lege alle hellen Kästchen lückenlos mit den Steinen aus.",
    hint: "Beginne in einer Ecke. Der Stern am Stein kommt auf dein Startfeld. Du kannst den Stein drehen.",
    solution: "Die Zahlen im Plan zeigen eine mögliche Lösung. Gleiche Zahlen gehören zu einem Stein." };
}
