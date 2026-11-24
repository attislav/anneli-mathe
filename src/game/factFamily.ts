import { pick, randInt, shuffle } from "./random";
import type { FamilyTask, Level } from "./types";

type Parts = Pick<FamilyTask, "parts">;
export type FamilyLine = { a: number; op: "+" | "−"; b: number; c: number };
export const familyText = (line: FamilyLine) => `${line.a} ${line.op} ${line.b} = ${line.c}`;
export function familyLines({ parts: [x,y] }: Parts): FamilyLine[] {
  const whole = x+y;
  const make = (a: number, b: number): FamilyLine[] =>
    [{ a, op: "+", b, c: whole }, { a: whole, op: "−", b: a, c: b }];
  return x === y ? make(x,y) : [...make(x,y), ...make(y,x)];
}
export function familyHint(task: Parts, line: FamilyLine, seen: FamilyLine[]) {
  const valid = familyLines(task), whole = task.parts[0] + task.parts[1];
  if (!valid.some(v => familyText(v) === familyText(line))) {
    if (line.op === "−" && line.a !== whole) return "Bei Minus beginnst du mit dem Ganzen. Nimm einen Teil weg. Der andere Teil bleibt.";
    if (line.op === "+" && (line.a === whole || line.b === whole)) return "Bei Plus legst du die beiden Teile zusammen. Das Ganze steht hinter dem Gleichheitszeichen.";
    return line.op === "+" ? "Prüfe, ob du jeden Teil einmal nimmst und beide zusammen das Ganze ergeben." :
      "Schau auf den Teil, den du wegnimmst. Welcher Teil bleibt übrig?";
  }
  if (seen.some(v => familyText(v) === familyText(line))) return "Diese Rechnung steht schon in deiner Sammlung. Wähle eine andere Reihenfolge oder das andere Zeichen.";
  return null;
}
export function factFamily(level: Level): Omit<FamilyTask, "id" | "level" | "skillId"> {
  const limit = [10, 20, 30, 60, 100][level - 1];
  const x = randInt(1, Math.floor(limit / 2));
  const otherParts = Array.from({ length: limit-x }, (_, i) => i+1).filter(n => n !== x);
  const y = level >= 4 && pick([true,false,false,false]) ? x : pick(otherParts);
  const parts: [number,number] = [x,y];
  const cards = shuffle([...new Set([x,y,x+y])]);
  return { parts, cards, format: "fact-family", question: "Welche Plus- und Minusrechnungen gehören zu diesem Bild?",
    hint: "Die beiden farbigen Teile bilden zusammen das Ganze. Bei Minus nimmst du einen der beiden Teile weg.",
    solution: familyLines({parts}).map(familyText).join(" · ") };
}
