import { useState } from "react";
import { estimateDescription, lineAnchors, linePosition, nearestAnchors, pointOnLine } from "@/game/lineEstimate";
import type { LineEstimateTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const chip="min-h-11 rounded-xl border-2 bg-white px-3 aria-pressed:bg-sky-light";
export function LineEstimate({task,status,onAnswer}:FormatProps<LineEstimateTask>) {
  const {low,high,target}=task, anchors=lineAnchors(task);
  const [mark,setMark]=useState<number|null>(null),[frozen,setFrozen]=useState(false),[anchor,setAnchor]=useState<number|null>(null);
  const solved=status==="right"||status==="reveal", locked=status!=="ask", compare=frozen||solved;
  const adjust=(delta:number)=>setMark(old=>Math.max(low,Math.min(high,(old??anchors[1])+delta)));
  const point=(value:number)=>({left:linePosition(value,low,high)*100+"%"});
  return <section className="grid gap-3">
    <p>{compare?"Vergleiche deine Marke mit der genauen Stelle.":"Tippe auf den Zahlenstrahl. Du kannst deine Marke danach verschieben."}</p>
    <div className="rounded-xl bg-white px-5 pt-3 pb-2">
      <div className="relative h-16 touch-manipulation" role={compare?"img":"slider"} tabIndex={compare?-1:0}
        aria-label={compare?"Markierungen auf dem Zahlenstrahl":"Schätzmarke setzen oder verschieben"} aria-disabled={compare||locked}
        aria-valuemin={compare?undefined:low} aria-valuemax={compare?undefined:high} aria-valuenow={compare?undefined:mark??anchors[1]}
        aria-valuetext={compare?undefined:mark===null?"Noch keine Marke. Drücke die Leertaste für die Mitte oder nutze die Pfeiltasten.":`${mark-low} Schritte rechts vom linken Ende`}
        onClick={e=>{if(compare||locked)return;const box=e.currentTarget.getBoundingClientRect();if(box.width>0)setMark(pointOnLine((e.clientX-box.left)/box.width,low,high));}}
        onKeyDown={e=>{if(compare||locked)return;
          if(["ArrowRight","ArrowUp","ArrowLeft","ArrowDown","Home","End"," ","Enter"].includes(e.key)){
            e.preventDefault();
            if(e.key==="Home")setMark(low);
            else if(e.key==="End")setMark(high);
            else if(e.key===" " || e.key==="Enter")setMark(mark??anchors[1]);
            else adjust(e.key==="ArrowRight"||e.key==="ArrowUp"?1:-1);
          }
        }}>
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t-2 border-slate-700"/>
        {[low,high].map(n=><span key={n} style={point(n)} aria-hidden="true" className="absolute top-1/2 h-4 -translate-x-1/2 -translate-y-1/2 border-l-2 border-slate-700"/>)}
        {mark!==null && <span aria-hidden="true" style={point(mark)} className="absolute bottom-1/2 -translate-x-1/2 text-xl leading-none text-indigo-700">▼</span>}
        {compare && <span aria-hidden="true" style={point(target)} className="absolute top-1/2 -translate-x-1/2 text-xl leading-none text-green-800">▲</span>}
      </div>
      <div className="flex justify-between font-bold"><span>{low}</span><span>{high}</span></div>
    </div>
    {!compare?<><div className="flex flex-wrap gap-2">
      <button type="button" disabled={locked||mark===low} className={chip} onClick={()=>adjust(-1)}>← Ein Schritt</button>
      <button type="button" disabled={locked} className={chip} onClick={()=>setMark(anchors[1])}>In die Mitte setzen</button>
      <button type="button" disabled={locked||mark===high} className={chip} onClick={()=>adjust(1)}>Ein Schritt →</button></div>
      <Button disabled={locked||mark===null} onClick={()=>setFrozen(true)}>Schätzung festhalten</Button></>:<>
      {mark!==null && <p>▼ Deine Marke: {mark}. ▲ Gesuchte Stelle: {target}. {estimateDescription(mark,target)}</p>}
      <fieldset disabled={locked} className="flex flex-wrap gap-1"><legend>Welcher Anker liegt am nächsten bei {target}? Sind zwei gleich nah, wähle einen davon.</legend>
        {anchors.map((n,i)=><button type="button" key={n} className={chip} aria-pressed={solved?nearestAnchors(task).includes(i):anchor===i}
          onClick={()=>setAnchor(i)}>{["Links","Mitte","Rechts"][i]} · {n}</button>)}</fieldset>
      {solved?<p>{task.solution}</p>:<Button disabled={locked||anchor===null} onClick={()=>onAnswer(anchor!==null&&nearestAnchors(task).includes(anchor),task.hint)}>Anker prüfen</Button>}
    </>}
  </section>;
}
