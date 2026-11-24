import { pick, randInt } from "./random";
import type { BalanceTask, Level } from "./types";

export const stoneSum = (stones: number[]) => stones.reduce((s,n) => s+n,0);
export const tilt = (left: number, right: number) => left === right ? "balanced" : left > right ? "left" : "right";
export function stonePile(value: number, stones: number[]) {
  const pile: number[] = [];
  for (const stone of [...stones].sort((a,b)=>b-a)) {
    while (value >= stone) { pile.push(stone); value -= stone; }
  }
  return pile;
}
export function balanceHint(target: number, left: number[], right: number[], change?: number) {
  const a = stoneSum(left), b = stoneSum(right);
  if (change === undefined) return b === a ? null : b < a ?
    "Die rechte Schale ist leichter. Lege dort mehr Wert dazu." : "Die rechte Schale ist schwerer. Nimm dort etwas Wert weg.";
  const goal = target+change;
  if (a === goal && b === goal) return null;
  if (a === b) return `Beide Schalen sind gleich schwer. Prüfe den Auftrag: Auf jeder Seite soll der Wert um ${Math.abs(change)} ${change>0?"steigen":"sinken"}.`;
  const side = a === goal ? "rechts" : "links";
  return `Prüfe die Schale ${side}. Ihr Wert war ${target}. Er soll um ${Math.abs(change)} ${change>0?"steigen":"sinken"}.`;
}
export function balance(level: Level): Omit<BalanceTask,"id"|"skillId"|"level"> {
  const limit = [10,20,20,50,100][level-1];
  const stones = [1,2,5,10,20,50].filter(s => s<=limit);
  const target = pick([0,randInt(2,limit-1),randInt(2,limit-1),randInt(2,limit-1)]);
  const startRight = pick([0,randInt(1,limit)].filter(n => n !== target).concat(target===0 ? [1] : []));
  const amount = pick(stones.filter(s=>s>1 && s<=Math.max(target,limit-target)));
  const changes = [amount,-amount].filter(d => target+d>=0 && target+d<=limit);
  const change = pick(changes);
  const base = stonePile(target,stones), start = stonePile(startRight,stones);
  return { format: "balance", stones, limit, base, start, change, question: "Wie bringst du die Rechenwaage ins Gleichgewicht?",
    hint: "Zähle die Werte der Steine in jeder Schale zusammen. Die schwerere Seite sinkt.",
    solution: `Zuerst haben beide Schalen den Wert ${target}. Nach der Änderung gilt auf beiden Seiten: ${target} ${change>0?"+":"−"} ${amount} = ${target+change}.` };
}
