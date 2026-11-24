import { pick, randInt, shuffle } from "./random";
import type { FairWheelTask, Level } from "./types";

export type SymbolFace = "star" | "moon";
export const symbolNames = {star:"Stern",moon:"Mond"};
export const countStars = (fields:SymbolFace[]) => fields.filter(symbol=>symbol==="star").length;
export function initialChoice(fields:SymbolFace[]) {
  const stars=countStars(fields), moons=fields.length-stars;
  return stars===moons?"equal":stars>moons?"star":"moon";
}
export const reasons=[
  "Beide Zeichen haben gleich viele gleich große Felder.",
  "Das Zeichen oben wird öfter getroffen.",
  "Gleiche Chancen gibt es nur, wenn sich Stern und Mond abwechseln.",
];
export function fairnessHint(fields:SymbolFace[],reason:number){
  if(initialChoice(fields)!=="equal")return "Zähle die Sternfelder und die Mondfelder. Haben beide Zeichen gleich viele Felder?";
  return reason===0?null:"Dein Rad ist fair. Was bedeutet es für die beiden Zeichen, wenn jedes Feld dieselbe Trefferchance hat?";
}
export function transferHint(first:SymbolFace[],second:SymbolFace[],a:number,b:number,choice:string){
  const starsA=countStars(first),starsB=countStars(second);
  if(a!==starsA||b!==starsB)return "Zähle die Sternfelder auf Rad A und auf Rad B noch einmal.";
  const correct=starsA===starsB?"equal":starsA>starsB?"first":"second";
  return choice===correct?null:"Beide Räder haben gleich viele gleich große Felder. Vergleiche die Anzahl ihrer Sternfelder.";
}
function wheel(size:number,mask:number):SymbolFace[]{
  return Array.from({length:size},(_,index)=>mask&(1<<index)?"star":"moon");
}
export function fairWheel(level:Level):Omit<FairWheelTask,"id"|"skillId"|"level">{
  const size=level===1?4:level<=3?6:8;
  const all=Array.from({length:2**size},(_,mask)=>wheel(size,mask));
  const initialCount=randInt(0,size);
  const initial=pick(all.filter(fields=>countStars(fields)===initialCount));
  // Exclude fair wheels here so that neither new comparison wheel can be
  // identical to the child's own completed construction.
  const available=all.filter(fields=>fields!==initial&&initialChoice(fields)!=="equal");
  const relation=pick(["first","second","equal"] as const);
  const byCount=Array.from({length:size+1},(_,count)=>available.filter(fields=>countStars(fields)===count));
  const pairs=byCount.flatMap((left,a)=>byCount.flatMap((right,b)=>{
    if(!left.length||!right.length)return [];
    const match=relation==="equal"?a===b&&left.length>1:relation==="first"?a>b:a<b;
    return match?[[a,b]]:[];
  }));
  const [a,b]=pick(pairs);
  const first=pick(byCount[a]),second=pick(byCount[b].filter(fields=>fields!==first));
  return {format:"fair-wheel",initial,first,second,reasonOrder:shuffle([0,1,2]),question:"Wie baust du ein Rad mit zwei gleich guten Chancen?",
    hint:"Jedes Feld wird gleich wahrscheinlich getroffen. Zähle die Felder für beide Zeichen.",
    solution:"Beim fairen Rad haben beide Zeichen je "+size/2+" Felder. Auf Rad A sind "+a+" von "+size+" Feldern mit einem Stern markiert, auf Rad B "+b+" von "+size+". "+
      (a===b?"Auf beiden Rädern ist die Chance für einen Stern gleich.":"Auf Rad "+(a>b?"A":"B")+" hat der Stern die bessere Chance.")};
}
