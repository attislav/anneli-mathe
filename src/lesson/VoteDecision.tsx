import { useState } from "react";
import { votesLabel } from "@/game/pictogram";
import type { DecisionTask, VoteChartTask } from "@/game/types";
import { chartHint, decisionHint, decisionResult } from "@/game/voteDecision";
import { Button } from "@/ui/Button";
import { BarChart } from "@/ui/Detective";
import { PictureRow } from "./Pictogram";
import type { FormatProps } from "./formats";

const control="min-h-11 rounded-xl border-2 bg-white px-2";

export function VoteChart({task,status,onAnswer}:FormatProps<VoteChartTask>) {
  const [built,setBuilt]=useState([0,0]);
  const solved=status==="right" || status==="reveal", locked=status!=="ask";
  return <section className="grid gap-3">
    <p className="rounded-xl bg-sky-light p-3">Ein ganzer Kreis zählt zwei Stimmen. Ein halber Kreis zählt eine Stimme.</p>
    {task.names.map((name,i)=><div key={name} className="rounded-xl bg-leaf-light p-2">
      <p>Aus der Strichliste: {votesLabel(task.amounts[i])} für {name}</p>
      <PictureRow name={name} halves={solved?task.amounts[i]:built[i]}/>
      {!solved && <fieldset disabled={locked} className="flex flex-wrap gap-1"><legend>Kreise für {name}</legend>
        {[2,1,-1,-2].map(step=><button key={step} type="button" className={control} disabled={built[i]+step<0 || built[i]+step>10}
          onClick={()=>setBuilt(old=>old.map((v,j)=>i===j?v+step:v))}>{step>0?"+":"−"} {Math.abs(step)===2?"ganzer Kreis":"halber Kreis"}</button>)}
      </fieldset>}
    </div>)}
    {!solved && <Button disabled={locked} onClick={()=>{const hint=chartHint(task,built);onAnswer(!hint,hint??undefined);}}>Bilddiagramm prüfen</Button>}
  </section>;
}

export function VoteChange({task,status,onAnswer}:FormatProps<DecisionTask>) {
  const [to,setTo]=useState(-1),[entries,setEntries]=useState(["",""]),[winner,setWinner]=useState(-1);
  const solved=status==="right" || status==="reveal",locked=status!=="ask",result=decisionResult(task);
  const shown=solved?1:to;
  const choices=[...task.names,"Gleichstand"];
  const bars=task.names.map((label,i)=>({ label,icon:task.icons[i],value:task.votes.filter(v=>v===i).length }));
  const chartMax=Math.max(...bars.map(r=>r.value))+1;
  return <section className="grid gap-3">
    <h3 className="font-bold">Eure Stimmen als Säulen vor dem Wechsel</h3>
    <div role="img" aria-label={bars.map(r=>r.label+": "+votesLabel(r.value)).join(". ")}><BarChart rows={bars} step={1} max={chartMax}/></div>
    <p>Das Kind mit Zettel {task.ticket+1} wechselt von „{task.names[0]}“ zu „{task.names[1]}“.</p>
    <div className="rounded-xl bg-sun-light p-3" aria-live="polite"><strong>Zettel {task.ticket+1}</strong> · liegt bei {task.names[shown===-1?0:shown]}</div>
    {!solved && <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Wohin legst du diesen Zettel?</legend>
      {task.names.map((name,i)=><button type="button" key={name} aria-pressed={to===i} className={control+" aria-pressed:bg-leaf-light"}
        onClick={()=>setTo(i)}>Zu {name}</button>)}</fieldset>}
    {solved ? <><h3 className="font-bold">Nach dem Wechsel</h3>
      <div aria-hidden="true"><BarChart rows={bars} heights={[result.first,result.second]} step={1} max={chartMax}/></div>
      <p>{task.solution}</p></> : <>
      {task.names.map((name,i)=><label key={name}>{name} nach dem Wechsel <input inputMode="numeric" className={control+" w-16"}
        value={entries[i]} disabled={locked} onChange={e=>{const val=e.target.value;if(/^\d{0,2}$/.test(val))setEntries(old=>old.map((n,j)=>i===j?val:n));}}/></label>)}
      <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Wer liegt jetzt vorn?</legend>
        {choices.map((name,i)=><button type="button" key={name} aria-pressed={winner===i} className={control+" aria-pressed:bg-leaf-light"}
          onClick={()=>setWinner(i)}>{name}</button>)}</fieldset>
      <Button disabled={locked || to<0 || entries.includes("") || winner<0} onClick={()=>{
        const hint=decisionHint(task,to,entries,winner);onAnswer(!hint,hint??undefined);
      }}>Entscheidung prüfen</Button></>}
  </section>;
}
