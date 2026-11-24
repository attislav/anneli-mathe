import { useState } from "react";
import { fitsFold, foldCellName, foldHint, foldProbe, lineNames, type FoldLine } from "@/game/foldLines";
import type { FoldTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const endpoints:Record<FoldLine,[number,number,number,number]>={vertical:[50,0,50,100],horizontal:[0,50,100,50],down:[0,0,100,100],up:[0,100,100,0]};
const button="min-h-11 rounded-xl border-2 bg-white px-2 aria-pressed:bg-sky-light";
export function FoldGrid({task,line}:{task:FoldTask;line:FoldLine|null}) {
  const marks=line?foldProbe(task,line):null, name=(i:number)=>foldCellName(i,task.size);
  const details=(kind:string)=>marks?.flatMap((v,i)=>v===kind?[name(i)]:[]).join(", ");
  return <figure className="grid gap-2">
    <div className="relative grid w-full max-w-64 border-2 bg-white" style={{gridTemplateColumns:`repeat(${task.size},1fr)`}} aria-hidden="true">
      {Array.from({length:task.size*task.size},(_,i)=>{
        const mark=marks?.[i], fill=task.filled.includes(i);
        const color=mark==="only-image"?"bg-sky-light":fill?"bg-leaf-light":"bg-white";
        return <span key={i} className={"grid aspect-square place-content-center border text-center "+color}>
          <small>{name(i)}</small><b>{mark==="both"?"✓":mark==="only-original"?"●":mark==="only-image"?"◇":fill?"●":" "}</b></span>;
      })}
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
        {(line?[line]:task.lines).map(l=><line key={l} x1={endpoints[l][0]} y1={endpoints[l][1]} x2={endpoints[l][2]} y2={endpoints[l][3]}
          stroke="#784b91" strokeWidth="1" strokeDasharray="2 1"/>)}</svg>
    </div>
    <figcaption aria-live="polite">{!marks?<p>Felder der Figur: {task.filled.map(name).join(", ")}.</p>:<>
      <p>Faltprobe · {lineNames[line!]}.</p>
      <p>✓ Figur und Spiegelbild: {details("both")||"keine Felder"}.</p>
      <p>● Nur Figur: {details("only-original")||"keine Felder"}. ◇ Nur Spiegelbild: {details("only-image")||"keine Felder"}.</p>
    </>}</figcaption>
  </figure>;
}
export function FoldLines({task,status,onAnswer}:FormatProps<FoldTask>) {
  const [choice,setChoice]=useState<FoldLine[]|null>(null),[prediction,setPrediction]=useState<FoldLine[]|null>(null);
  const [line,setLine]=useState<FoldLine|null>(null);
  const solved=status==="right"||status==="reveal",locked=status!=="ask";
  const shown=solved?task.lines.filter(l=>fitsFold(task,l)):choice;
  const tested=line??(solved?shown?.[0]??task.lines[0]:null);
  const choose=(l:FoldLine)=>setChoice(prev=>prev?.includes(l)?prev.filter(s=>s!==l):[...(prev??[]),l]);
  return <section className="grid gap-3">
    <FoldGrid task={task} line={tested}/>
    {prediction!==null && <p>Deine erste Vermutung: {prediction.map(l=>lineNames[l]).join(", ")||"Keine davon"}.</p>}
    {(prediction!==null || solved) && <fieldset disabled={locked && !solved} className="flex flex-wrap gap-1"><legend>Spiegelbild einer Linie ausprobieren</legend>
      {task.lines.map(l=><button type="button" key={l} className={button} aria-pressed={tested===l} onClick={()=>setLine(l)}>{lineNames[l]}</button>)}</fieldset>}
    <fieldset disabled={locked} className="flex flex-wrap gap-1"><legend>{solved?"Passende Linien":prediction===null?"Deine Vermutung: Wähle alle passenden Linien.":"Deine Antwort: Welche Linien passen nach der Probe?"}</legend>
      {task.lines.map(l=><button type="button" key={l} className={button} aria-pressed={!!shown?.includes(l)} onClick={()=>choose(l)}>{lineNames[l]}</button>)}
      <button type="button" className={button} aria-pressed={shown?.length===0} onClick={()=>setChoice([])}>Keine davon</button>
    </fieldset>
    {solved?<p>{task.solution}</p>:prediction===null?<Button disabled={locked || choice===null} onClick={()=>setPrediction([...(choice??[])])}>Vermutung festhalten</Button>:
      <Button disabled={locked || !line || choice===null} onClick={()=>{const hint=foldHint(task,choice??[]);onAnswer(!hint,hint??undefined);}}>Faltlinien prüfen</Button>}
  </section>;
}
