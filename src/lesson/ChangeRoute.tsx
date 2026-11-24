import { useState } from "react";
import { cellName, fountain, routeProblem, routeStep, routeText, routeTurn } from "@/game/changeRoute";
import type { DrawRouteTask, RouteTurnTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const control="min-h-11 rounded-xl border-2 bg-white px-2";
const travel:Record<number,[string,string]>={1:["→","rechts"],[-1]:["←","links"],3:["↓","unten"],[-3]:["↑","oben"]};
function MapGrid({route,start,goal,closed=[],choose,arrival}:{route:number[];start:number;goal:number;closed?:number[];choose?:(n:number)=>void;arrival?:number}) {
  const cx=(n:number)=>(n%3)*100+50, cy=(n:number)=>Math.floor(n/3)*100+50;
  const here=arrival===undefined?route.at(-1):fountain, icon=(n:number)=>n===fountain?"Brunnen":n===start?"Schule":n===goal?"Park":"";
  const heading=arrival===undefined?undefined:travel[fountain-arrival];
  return <div className="relative grid w-full max-w-80 grid-cols-3 rounded-xl border-2 bg-leaf-light">
    <svg aria-hidden="true" viewBox="0 0 300 300" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
      <polyline points={route.map(n=>cx(n)+","+cy(n)).join(" ")} fill="none" stroke="#2563a5" strokeWidth="6"/>
      {closed.length===2 && <g transform={`translate(${(cx(closed[0])+cx(closed[1]))/2} ${(cy(closed[0])+cy(closed[1]))/2})`}>
        <circle r="13" fill="#fff"/><path d="M-8 -8L8 8M-8 8L8 -8" stroke="#b91c1c" strokeWidth="6"/></g>}
    </svg>
    {Array.from({length:9},(_,n)=>{
      const facing=n===here && arrival!==undefined && heading ? `Ankunft von ${cellName(arrival)}, Blick auf dem Plan nach ${heading[1]}` : "";
      const label=[cellName(n),icon(n),here===n?"Hier stehst du":"",facing].filter(Boolean).join(", ");
      const face=<span className="rounded-md bg-white px-1 text-center">{cellName(n)}<small className="block">{icon(n)}</small>
        {facing && heading && <b aria-hidden="true" className="block text-2xl leading-none text-blue-800">{heading[0]}</b>}</span>;
      const cls="relative z-10 grid min-h-16 place-items-center border border-black/20 "+(here===n?"ring-2 ring-inset ring-blue-700":"");
      return choose?<button type="button" key={n} aria-label={label} className={cls} onClick={()=>choose(n)}>{face}</button>
        :<div key={n} role="img" aria-label={label} className={cls}>{face}</div>;
    })}
  </div>;
}
export function DrawRoute({task,status,onAnswer,onRoute}:FormatProps<DrawRouteTask> & {onRoute?:(route:number[])=>void}) {
  const [route,setRoute]=useState([task.start]),[message,setMessage]=useState("");
  const solved=status==="right" || status==="reveal", locked=status!=="ask";
  const shown=status==="reveal"?task.example:route;
  const choose=(n:number)=>{
    const last=route.at(-1)!;
    if(routeStep(last,n,task.closed)){setRoute([...route,n]);setMessage("");}
    else setMessage(routeStep(last,n)?"Hier ist die Baustelle. Gehe andersherum.":"Wähle ein direkt benachbartes Feld.");
  };
  return <section className="grid gap-2">
    <p>Starte {task.via?"an der Schule":"am Brunnen"} bei {cellName(task.start)}. Dein Ziel ist der Park bei {cellName(task.goal)}. Tippe deinen Weg Feld für Feld.</p>
    {task.closed.length>0 && <p className="font-bold">Gesperrt in beide Richtungen: {routeText(task.closed)}.</p>}
    <MapGrid start={8-task.goal} goal={task.goal} route={shown} closed={task.closed} choose={locked?undefined:choose}/>
    <p aria-live="polite">Dein Weg: {routeText(shown)}</p>
    {!solved && <><p role="status">{message}</p>
      <div className="flex flex-wrap gap-2">{["Letzten Schritt zurück","Neu beginnen"].map((label,i)=><button type="button" key={label}
        className={control} disabled={locked || route.length<2} onClick={()=>{setRoute(i?[task.start]:route.slice(0,-1));setMessage("");}}>{label}</button>)}</div>
      <Button disabled={locked || route.length<2} onClick={()=>{if(onRoute)onRoute(route);else {const hint=routeProblem(task,route);onAnswer(!hint,hint??undefined);}}}>Weg prüfen</Button></>}
  </section>;
}
export function RouteTurn({task,status,onAnswer}:FormatProps<RouteTurnTask>) {
  const at=task.route.indexOf(fountain),[selected,setSelected]=useState("");
  const answer=routeTurn(task.route), solved=status==="right" || status==="reveal",locked=status!=="ask";
  return <section className="grid gap-3">
    <MapGrid start={task.route[0]} goal={task.route.at(-1)!} route={task.route} arrival={task.route[at-1]}/>
    <p>Dein Weg: {routeText(task.route)}.</p>
    <p>Als du zum ersten Mal am Brunnen bei B2 ankommst, kommst du von {cellName(task.route[at-1])}. Der Pfeil zeigt deine Blickrichtung. Wie gehst du von dort weiter nach {cellName(task.route[at+1])}?</p>
    <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Deine Richtung</legend>
      {["links","geradeaus","rechts","zurück"].map(dir=><button type="button" key={dir}
        aria-pressed={(solved?answer:selected)===dir} className={control+" aria-pressed:bg-sky-light"} onClick={()=>setSelected(dir)}>{dir}</button>)}</fieldset>
    {!solved && <Button disabled={locked || !selected} onClick={()=>onAnswer(selected===answer,task.hint)}>Richtung prüfen</Button>}
  </section>;
}
