import { useState } from "react";
import { finding, MarbleRound, readings, surfaces, type Finding, type Reading, type Surface } from "@/game/marbleTest";
import { Button } from "@/ui/Button";

function rowName(row:Reading){return row.surface+" · Lauf "+row.run;}
function choiceName(choice:Finding,rows:Reading[]){
  if(choice==="both")return "Beide Unterlagen";
  if(choice==="neither")return "Keine der beiden";
  return rows[choice==="first"?0:2].surface;
}
export function MeasuringTrack({row}:{row:Reading}){
  const x=(cm:number)=>16+cm*22;
  const endpoint=row.cm%2===0?"am Strich mit der Zahl "+row.cm:"einen kleinen Strich nach der Zahl "+(row.cm-1);
  return <svg role="img" aria-label={rowName(row)+". Start bei null, Ziel "+endpoint+". Jeder kleine Strich ist ein Zentimeter."}
    viewBox="0 0 300 62" className="block w-full max-w-md">
    <line x1={x(0)} x2={x(12)} y1="35" y2="35" stroke="#312745" strokeWidth="2"/>
    {Array.from({length:13},(_,cm)=><g key={cm}><line x1={x(cm)} x2={x(cm)} y1={cm%2===0?25:30} y2="40" stroke="#312745"/>
      {cm%2===0&&<text x={x(cm)} y="55" textAnchor="middle" fontSize="12">{cm}</text>}</g>)}
    <line x1={x(0)} x2={x(row.cm)} y1="18" y2="18" stroke="#488b80" strokeWidth="4"/>
    <line x1={x(0)} x2={x(0)} y1="10" y2="36" stroke="#312745" strokeWidth="2"/>
    <circle cx={x(row.cm)} cy="17" r="6" fill="#764299"/><line x1={x(row.cm)} x2={x(row.cm)} y1="23" y2="36" stroke="#764299" strokeWidth="2"/>
    <text x="293" y="55" textAnchor="middle" fontSize="10">cm</text>
  </svg>;
}
export function MarbleNote({round,completed}:{round:MarbleRound;completed:number}){
  if(completed<1)return null;
  const rows=round.rows,minimum=round.experiment.minimum;
  return <section className="grid gap-2 rounded-xl bg-sky-light p-3"><h2 className="font-bold">Unser Versuchsprotokoll</h2>
    <p>{round.revealed.has(1)?"Berichtigte Messwerte":"Deine Messwerte"} für {rows[0].surface} und {rows[2].surface}</p>
    <table className="text-left"><thead><tr><th scope="col">Messung</th><th scope="col">Rollweite</th></tr></thead>
      <tbody>{rows.map(row=><tr key={rowName(row)}><th scope="row">{rowName(row)}</th><td>{row.cm} cm</td></tr>)}</tbody></table>
    {([2,3] as const).filter(step=>completed>=step).map(step=><div key={step}><h3 className="font-bold">{step===2?"Weitester Einzellauf":"Beide Läufe mindestens "+minimum+" cm"}</h3>
      <p>{choiceName(finding(rows,step,minimum),rows)}. {round.revealed.has(step)?"Beispielbelege":"Deine Belege"}:</p>
      <ul>{round.proofs[step]?.map(index=><li key={index}>{rowName(rows[index])}: {rows[index].cm} cm{step===3?(rows[index].cm<minimum?" · zu kurz":" · weit genug"):""}</li>)}</ul></div>)}
    {completed===3&&<p>Diese Ergebnisse gelten für eure vier gemessenen Läufe.</p>}
  </section>;
}
export function MarbleWork({round,refresh}:{round:MarbleRound;refresh:()=>void}){
  const [chosen,setChosen]=useState<Surface[]>([]),[measuring,setMeasuring]=useState(false);
  const [values,setValues]=useState(["","","",""]),[answer,setAnswer]=useState<Finding|null>(null),[marked,setMarked]=useState<number[]>([]);
  const {number,status,task}=round.state,locked=status!=="ask";
  if(status==="reveal"||status==="right")return null;
  if(number===1&&!measuring)return <section className="grid gap-2"><p>Wähle zwei Unterlagen. Auf jeder lassen wir die Murmel zweimal von derselben Startlinie rollen.</p>
    <div className="flex flex-wrap gap-2">{surfaces.map(surface=><button key={surface} type="button" aria-pressed={chosen.includes(surface)}
      className={"min-h-11 rounded-xl border-2 p-2 "+(chosen.includes(surface)?"bg-grape-light":"bg-white")}
      disabled={locked||(!chosen.includes(surface)&&chosen.length===2)} onClick={()=>setChosen(chosen.includes(surface)?chosen.filter(other=>other!==surface):[...chosen,surface])}>{surface}</button>)}</div>
    <Button disabled={locked||chosen.length!==2} onClick={()=>setMeasuring(true)}>Versuch starten</Button></section>;
  if(number===1)return <section className="grid gap-2"><p>Die Startlinie liegt bei null. Lies am Strich unter jeder Murmel ab, wie weit sie gerollt ist.</p>
    {readings(round.experiment,chosen).map((row,index)=><div className="rounded-xl bg-white p-2" key={rowName(row)}>
      <strong>{rowName(row)}</strong><MeasuringTrack row={row}/><label>Rollweite <input aria-label={rowName(row)+" in Zentimetern"} disabled={locked} inputMode="numeric"
        className="w-14 rounded border p-1" value={values[index]} onChange={event=>setValues(values.map((old,i)=>i===index?event.target.value:old))}/> cm</label></div>)}
    <Button disabled={locked||values.some(value=>!/^\d+$/.test(value))} onClick={()=>{round.submit(task.id,{step:1,chosen,values:values.map(Number)});refresh();}}>Messwerte eintragen</Button></section>;
  const step=number===2?2:3,rows=round.rows;
  const choices:Finding[]=step===2?["first","second","both"]:["first","second","both","neither"];
  return <section className="grid gap-2"><div className="flex flex-wrap gap-2">{choices.map(choice=><button type="button" key={choice} disabled={locked}
    aria-pressed={answer===choice} className={"min-h-11 rounded-xl border-2 p-2 "+(answer===choice?"bg-grape-light":"bg-white")}
    onClick={()=>setAnswer(choice)}>{choiceName(choice,rows)}</button>)}</div>
    <fieldset className="grid"><legend>{step===2?"Markiere alle Läufe mit der größten Weite.":
      "Belege beide Unterlagen: Markiere bei einer passenden Unterlage beide Läufe. Markiere sonst mindestens einen zu kurzen Lauf."}</legend>
      {rows.map((row,index)=><label key={rowName(row)} className="flex min-h-11 items-center gap-2"><input type="checkbox" disabled={locked}
        checked={marked.includes(index)} onChange={()=>setMarked(marked.includes(index)?marked.filter(i=>i!==index):[...marked,index])}/>{rowName(row)} · {row.cm} cm</label>)}</fieldset>
    <Button disabled={locked||!answer||!marked.length} onClick={()=>{if(answer){round.submit(task.id,{step,answer,marked});refresh();}}}>Auswertung prüfen</Button></section>;
}
