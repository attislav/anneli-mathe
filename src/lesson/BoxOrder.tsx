import { useState } from "react";
import { boxes, decisionHint, lighter, neededPair, rankingHint, weigh, type Box, type Decision, type Observation, type Pair } from "@/game/boxOrder";
import type { BoxOrderTask } from "@/game/types";
import { Button } from "@/ui/Button";
import { Scale } from "./Balance";
import type { FormatProps } from "./formats";

const choices: Decision[] = ["enough", ["A", "B"], ["A", "C"], ["B", "C"]];
function ObservationCard({observation,number,example}:{observation:Observation;number:number;example:boolean}){
  return <section className="rounded-xl border-2 bg-white p-2"><h3 className="font-bold">Wägung {number}{example?" · Beispiel":""}</h3>
    <Scale left={Number(observation.heavier===observation.left)} right={Number(observation.heavier===observation.right)}
      labels={["Kiste "+observation.left,"Kiste "+observation.right]}/>
    <p>Kiste {lighter(observation)} ist leichter als Kiste {observation.heavier}.</p></section>;
}
export function BoxOrder({task,status,onAnswer}:FormatProps<BoxOrderTask>){
  const [phase,setPhase]=useState<"decide"|"weigh"|"rank">("decide");
  const [decision,setDecision]=useState<Decision|null>(null);
  const [additional,setAdditional]=useState<Observation|null>(null);
  const [ranking,setRanking]=useState<Box[]>([]),[proof,setProof]=useState<number[]>([]);
  const locked=status!=="ask",solved=status==="right"||status==="reveal";
  const missing=neededPair(task.observations);
  const example=solved&&missing&&!additional?weigh(task.order,missing):null;
  const last=additional??example,observations=last?[...task.observations,last]:task.observations;
  function checkDecision(){
    if(decision===null)return;
    const hint=decisionHint(task.observations,decision);
    if(hint)onAnswer(false,hint);
    else setPhase(decision==="enough"?"rank":"weigh");
  }
  function performWeighing(){
    if(!decision||decision==="enough")return;
    setAdditional(weigh(task.order,decision));setPhase("rank");
  }
  return <section className="grid gap-3"><p>Die drei geschlossenen Kisten sind unterschiedlich schwer. Die schwerere Schale hängt tiefer.</p>
    <div className="grid gap-2 sm:grid-cols-2">{observations.map((observation,index)=>
      <ObservationCard key={index} observation={observation} number={index+1} example={index===2&&!!example}/>)}</div>
    {solved?<p>{task.solution}</p>:phase==="decide"?<><p>Kannst du schon alle drei Kisten ordnen? Falls etwas fehlt, wähle das Paar für die nächste Wägung.</p>
      <div className="grid grid-cols-2 gap-2">{choices.map(option=>{
        const selected=decision===option;
        return <button key={String(option)} type="button" disabled={locked} aria-pressed={selected}
          className={"min-h-11 rounded-xl border-2 p-2 "+(selected?"bg-grape-light":"bg-white")} onClick={()=>setDecision(option)}>
          {option==="enough"?"Die Wägungen reichen":option.join(" und ")+" wiegen"}</button>;
      })}</div><Button disabled={locked||!decision} onClick={checkDecision}>Entscheidung prüfen</Button></>:
      phase==="weigh"?<Button disabled={locked} onClick={performWeighing}>Kisten {(decision as Pair).join(" und ")} auf die Waage stellen</Button>:
      <><p>Wähle zuerst die leichteste, dann die mittlere und zuletzt die schwerste Kiste.</p>
        <div className="flex gap-2">{boxes.map(box=><button type="button" key={box} disabled={locked||ranking.includes(box)}
          className="min-h-11 rounded-xl bg-sun-light px-3" onClick={()=>setRanking([...ranking,box])}>Kiste {box}</button>)}</div>
        <p aria-live="polite">Leicht → schwer: {ranking.join(" → ")||"noch offen"}</p>
        <button type="button" className="min-h-11 justify-self-start underline" disabled={locked||!ranking.length} onClick={()=>setRanking(ranking.slice(0,-1))}>Letzte Kiste zurücknehmen</button>
        {observations.length>2&&<fieldset><legend>Welche beiden Wägungen zeigen die Schritte deiner Reihenfolge?</legend>
          {observations.map((_,index)=><label key={index} className="mr-2 inline-flex min-h-11 items-center gap-1"><input type="checkbox" disabled={locked}
            checked={proof.includes(index)} onChange={()=>setProof(proof.includes(index)?proof.filter(value=>value!==index):[...proof,index])}/>Wägung {index+1}</label>)}</fieldset>}
        <Button disabled={locked||ranking.length!==3||(observations.length>2&&proof.length!==2)} onClick={()=>{
          const hint=rankingHint(task.order,ranking,observations.length===2?[0,1]:proof,observations);
          onAnswer(hint===null,hint??undefined);
        }}>Reihenfolge prüfen</Button></>}
  </section>;
}
