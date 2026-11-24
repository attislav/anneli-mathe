import { useState } from "react";
import { provesVote, voteEvidence, voteReasons, voteTruth, type VoteProof } from "@/game/openVotes";
import type { OpenVoteTask } from "@/game/types";
import type { FormatProps } from "./formats";
import { Button } from "@/ui/Button";

function Counters({amount,extra}:{amount:number;extra:number}){
  return <span aria-hidden className="flex max-w-36 flex-wrap gap-1">{Array.from({length:amount+extra},(_,index)=>
    <span key={index} className={"grid h-4 w-4 place-items-center rounded-sm border text-xs "+(index<amount?"bg-grape-light":"bg-sun-light")}>
      {index<amount?"✓":"+"}</span>)}</span>;
}
export function OpenVotes({task,status,onAnswer}:FormatProps<OpenVoteTask>){
  const [left,setLeft]=useState(0),[right,setRight]=useState(0);
  const [decision,setDecision]=useState<boolean|null>(null),[reason,setReason]=useState<VoteProof|null>(null);
  const finished=status==="right"||status==="reveal",locked=status!=="ask";
  const example=voteEvidence(task),reveal=status==="reveal";
  const added=[reveal?example.toFirst:left,reveal?task.open-example.toFirst:right];
  const remaining=task.open-added[0]-added[1], reasons=voteReasons(task,task.names);
  return <section className="grid gap-3"><p>Jedes der <b>{task.first+task.second+task.open} Kinder</b> hat eine Stimme abgegeben. Wer mehr Stimmen hat, gewinnt.</p>
    <p>Schon gezählt: {task.names[0]} {task.first}, {task.names[1]} {task.second}. Noch offen: {task.open}.</p>
    {task.open>0&&<p>{finished?(reveal?"Eine mögliche Verteilung":"Deine Verteilung"):"Probiere aus, wie die offenen Stimmen verteilt sein könnten."}</p>}
    <div className="grid grid-cols-2 gap-2">{task.names.map((name,index)=>{
      const known=index===0?task.first:task.second;
      const update=index===0?setLeft:setRight;
      return <section key={name} aria-label={name} className="grid content-start gap-2 rounded-xl bg-white p-2">
        <h3 className="font-bold">{name}</h3><Counters amount={known} extra={added[index]}/>
        <span>{known} gezählt + {added[index]} dazu = <b>{known+added[index]}</b></span>
        {!finished&&task.open>0&&<div className="flex gap-2">{[-1,1].map(step=><button type="button" key={step}
          className="min-h-11 min-w-11 rounded-lg border" disabled={locked||(step===1?remaining===0:added[index]===0)}
          aria-label={name+(step===1?" eine offene Stimme geben":" eine offene Stimme zurücknehmen")}
          onClick={()=>update(added[index]+step)}>{step===1?"+":"−"}</button>)}</div>}
      </section>;
    })}</div>
    {finished?<div className="rounded-xl bg-leaf-light p-3"><b>{task.question} {voteTruth(task)?"Ja.":"Nein."}</b>
      <p>{reasons[reveal?example.proof:reason??example.proof]}</p></div>:<>
      <p role="status">{remaining===0?"Alle Stimmen sind verteilt.":"Noch zu verteilen: "+remaining}</p>
      <fieldset><legend className="font-bold">{task.question}</legend><div className="flex gap-2">{[true,false].map(yes=>
        <button type="button" key={String(yes)} aria-pressed={yes===decision} disabled={locked}
          className={"min-h-11 rounded-lg border px-4 "+(yes===decision?"bg-sky-light":"bg-white")} onClick={()=>setDecision(yes)}>{yes?"Ja":"Nein"}</button>)}</div></fieldset>
      <fieldset><legend>Wie zeigt deine Verteilung das?</legend>{Object.entries(reasons).map(([key,text])=>
        <label key={key} className="flex min-h-11 items-center gap-2"><input type="radio" name="vote-evidence"
          checked={reason===key} disabled={locked} onChange={()=>setReason(key as VoteProof)}/>{text}</label>)}</fieldset>
      <Button disabled={locked||remaining!==0||decision===null||reason===null} onClick={()=>{
        if(reason!==null&&decision!==null)onAnswer(provesVote(task,decision,left,reason),
          task.claim==="tie"?"Vergleiche den Vorsprung mit den offenen Stimmen. Kannst du die ganze Klasse in zwei gleich große Gruppen teilen?":
          task.claim==="certain"?"Was passiert, wenn alle offenen Stimmen an die andere Gruppe gehen?":"Was passiert, wenn alle offenen Stimmen an "+task.names[0]+" gehen?");
      }}>Antwort und Beleg prüfen</Button></>}
  </section>;
}
