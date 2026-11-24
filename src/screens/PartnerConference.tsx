import { useReducer } from "react";
import { conferenceMove, freshConference, newProblem, stops, type ConferenceAction, type ConferenceState, type Jump } from "@/game/conference";
import { Button } from "@/ui/Button";

function NumberLine({start,path,marked=[],end}:{start:number;path:Jump[];marked?:number[];end?:number}){
  const labels=stops(start,path),gap=58,width=end===undefined?Math.max(180,labels.length*gap):360;
  const x=(index:number)=>end===undefined?18+index*gap:20+(width-40)*(labels[index]-start)/(end-start);
  return <figure className="rounded-xl bg-white p-2">
    <svg role="img" aria-label={"Start bei "+start+". "+path.map(jump=>"Plus "+jump.size+" bis "+jump.landing).join(". ")}
      viewBox={"0 0 "+width+" 91"} className="block w-full">
      <path d={"M5 57 H"+(width-12)+" l-5 -4 m5 4 l-5 4"} stroke="#352741" strokeWidth="2" fill="none"/>
      {path.map((jump,index)=>{
        const selected=marked.length===2&&labels[index]>=marked[0]&&jump.landing<=marked[1];
        const middle=(x(index)+x(index+1))/2;
        return <g key={index}><path d={"M"+x(index)+" 55 Q"+middle+" 7 "+x(index+1)+" 55 l-5 -4"}
          stroke={selected?"#6540a0":"#29796b"} strokeWidth={selected?4:2} fill="none"/>
          {end===undefined&&<text x={middle} y="23" textAnchor="middle" fontSize="14">+{jump.size}</text>}</g>;
      })}
      {labels.map((number,index)=><g key={number}><circle data-stop={number} cx={x(index)} cy="57" r={marked.includes(number)?5:3} fill="#4a3061"/>
        {(end===undefined||index===0||index===labels.length-1)&&<text textAnchor="middle" x={x(index)} y="80" fontSize="15">{number}</text>}</g>)}
    </svg>
    {end!==undefined&&<figcaption className="flex flex-wrap gap-x-3 gap-y-1 text-sm">{path.map((jump,index)=>
      <span key={index}>{labels[index]} + {jump.size} = {jump.landing}</span>)}</figcaption>}
  </figure>;
}
export function PartnerConference({onBack}:{onBack:()=>void}){
  const [state,act]=useReducer(conferenceMove,undefined,()=>freshConference());
  return <ConferenceView state={state} act={act} onBack={onBack}/>;
}
export function ConferenceView({state,act,onBack}:{state:ConferenceState;act:(a:ConferenceAction)=>void;onBack:()=>void}){
  const {phase,problem,paths,marked}=state,writing=phase==="first"||phase==="second";
  const path=phase==="first"?paths[0]:paths[1];
  const input=(label:string,field:"size"|"landing"|"length")=><label>{label} <input aria-label={label} autoComplete="off" inputMode="numeric"
    value={state[field]} onChange={event=>act({type:field,value:event.target.value})} className="w-16 rounded border p-1"/></label>;
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <button type="button" className="min-h-11 justify-self-start rounded-xl bg-white px-3" onClick={onBack}>← Zur Partnerwerkstatt</button>
    <h1 className="font-display text-3xl">{phase==="pass"?"Gerät weitergeben":"Unsere Rechenkonferenz"}</h1>
    {phase==="pass"?<><p>Jetzt ist das andere Kind dran. Öffne deine Aufgabe, wenn du bereit bist.</p><Button onClick={()=>act({type:"open"})}>Meine Aufgabe öffnen</Button></>:
      <><h2 className="font-display text-2xl">{problem.start} + {problem.addend} = {writing?"?":paths[0].at(-1)?.landing}</h2>
        {writing?<><p>Beginne bei {problem.start}. Lege die {problem.addend} in zwei bis fünf Sprüngen zurück. Bestimme deine Sprungweiten und Landepunkte selbst.</p>
          <NumberLine start={problem.start} path={path}/>
          {input("Wie weit springst du?", "size")}{input("Bei welcher Zahl landest du?", "landing")}
          <Button disabled={!state.size||!state.landing} onClick={()=>act({type:"add"})}>Sprung eintragen</Button>
          <button type="button" disabled={!path.length} className="min-h-11 underline" onClick={()=>act({type:"undo"})}>Letzten Sprung zurücknehmen</button>
          <Button tone="sky" disabled={path.length<2} onClick={()=>act({type:"finish"})}>{phase==="first"?"Weg abschließen und übergeben":"Weg abschließen und vergleichen"}</Button></>:
          <><p>{phase==="done"?"Euer gemeinsamer Abschnitt ist markiert.":"Findet auf beiden Wegen dieselbe Anfangs- und Endzahl. Ein Abschnitt darf mehrere Sprünge umfassen. Auch der ganze Weg ist möglich."}</p>
            {([0,1] as const).map(index=><section key={index}><h3 className="font-bold">Weg von Kind {index+1}</h3>
              <NumberLine start={problem.start} end={problem.start+problem.addend} path={paths[index]} marked={marked[index]}/>
              {phase==="compare"&&<div role="group" aria-label={"Grenzen auf Weg "+(index+1)} className="flex flex-wrap gap-1">{stops(problem.start,paths[index]).map(value=>
                <button key={value} type="button" aria-pressed={marked[index].includes(value)} className={"min-h-11 min-w-11 rounded border "+(marked[index].includes(value)?"bg-grape-light":"bg-white")}
                  onClick={()=>act({type:"mark",path:index,value})}>{value}</button>)}</div>}</section>)}
            {phase==="compare"?<>{input("Wie lang ist euer Abschnitt?", "length")}<Button disabled={!state.length} onClick={()=>act({type:"check"})}>Abschnitte vergleichen</Button></>:
              <><p>Beide Wege führen von {marked[0][0]} bis {marked[0][1]}. Der Abschnitt ist {state.length} lang.</p>
                <Button onClick={()=>act({type:"reset",problem:newProblem()})}>Rollen tauschen · neue Aufgabe</Button></>}</>}
        {state.message&&<p role="status" className="rounded-xl bg-sun-light p-2">{state.message}</p>}</>}
  </main>;
}
