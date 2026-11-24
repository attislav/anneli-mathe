import { pick, randInt, shuffle } from "./random";
import type { BagTask, Level } from "./types";

export const marks=["Stern","Kreis","Herz","Dreieck"] as const;
export type BagMark=typeof marks[number];
export type ChanceClass="all"|"some"|"none";
export const chanceNames:Record<ChanceClass,string>={all:"sicher",some:"möglich, aber nicht sicher",none:"unmöglich"};
export const eventText=(event:readonly BagMark[])=>event.join(" oder ");
export function bagChance(bag:readonly BagMark[],event:readonly BagMark[]):ChanceClass {
  const matching=bag.filter(x=>event.includes(x)).length;
  return matching===0?"none":matching===bag.length?"all":"some";
}
export function bagReason(event:readonly BagMark[],kind:ChanceClass) {
  const symbol=eventText(event);
  if(kind==="all")return `Auf jedem Plättchen steht ${symbol}.`;
  if(kind==="none")return `Auf keinem Plättchen steht ${symbol}.`;
  return `Es gibt Plättchen mit ${symbol} und auch andere.`;
}
export function bagHint(bag:BagMark[],event:BagMark[],answer:string,reason:string) {
  const correct=bagChance(bag,event);
  if(answer!==correct)return "Schau alle Plättchen an. Passt das gesuchte Zeichen auf jedes, auf einige oder auf keines?";
  return reason===correct?null:"Deine Einschätzung passt. Welche Begründung beschreibt den ganzen Beutel?";
}
export function drawSeries(bag:BagMark[]) {
  return Array.from({length:3},()=>pick(bag));
}
export function nextDrawHint(task:BagTask,seen:string,answer:string,reason:string) {
  const matches=task.series.filter(m=>task.next.includes(m)).length;
  if(!/^[0-3]$/.test(seen) || Number(seen)!==matches)return "Zähle in der Ziehspur nur die passenden Zeichen. Auch null sind möglich.";
  return bagHint(task.bag,task.next,answer,reason);
}
export function drawBag(level:Level):Omit<BagTask,"skillId"|"level"|"id"> {
  const order=shuffle(marks), size=randInt(4,level<=2?5:7);
  const kinds=randInt(1,level<=2?2:3);
  const present=order.slice(0,kinds);
  const bag=shuffle([...present,...Array.from({length:size-kinds},()=>pick(present))]);
  const possible:BagMark[][]=[[...present],[order[kinds]],...(kinds>1?present.map(m=>[m]):[])];
  // For beginners, ask about one symbol at a time.
  const events=possible.filter(e=>e.length===1 || (level>=3 && e.length<=2));
  const first=pick(events), next=pick(events.filter(e=>eventText(e)!==eventText(first)));
  const series=drawSeries(bag), observed=series.filter(m=>next.includes(m)).length;
  const summary=(event:BagMark[])=>eventText(event)+" ist "+chanceNames[bagChance(bag,event)]+". "+bagReason(event,bagChance(bag,event));
  return {format:"draw-bag",bag,first,next,series,reasons:shuffle(["all","some","none"] as const),
    question:"Was kannst du aus diesem Beutel ziehen?",hint:"Schau auf die Zeichen im Beutel. Du ziehst jedes Mal blind genau ein Plättchen.",
    solution:`${summary(first)} Die drei gezogenen Zeichen: ${series.join(", ")}. Passende Ziehungen: ${observed}. Gesuchtes Zeichen: „${eventText(next)}“. Nach dem Zurücklegen: ${summary(next)}`};
}
