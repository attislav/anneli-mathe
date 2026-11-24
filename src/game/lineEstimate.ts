import { pick, randInt } from "./random";
import type { Level, LineEstimateTask } from "./types";

type Line=Pick<LineEstimateTask,"low"|"high"|"target">;
export function linePosition(value:number,low:number,high:number) {
  return (value-low)/(high-low);
}
export function pointOnLine(fraction:number,low:number,high:number) {
  return Math.round(low+Math.max(0,Math.min(1,fraction))*(high-low));
}
export function lineAnchors(t:Line) {return [t.low,(t.low+t.high)/2,t.high];}
export function nearestAnchors(t:Line) {
  const distances=lineAnchors(t).map(n=>Math.abs(t.target-n));
  return distances.flatMap((d,i)=>d===Math.min(...distances)?[i]:[]);
}
export function estimateDescription(estimate:number,target:number) {
  const d=Math.abs(estimate-target);
  if(!d)return "Deine Marke liegt genau auf der Zahl.";
  return `Deine Marke liegt ${d} ${d===1?"Zahlenschritt":"Zahlenschritte"} zu weit ${estimate<target?"links":"rechts"}.`;
}
export function lineEstimate(level:Level):Omit<LineEstimateTask,"id"|"level"|"skillId"> {
  const width=level===1?20:level===2?100:pick([20,40,60]);
  const low=level<=2?0:randInt(1,Math.floor((100-width)/5))*5, high=low+width;
  const target=low+(level===2?randInt(1,19)*5:randInt(1,width-1));
  const anchors=lineAnchors({low,high,target}), nearest=nearestAnchors({low,high,target}).map(i=>anchors[i]);
  return {format:"line-estimate",low,high,target,question:`Wo ungefähr liegt ${target} auf diesem Zahlenstrahl?`,
    hint:"Vergleiche die Abstände der Zahl zum linken Ende, zur Mitte und zum rechten Ende.",
    solution:nearest.length===1?`Der nächste Anker ist ${nearest[0]}. Der Abstand zu ${target} beträgt ${Math.abs(target-nearest[0])}.`:
      `${nearest.join(" und ")} liegen beide gleich nah bei ${target}. Beide Antworten passen.`};
}
