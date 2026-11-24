import { pick, randInt, shuffle } from "./random";
import type { Level, StripStoryTask } from "./types";

export type StoryRole="first"|"second"|"whole";
export const stripRoles:StoryRole[]=["whole","first","second"];
const objects=[["Murmel","Murmeln"],["Postkarte","Postkarten"],["Muschel","Muscheln"],["Buntstift","Buntstifte"]] as const;
type Story=Pick<StripStoryTask,"parts"|"names"|"unit"|"missing">;
export function stripValue(t:Story,role:StoryRole) {
  return role==="whole"?t.parts[0]+t.parts[1]:t.parts[role==="first"?0:1];
}
export function stripOwner(t:Story,role:StoryRole) {return role==="whole"?"Beide zusammen":t.names[role==="first"?0:1];}
export function stripNumber(t:StripStoryTask,role:StoryRole) {return t.missing===role?"?":String(stripValue(t,role));}
export function stripAmount(t:Pick<StripStoryTask,"unit">,n:number) {
  return n===0?"keine "+t.unit[1]:n+" "+t.unit[n===1?0:1];
}
export function stripStoryText(t:Story) {
  const [a,b]=t.names,[x,y]=t.parts;
  if(t.missing==="whole")return `${a} hat ${stripAmount(t,x)}. ${b} hat ${stripAmount(t,y)}. Wie viele ${t.unit[1]} haben sie zusammen?`;
  const known=t.missing==="first"?1:0;
  return `${a} und ${b} haben zusammen ${stripAmount(t,x+y)}. ${t.names[known]} hat ${stripAmount(t,t.parts[known])}. Wie viele ${t.unit[1]} hat ${t.names[1-known]}?`;
}
export function stripLayoutHint(positions:(StoryRole|null)[]) {
  if(positions.length!==3 || positions.includes(null) || new Set(positions).size!==3)return "Lege jede Karte einmal in den Streifenplan.";
  return positions[0]==="whole"?null:"Die lange Zeile gehört beiden Kindern zusammen. Darunter liegen die beiden einzelnen Teile.";
}
export function moveStrip(positions:(StoryRole|null)[],card:StoryRole,index:number) {
  if(index<0 || index>2)return positions;
  const next=[...positions],old=next.indexOf(card);
  if(old>=0)next[old]=next[index];
  next[index]=card;
  return next;
}
export function stripEquationHint(t:StripStoryTask,terms:(StoryRole|"")[],op:string,entry:string) {
  if(terms.length!==3 || terms.includes("") || new Set(terms).size!==3)return "Benutze jede der drei Karten einmal in deiner Rechnung.";
  if(!((op==="+" && terms[2]==="whole") || (op==="−" && terms[0]==="whole")))
    return "Die beiden Teile kannst du zum Ganzen addieren. Vom Ganzen kannst du einen Teil wegnehmen.";
  return /^\d+$/.test(entry) && Number(entry)===stripValue(t,t.missing)?null:"Die Rechnung passt. Welche Zahl gehört an die Stelle des Fragezeichens?";
}
export function storyStrips(level:Level):Omit<StripStoryTask,"id"|"level"|"skillId"> {
  const limit=level<=2?10:level===3?20:50;
  const a=randInt(0,limit),b=pick([a,randInt(0,limit),randInt(0,limit)]);
  const names=pick([["Mila","Tom"],["Lea","Ben"],["Emil","Nora"]]),unit=pick(objects);
  const missing=pick([pick(["first","second"] as const),"whole"] as const);
  const task:Story={parts:[a,b],names,unit:[...unit],missing};
  const answer=stripValue(task,missing);
  return {...task,format:"strip-story",order:shuffle(stripRoles),question:stripStoryText(task),hint:"Welche Karte gehört zum Ganzen? Welche Karten beschreiben je einen Teil?",
    solution:`${stripOwner(task,missing)}: ${stripAmount(task,answer)}.`};
}
