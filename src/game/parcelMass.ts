import { pick, randInt } from "./random";
import { stonePile, stoneSum } from "./balance";
import type { Level, ParcelTask } from "./types";

export const parcelWeights=(level:Level)=>level===1?[100,200,500]:[50,100,200,500];
export const massRelation=(total:number)=>total===1000?"exact":total<1000?"under":"over";
export const limitChoices=[
  {id:"under",label:"Unter 1 kg – passt"},
  {id:"exact",label:"Genau 1 kg – passt"},
  {id:"over",label:"Über 1 kg – zu schwer"},
] as const;
export function weighingHint(task:ParcelTask,pile:number[],grams:string) {
  const sum=stoneSum(pile);
  if(sum!==task.mass)return sum<task.mass?"Das Päckchen ist schwerer. Lege rechts Gewicht dazu.":"Rechts ist es zu schwer. Nimm ein Gewicht weg oder tausche es aus.";
  if(!/^\d+$/.test(grams) || Number(grams)!==task.mass)return "Die Waage ist im Gleichgewicht. Addiere die Grammangaben auf deinen Gewichtsstücken.";
  return null;
}
export function parcelLimitHint(task:ParcelTask,entry:string,choice:string) {
  const total=task.mass+task.other;
  if(!/^\d+$/.test(entry) || Number(entry)!==total)return "Addiere die Masse beider Päckchen in Gramm.";
  return choice===massRelation(total)?null:"Vergleiche die Grammzahl mit 1000. Genau 1000 g sind noch erlaubt.";
}
export function parcelMass(level:Level):Omit<ParcelTask,"id"|"skillId"|"level"> {
  const step=level===1?100:50, mass=randInt(level===1?2:3,level===1?7:16)*step;
  const offset=pick([-1,0,1])*step*(level>=3?randInt(1,2):1), other=1000+offset-mass;
  const total=mass+other;
  return {format:"parcel-mass",mass,other,question:"Was wiegt das Päckchen?",
    hint:"Lege beschriftete Gewichte auf die rechte Schale. Wenn beide Seiten gleich hoch sind, zähle ihre Grammangaben zusammen.",
    solution:`Zum Beispiel: ${stonePile(mass,parcelWeights(level)).join(" + ")} = ${mass} g. Zusammen: ${mass} g + ${other} g = ${total} g. ${limitChoices.find(c=>c.id===massRelation(total))!.label}.`};
}
