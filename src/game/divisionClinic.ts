import { LabSession } from "./lab";
import { pick, uid } from "./random";
import type { DivisionMeaningTask, Level } from "./types";
import { divisionLevel } from "./divisionLevels";

export const meanings=["Plättchen je Teller","Teller"] as const;
type Stage="share"|"group";
export function placeCounter(plates:number[],index:number,step:1|-1) {
  if(index<0 || index>=plates.length || (step===-1 && plates[index]===0) || (step===1 && plates.reduce((a,b)=>a+b,0)>=12))return plates;
  return plates.map((n,i)=>i===index?n+step:n);
}
export function modelDivisionHint(stage:Stage,plates:number[],entry:string,meaning:string) {
  if(plates.reduce((a,b)=>a+b,0)!==12)return "Lege alle zwölf Plättchen auf die Teller.";
  if(plates.length!==3 || plates.some(n=>n!==4))return stage==="share"?"Auf allen drei Tellern sollen gleich viele liegen.":"Jeder Teller soll vier Plättchen tragen. Leere Teller kannst du wegnehmen.";
  const share=stage==="share";
  if(entry!==String(share?4:3))return share?"Zähle die Plättchen auf einem Teller.":"Zähle, wie viele volle Teller du gelegt hast.";
  return meaning===meanings[share?0:1]?null:"Was hast du gerade gezählt: Teller oder Plättchen auf einem Teller?";
}
export function divisionHint(t:DivisionMeaningTask,n:string,meaning:string) {
  if(!/^\d+$/.test(n) || Number(n)!==t.total/t.divisor)return "Überlege, mit welcher Zahl du den Teiler multiplizieren kannst, um alle Plättchen zu erhalten.";
  return meaning===meanings[t.share?0:1]?null:"Überlege, was schon feststeht und was du herausfinden sollst.";
}
export function divisionTransfer(previous?:DivisionMeaningTask):DivisionMeaningTask {
  const share=previous?!previous.share:pick([true,false]);
  const pairs:{total:number;divisor:number;level:Level}[]=[];
  for(const divisor of [2,5,6,7])for(const answer of [2,5,6,7,8]) {
    const total=divisor*answer;
    const level=divisionLevel(share,divisor,answer);
    if(level && answer!==divisor && total<=40 && total!==12 && total!==previous?.total && divisor!==previous?.divisor)pairs.push({total,divisor,level});
  }
  const {total,divisor,level}=pick(pairs);
  return {id:uid(),format:"division-meaning",skillId:share?"verteilen":"geteilt",level,total,divisor,share,
    question:share?`Verteile ${total} Plättchen gleich auf ${divisor} Teller. Was zählt das Ergebnis?`:
      `Lege ${total} Plättchen auf Teller, immer ${divisor} je Teller. Was zählt das Ergebnis?`,
    hint:"Lies, ob die Zahl der Teller oder die Zahl der Plättchen je Teller vorgegeben ist.",
    solution:`${total} : ${divisor} = ${total/divisor}. Das sind ${total/divisor} ${meanings[share?0:1]}. ${divisor} · ${total/divisor} = ${total}.`};
}
export class DivisionClinicRound extends LabSession {
  constructor(owner:string,readonly exercise=divisionTransfer()){super(owner,1,()=>exercise);}
}
