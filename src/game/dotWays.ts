import { pick, randInt } from "./random";
import type { DotWaysTask, Level } from "./types";

export const groupPair=(total:number,part:number)=>[part,total-part].sort((a,b)=>a-b).join("+");
export function partHint(dots:number[],marked:number[],previous?:number) {
  if(!marked.length||marked.length>=dots.length)return "Jede Gruppe braucht mindestens einen Punkt.";
  if(new Set(marked).size!==marked.length||marked.some(n=>!dots.includes(n)))return "Wähle nur gefüllte Punkte aus.";
  if(previous!==undefined&&groupPair(dots.length,marked.length)===groupPair(dots.length,previous))
    return "Das sind dieselben beiden Gruppengrößen wie vorher. Auch vertauscht bleibt es dasselbe Paar.";
  return null;
}
export function countHint(dots:number[],marked:number[],rest:number,total:number) {
  if(rest!==dots.length-marked.length)return "Zähle nur die Punkte ohne Häkchen. Sie bilden die andere Gruppe.";
  if(total!==dots.length)return "Zähle beide Gruppen zusammen. Jeder Punkt zählt genau einmal.";
  return null;
}
export function relocateDot(dots:number[],from:number,to:number,cols:number) {
  if(!dots.includes(from)||dots.includes(to)||!Number.isInteger(to)||to<0||to>=2*cols)return dots;
  return dots.map(n=>n===from?to:n);
}
export function dotWays(level:Level):Omit<DotWaysTask,"id"|"level"|"skillId">{
  const cols=level<3?5:10;
  const ranges=[[4,6],[6,9],[8,12],[11,15],[14,18]];
  const [lo,hi]=ranges[level-1],count=randInt(lo,hi);
  const fill=pick(["rows","pairs","fives"]);
  const order=Array.from({length:2*cols},(_,i)=>fill==="rows"?i:fill==="pairs"?Math.floor(i/2)+(i%2)*cols:
    Math.floor(i/10)*5+(i%5)+(Math.floor(i/5)%2)*cols);
  const dots=order.slice(0,count);
  return {format:"dot-ways",cols,dots,question:"Wie hast du die Punkte gesehen?",hint:"Suche zuerst eine Gruppe, die du gut auf einen Blick erkennst.",
    solution:"Die beiden Bilder zeigen gleich viele Punkte. Verschiedene Gruppengrößen können dieselbe Summe haben."};
}
