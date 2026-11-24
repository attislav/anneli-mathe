import { useState } from "react";
import { boardSize, figure, figureHint, gridName, growthResult, growthRules, newCells, numberHint, pointKey, type Point } from "@/game/growingFigure";
import type { GrowthTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Drawing({task,n}:{task:GrowthTask;n:number}){
  const [w,h]=boardSize(task), cells=figure(task,n);
  return <figure className="grid gap-1"><figcaption className="font-bold">Figur {n}</figcaption>
    <svg role="img" aria-label={"Gefüllte Felder: "+cells.map(gridName).join(", ")} viewBox={"0 0 "+w*14+" "+h*14} width={w*14} height={h*14}>
      {Array.from({length:w*h},(_,i)=><rect key={i} x={i%w*14+1} y={Math.floor(i/w)*14+1} width="12" height="12" fill="white" stroke="#b9b0cb"/>)}
      {cells.map(([x,y])=><rect key={x+","+y} x={x*14+1} y={y*14+1} width="12" height="12" fill="#484080"/>)}
    </svg></figure>;
}
function Grid({task,chosen,choose}:{task:GrowthTask;chosen:string[];choose?:(id:string)=>void}){
  const [w,h]=boardSize(task),fixed=new Set(figure(task,2).map(pointKey));
  return <div className="overflow-x-auto"><div className="grid w-max gap-0.5" style={{gridTemplateColumns:"repeat("+w+", minmax(2.5rem,1fr))"}}>
    {Array.from({length:w*h},(_,i)=>{
      const p:Point=[i%w,Math.floor(i/w)],key=pointKey(p),base=fixed.has(key),added=chosen.includes(key);
      const label=gridName(p)+", "+(base?"schon vorhanden":added?"neu gelegt":"leer");
      const cls="grid min-h-10 place-items-center rounded border text-xs "+(base?"bg-grape text-white":added?"bg-leaf-light":"bg-white");
      const text=<>{gridName(p)}<b aria-hidden="true">{base?"■":added?"+":"·"}</b></>;
      return choose&&!base?<button type="button" key={key} className={cls} aria-pressed={added} aria-label={label} onClick={()=>choose(key)}>{text}</button>:
        <span key={key} className={cls} role="img" aria-label={label}>{text}</span>;
    })}</div></div>;
}
export function GrowingFigure({task,status,onAnswer}:FormatProps<GrowthTask>){
  const [chosen,setChosen]=useState<string[]>([]),[counting,setCounting]=useState(false);
  const [steps,setSteps]=useState(""),[gain,setGain]=useState(""),[total,setTotal]=useState("");
  const solved=status==="right"||status==="reveal",locked=status!=="ask",rule=growthRules[task.family],r=growthResult(task);
  const entry=(label:string,value:string,set:(s:string)=>void)=><label>{label} <input inputMode="numeric" disabled={locked} className="w-14 rounded border p-1" aria-label={label} value={value} onChange={e=>set(e.target.value)}/></label>;
  return <section className="grid gap-3"><h3 className="font-bold">{rule.name}</h3><p>{rule.rule} In allen Gittern liegt A1 links oben.</p>
    <div className="flex flex-wrap gap-4 rounded-xl bg-sun-light p-3"><Drawing task={task} n={1}/><Drawing task={task} n={2}/></div>
    <h3 className="font-bold">Figur 3</h3>
    {!counting&&!solved&&<p>Die dunklen Kästchen sind schon da. Tippe die neuen Felder an. Erneutes Tippen nimmt ein Kästchen zurück.</p>}
    <Grid task={task} chosen={solved?newCells(task).map(pointKey):chosen} choose={locked||counting?undefined:key=>setChosen(chosen.includes(key)?chosen.filter(c=>c!==key):[...chosen,key])}/>
    {solved?<p>{task.solution}</p>:counting?<><p>Figur 3 hat {r.from} Kästchen. Rechne von hier bis zu Figur {task.target} weiter.</p>
      {entry("Wie viele Schritte sind es?",steps,setSteps)}{entry("Wie viele Kästchen kommen je Schritt dazu?",gain,setGain)}
      {entry("Wie viele Kästchen hat Figur "+task.target+"?",total,setTotal)}
      <Button disabled={locked||![steps,gain,total].every(v=>/^\d+$/.test(v))} onClick={()=>{const hint=numberHint(task,Number(steps),Number(gain),Number(total));onAnswer(!hint,hint??undefined);}}>Rechnung prüfen</Button></>:
      <Button disabled={locked||!chosen.length} onClick={()=>{const hint=figureHint(task,chosen);if(hint)onAnswer(false,hint);else setCounting(true);}}>Neue Kästchen prüfen</Button>}
  </section>;
}
