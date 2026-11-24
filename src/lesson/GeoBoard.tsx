import { useState } from "react";
import { exampleBand, pegHint, pegName, pegSides } from "@/game/geoBoard";
import type { GeoBoardTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Board({points,choose}:{points:number[];choose?:(n:number)=>void}) {
  const center=(n:number)=>(n+0.5)*25;
  return <div className="relative grid w-full max-w-72 grid-cols-4 rounded-xl border-2 bg-sun-light p-0">
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {[0,1,2,3].map(n=><g key={n} stroke="#ab976f" strokeWidth=".4"><path d={`M12.5 ${center(n)}H87.5M${center(n)} 12.5V87.5`}/></g>)}
      <polyline points={(points.length===4?[...points,points[0]]:points).map(p=>center(p%4)+","+center(Math.floor(p/4))).join(" ")}
        fill={points.length===4?"#926de533":"none"} stroke="#66409c" strokeWidth="2.2" strokeLinejoin="round"/>
    </svg>
    {Array.from({length:16},(_,i)=>{
      const selected=points.includes(i);
      const dot=<span aria-hidden="true" className={"grid size-6 place-items-center rounded-full border-2 text-xs font-bold "+(selected?"bg-grape text-white":"bg-white")}>
        {selected?points.indexOf(i)+1:"·"}</span>;
      const content=<>{dot}<small className="absolute bottom-0 rounded bg-sun-light px-0.5 text-[10px]">{pegName(i)}</small></>;
      const label=pegName(i)+(selected?", Ecke "+(points.indexOf(i)+1):"");
      const cls="relative grid aspect-square min-h-11 place-items-center";
      return choose?<button type="button" key={i} aria-pressed={selected} aria-label={label} className={cls} onClick={()=>choose(i)}>{content}</button>:
        <div key={i} aria-hidden="true" className={cls}>{content}</div>;
    })}
  </div>;
}
export function GeoSolution({title,points,width,height}:{title:string;points:number[];width:number;height:number}) {
  const own=pegHint(points,width,height)===null, shown=own?points:exampleBand(width,height);
  return <section className="grid gap-2"><h3 className="font-bold">{title} · {own?"Deine Figur":"Ein Beispiel"}</h3>
    <Board points={shown}/><p>Ecken: {shown.map(pegName).join(" → ")} → {pegName(shown[0])}.</p>
    <p>Seitenlängen in Punktabständen: {pegSides(shown).join(", ")}.</p></section>;
}
export function GeoBoard({task,status,onAnswer}:FormatProps<GeoBoardTask>) {
  const [rect,setRect]=useState<number[]>([]),[square,setSquare]=useState<number[]>([]),[second,setSecond]=useState(false),[message,setMessage]=useState("");
  const points=second?square:rect,set=second?setSquare:setRect;
  const locked=status!=="ask",solved=status==="right"||status==="reveal";
  if(solved)return <div className="grid gap-3"><GeoSolution title="Rechteck" points={rect} width={task.width} height={task.height}/>
    <GeoSolution title="Quadrat" points={square} width={task.side} height={task.side}/></div>;
  function choose(n:number) {
    if(points.includes(n)){setMessage("Dieser Punkt ist schon eine Ecke. Das Band schließt sich von selbst.");return;}
    if(points.length===4){setMessage("Das Band ist geschlossen. Nimm die letzte Ecke zurück, wenn du etwas ändern möchtest.");return;}
    set([...points,n]);setMessage("");
  }
  function check(){
    const hint=pegHint(points,second?task.side:task.width,second?task.side:task.height);
    if(hint)onAnswer(false,hint);
    else if(second)onAnswer(true);
    else{setSecond(true);setMessage("");}
  }
  return <section className="grid gap-2">
    <h3 className="font-bold">{second?`Quadrat mit Seitenlänge ${task.side}`:`Rechteck mit Seitenlängen ${task.width} und ${task.height}`}</h3>
    <p>Zähle die Abstände zwischen den Punkten. Alle Seiten verlaufen waagerecht oder senkrecht. Wähle vier Ecken der Reihe nach außen herum.</p>
    <Board points={points} choose={locked?undefined:choose}/>
    <p aria-live="polite">Deine Ecken: {points.length?points.map(pegName).join(" → "):"noch keine"}.</p>
    {message && <p role="status">{message}</p>}
    <button type="button" className="min-h-11 underline" disabled={locked||!points.length} onClick={()=>{set(points.slice(0,-1));setMessage("");}}>Letzte Ecke zurücknehmen</button>
    <Button disabled={locked||points.length!==4} onClick={check}>{second?"Quadrat prüfen":"Rechteck prüfen"}</Button>
  </section>;
}
