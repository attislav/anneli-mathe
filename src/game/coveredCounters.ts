import { pick, randInt } from "./random";
import type { CounterTask, Level, CounterBowl } from "./types";

export const decisions = { enough: "Sicher genug", short: "Sicher zu wenig", open: "Noch offen" };
export type Decision = keyof typeof decisions;
type Board = Pick<CounterTask, "bowls" | "needed">;
export function possibleTotals(board: Board, opened: number[]) {
  let minimum = 0, maximum = 0;
  board.bowls.forEach((bowl, index) => {
    const known = bowl.tens * 10 + (opened.includes(index) ? bowl.units : 0);
    minimum += known;
    maximum += known + (opened.includes(index) ? 0 : 9);
  });
  return { minimum, maximum };
}
export function judge(board: Board, opened: number[]): Decision {
  const { minimum, maximum } = possibleTotals(board, opened);
  if (minimum >= board.needed) return "enough";
  if (maximum < board.needed) return "short";
  return "open";
}
export function evidenceHint(board: Board, opened: number[], choice: Decision, minimum: number, maximum: number) {
  const range = possibleTotals(board, opened);
  if (minimum !== range.minimum) return "Zähle alle Bündel und sichtbaren Einzelplättchen. Unter jedem geschlossenen Deckel könnten null liegen.";
  if (maximum !== range.maximum) return "Unter jedem geschlossenen Deckel könnten neun Einzelplättchen liegen. Wie viele sind es dann zusammen?";
  if (choice !== judge(board, opened)) return "Vergleiche beide Grenzen mit "+board.needed+". Reicht schon die kleinste Menge? Kann auch die größte noch zu klein sein?";
  return null;
}
export function reason(board: Board, opened: number[]) {
  const {minimum,maximum} = possibleTotals(board,opened);
  switch (judge(board,opened)) {
    case "enough": return "Schon die kleinste mögliche Menge ("+minimum+") reicht für "+board.needed+".";
    case "short": return "Selbst die größte mögliche Menge ("+maximum+") ist kleiner als "+board.needed+".";
    case "open": return "Bei "+minimum+" sind es zu wenige, bei "+maximum+" reichen sie. Eine Schale muss geöffnet werden.";
  }
}
export function coveredCounters(level: Level): Omit<CounterTask,"id"|"skillId"|"level"> {
  const tens = randInt(level===1?1:level,Math.min(8,level+2));
  const firstTens = randInt(0,tens);
  const bowls: CounterBowl[] = [{tens:firstTens,units:randInt(0,9)}, {tens:tens-firstTens,units:randInt(0,9)}];
  const offset = pick(level<=2?[-1,0,5,9,12,18,19]:[-2,0,1,4,8,9,10,13,16,17,18,19,20]);
  const needed = tens*10+offset;
  return {format:"covered-counters",bowls,needed,question:"Reichen unsere Plättchen für "+needed+" Kinder?",
    hint:"Jedes Kind braucht ein Plättchen. Ein Bündel sind zehn Plättchen. Unter jedem Deckel liegen null bis neun einzelne.",
    solution:"Vergleiche die kleinste und größte mögliche Menge mit der Kinderzahl. Öffne nur so viele Deckel, wie du für eine sichere Antwort brauchst."};
}
