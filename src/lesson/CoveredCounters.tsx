import { useState } from "react";
import { decisions, evidenceHint, judge, possibleTotals, reason, type Decision } from "@/game/coveredCounters";
import type { CounterTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const bowlName=(index:number)=>index===0?"A":"B";
export function Bowls({task,opened,choose}:{task:CounterTask;opened:number[];choose?:(index:number)=>void}){
  return <div className="grid gap-2 sm:grid-cols-2">{task.bowls.map((bowl,index)=>{
    const visible=opened.includes(index);
    return <section key={index} className="rounded-xl border-2 bg-white p-3"><h3 className="font-bold">Schale {bowlName(index)}</h3>
      <p>{bowl.tens} Zehnerbündel</p>
      <div aria-hidden="true" className="flex flex-wrap gap-1">{Array.from({length:bowl.tens},(_,n)=><span key={n} className="rounded border-2 bg-sun-light px-1 font-bold">10</span>)}</div>
      <div className={"mt-2 rounded-xl p-2 "+(visible?"bg-leaf-light":"bg-grape-light")}>{visible?
        <><b>{bowl.units===1?"1 einzelnes Plättchen":bowl.units+" einzelne Plättchen"}</b><div aria-hidden="true" className="flex flex-wrap gap-1">{Array.from({length:bowl.units},(_,n)=><span className="size-3 rounded-full bg-ink" key={n}/>)}</div></>:
        <><b>Deckel geschlossen</b><p>Darunter: 0 bis 9 einzelne Plättchen.</p></>}
      </div>
      {choose&&!visible&&<button type="button" className="mt-2 min-h-11 rounded-xl bg-sky-light px-3 font-bold" onClick={()=>choose(index)}>Schale {bowlName(index)} öffnen</button>}
    </section>;
  })}</div>;
}
export function Explanation({task,opened}:{task:CounterTask;opened:number[]}){
  const range=possibleTotals(task,opened);
  return <p><b>{decisions[judge(task,opened)]}.</b> Möglich: {range.minimum} bis {range.maximum}. {reason(task,opened)}</p>;
}
export function CoveredCounters({task,status,onAnswer}:FormatProps<CounterTask>){
  const [opened,setOpened]=useState<number[]>([]),[awaitingBowl,setAwaitingBowl]=useState(false);
  const [example,setExample]=useState<number[]>([]);
  const [choice,setChoice]=useState<Decision|null>(null),[minimum,setMinimum]=useState(""),[maximum,setMaximum]=useState("");
  const solved=status==="right"||status==="reveal",locked=status!=="ask";
  function open(index:number){
    if(locked||!awaitingBowl||judge(task,opened)!=="open"||opened.includes(index))return;
    setOpened([...opened,index]);setAwaitingBowl(false);setChoice(null);setMinimum("");setMaximum("");
  }
  function check(){
    if(!choice)return;
    const hint=evidenceHint(task,opened,choice,Number(minimum),Number(maximum));
    if(hint)onAnswer(false,hint);
    else if(choice==="open")setAwaitingBowl(true);
    else onAnswer(true);
  }
  const input=(label:string,value:string,set:(value:string)=>void)=><label>{label} <input aria-label={label} inputMode="numeric" disabled={locked}
    value={value} onChange={event=>set(event.target.value)} className="w-16 rounded border p-1"/></label>;
  const shown=status==="reveal"?[...opened,...example]:opened;
  const explore=status==="reveal"&&judge(task,shown)==="open";
  return <section className="grid gap-3"><p>Jedes Kind bekommt ein Plättchen. Alle Zehnerbündel sind sichtbar. Zu Beginn sind die einzelnen Plättchen zugedeckt.</p>
    <Bowls task={task} opened={shown} choose={explore?index=>setExample([...example,index]):awaitingBowl&&!locked?open:undefined}/>
    {opened.length>0&&<details className="rounded-xl bg-mist p-2" open={solved||undefined}><summary>Dein Weg</summary>
      {opened.map((bowl,index)=><div key={bowl} className="mt-2"><Explanation task={task} opened={opened.slice(0,index)}/><p>Du hast Schale {bowlName(bowl)} geöffnet.</p></div>)}</details>}
    {solved||awaitingBowl?<>{example.length>0&&<p>In der Auflösung geöffnet: {example.map(bowlName).join(", ")}.</p>}
      <Explanation task={task} opened={shown}/>{explore?<p>Wenn du weiterforschen möchtest, öffne eine Schale.</p>:awaitingBowl&&!solved&&<p>Wähle jetzt eine geschlossene Schale aus.</p>}</>:
      <>{input("Wie wenige Plättchen könnten es insgesamt sein?",minimum,setMinimum)}
        {input("Wie viele könnten es höchstens sein?",maximum,setMaximum)}
        <p>Ihr braucht {task.needed} Plättchen. Was weißt du jetzt sicher?</p><div className="flex flex-wrap gap-2">{(Object.keys(decisions) as Decision[]).map(answer=>
          <button key={answer} type="button" disabled={locked} aria-pressed={choice===answer} className={"min-h-11 rounded-xl border-2 p-2 "+(choice===answer?"bg-sky-light":"bg-white")}
            onClick={()=>setChoice(answer)}>{decisions[answer]}</button>)}</div>
        <Button disabled={locked||!choice||![minimum,maximum].every(value=>/^\d+$/.test(value))} onClick={check}>Begründung prüfen</Button></>}
  </section>;
}
