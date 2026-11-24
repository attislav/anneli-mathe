import { LabSession } from "./lab";
import { pick, shuffle, uid } from "./random";
import { activeProfileId } from "./state";
import type { MarbleTask } from "./types";

export const surfaces = ["Filz", "Pappe", "Holz"] as const;
export type Surface = typeof surfaces[number];
export type Finding = "first" | "second" | "both" | "neither";
export type Reading = { surface: Surface; run: number; cm: number };
type Distances = [number, number];
export type Experiment = { minimum: number; rolls: Record<Surface, Distances> };
export function createExperiment(): Experiment {
  const minimum = pick([6, 7]);
  const patterns = [[0, 2], [2, 0], [-1, 2], [2, -1], [1, 1], [-2, -1], [3, 2], [0, -2]];
  const values = shuffle(patterns).slice(0, 3).map(([first, second]): Distances => [minimum+first, minimum+second]);
  return { minimum, rolls: { Filz: values[0], Pappe: values[1], Holz: values[2] } };
}
export function readings(experiment: Experiment, chosen: Surface[]): Reading[] {
  return chosen.flatMap(surface => experiment.rolls[surface].map((cm, index) => ({surface, run:index+1, cm})));
}
function selection(first:boolean, second:boolean): Finding {
  if(first && second)return "both";
  if(first)return "first";
  return second?"second":"neither";
}
export function finding(rows: Reading[], step: 2 | 3, minimum:number) {
  const distances=rows.map(row=>row.cm);
  const maximum=Math.max(...distances);
  const qualifies=(side:number)=>step===2?distances.slice(side*2,side*2+2).includes(maximum):
    distances.slice(side*2,side*2+2).every(distance=>distance>=minimum);
  return selection(qualifies(0),qualifies(1));
}
export function proofHint(rows:Reading[],step:2|3,minimum:number,answer:Finding,marked:number[]) {
  if(answer!==finding(rows,step,minimum))return step===2?"Suche den größten einzelnen Messwert. Er kann auf beiden Unterlagen stehen.":
    "Prüfe bei jeder Unterlage beide Läufe. Genau "+minimum+" cm reichen auch.";
  const maximum=Math.max(...rows.map(row=>row.cm));
  if(marked.some(index=>!Number.isInteger(index)||index<0||index>=4))return "Wähle Messzeilen aus dem Protokoll.";
  if(step===2)return rows.every((row,index)=>marked.includes(index)===(row.cm===maximum))?null:"Markiere jede Messzeile mit der größten Weite.";
  for(const start of [0,2]){
    const pair=[start,start+1];
    if(pair.every(index=>rows[index].cm>=minimum)){
      if(!pair.every(index=>marked.includes(index)))return "Bei einer passenden Unterlage belegen beide Messzeilen deine Antwort.";
    }else{
      const evidence=pair.filter(index=>marked.includes(index));
      if(!evidence.length||evidence.some(index=>rows[index].cm>=minimum))return "Für eine Unterlage, die nicht passt, markiere mindestens einen zu kurzen Lauf. Ein langer Lauf ist dafür kein Gegenbeispiel.";
    }
  }
  return null;
}
export function exampleProof(rows:Reading[],step:2|3,minimum:number){
  const maximum=Math.max(...rows.map(row=>row.cm));
  if(step===2)return rows.flatMap((row,i)=>row.cm===maximum?[i]:[]);
  return [0,2].flatMap(start=>{
    const short=[start,start+1].filter(i=>rows[i].cm<minimum);
    return short.length?[short[0]]:[start,start+1];
  });
}
type Entry={step:1;chosen:Surface[];values:number[]}|{step:2|3;answer:Finding;marked:number[]};
export class MarbleRound extends LabSession {
  rows:Reading[]=[];
  readonly proofs:Partial<Record<2|3,number[]>>={};
  readonly revealed=new Set<number>();
  private closed=false;
  constructor(owner:string,readonly experiment=createExperiment()){
    super(owner,3,number=>{
      const questions=["Wie weit rollen eure Murmeln?","Auf welcher Unterlage gab es den weitesten Einzellauf?","Auf welcher Unterlage waren beide Läufe mindestens "+experiment.minimum+" cm weit?"];
      const task:MarbleTask={format:"marble-test",id:uid(),skillId:number===1?"lineal":"laengenVergleichen",level:number===2?1:2,
        question:questions[number-1],hint:"Vergleiche die Messwerte dieser zwei Unterlagen.",solution:"Im Versuchsprotokoll siehst du die Messwerte und die passende Auswertung."};
      return task;
    });
  }
  close(){this.closed=true;}
  submit(id:string,entry:Entry){
    const {task,status,number}=this.state;
    if(this.closed||activeProfileId()!==this.owner||task.id!==id||status!=="ask"||number!==entry.step)return this.state;
    let hint:string|null=null;
    let measured=this.rows;
    if(entry.step===1){
      if(entry.chosen.length!==2||new Set(entry.chosen).size!==2||entry.chosen.some(surface=>!surfaces.includes(surface)))return this.state;
      measured=readings(this.experiment,entry.chosen);
      const wrong=measured.findIndex((row,index)=>row.cm!==entry.values[index]);
      if(wrong>=0)hint="Lies bei "+measured[wrong].surface+", Lauf "+measured[wrong].run+", den Strich am Ziel noch einmal ab.";
    }else hint=proofHint(this.rows,entry.step,this.experiment.minimum,entry.answer,entry.marked);
    const next=super.answer(id,!hint,hint??undefined);
    if(next.status==="right"||next.status==="reveal"){
      if(next.status==="reveal")this.revealed.add(entry.step);
      if(entry.step===1)this.rows=measured;
      else this.proofs[entry.step]=hint?exampleProof(this.rows,entry.step,this.experiment.minimum):[...entry.marked];
    }
    return next;
  }
}
