import { useReducer } from "react";
import { newTrail, operation, plantedValues, trailMove, trailProblems, trailValues, type TrailAction, type TrailState } from "@/game/errorTrail";
import { Button } from "@/ui/Button";

const chip="min-h-11 rounded-xl border-2 bg-white px-3 aria-pressed:bg-sky-light";
export function PartnerTrail({onBack}:{onBack:()=>void}) {
  const [s,act]=useReducer(trailMove,undefined,newTrail);
  return <PartnerTrailView s={s} act={act} onBack={onBack}/>;
}
export function PartnerTrailView({s,act,onBack}:{s:TrailState;act:(a:TrailAction)=>void;onBack:()=>void}) {
  const frame=(content:React.ReactNode)=><main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <button type="button" className="min-h-11 justify-self-start underline" onClick={onBack}>← Zur Partnerwerkstatt</button>
    <h1 className="font-display text-3xl">{s.phase==="pass"?"Gerät weitergeben":"Eine Fehlerspur bauen"}</h1>
    {content}{s.message && <p role="status" className="rounded-xl bg-sun-light p-2">{s.message}</p>}
  </main>;
  if(s.phase==="choose")return frame(<><p>Wähle eine Rechnung für deine Fehlerspur.</p>
    <div className="grid grid-cols-2 gap-2">{trailProblems.map(([n,d],i)=><button key={i} type="button" className={chip} onClick={()=>act({type:"pick",index:i})}>{operation(n,d)}</button>)}</div></>);
  if(s.phase==="pass")return frame(<><p>Jetzt ist das andere Kind dran. Öffne die Aufgabe, wenn du bereit bist.</p>
    <Button onClick={()=>act({type:"open"})}>Ich bin bereit</Button></>);
  const {start,tens,ones,mid,end}=trailValues(s.problem), first=operation(start,tens);
  const planted=s.phase==="solve"?plantedValues(s):null;
  const input=(label:string,stage:0|1)=><label>{label} <input aria-label={label} inputMode="numeric" className={chip+" w-20"}
    value={s.inputs[stage]} onChange={e=>act({type:"number",row:stage,text:e.target.value})}/></label>;
  const rows=(mark:0|1|null)=><fieldset className="flex flex-wrap gap-2"><legend>{s.phase==="plant"?"Welche Zeile soll den Fehler enthalten?":"In welcher Zeile ist der erste Fehler?"}</legend>
    {([0,1] as const).map(i=><button type="button" key={i} className={chip} aria-pressed={mark===i} onClick={()=>act({type:"row",row:i})}>Zeile {i+1}</button>)}</fieldset>;
  return frame(<><h2 className="font-display text-xl">Aufgabe: {operation(start,tens+ones)}</h2>
    {s.phase==="author" && <>
      <p>Rechne zuerst richtig. Nimm erst die Zehner und dann die Einer.</p>
      {input("Zeile 1: "+first+" =",0)}
      {input("Zeile 2: "+(s.inputs[0]!==""?operation(Number(s.inputs[0]),ones):"Dein Zwischenergebnis "+(ones<0?"−":"+")+" "+Math.abs(ones))+" =",1)}
      <Button disabled={s.inputs.includes("")} onClick={()=>act({type:"check"})}>Rechenweg prüfen</Button>
    </>}
    {(s.phase==="plant" || s.phase==="done") && <div className="rounded-xl bg-leaf-light p-3">
      <h3 className="font-bold">Richtiger Rechenweg</h3><p>1. {first} = {mid}</p><p>2. {operation(mid,ones)} = {end}</p></div>}
    {s.phase==="plant" && <>{rows(s.row)}
      {s.row!==null && <><label>Dein falsches Ergebnis für Zeile {s.row+1} <input className={chip+" w-20"} inputMode="numeric" value={s.falseValue}
        onChange={e=>act({type:"fake",text:e.target.value})}/></label>
        {s.row===0 && <p>Die nächste Zeile rechnet mit deiner falschen Zahl weiter.</p>}</>}
      <Button disabled={s.row===null || s.falseValue===""} onClick={()=>act({type:"check"})}>Fehlerspur verdecken</Button>
      <button type="button" className="min-h-11 underline" onClick={()=>act({type:"reset"})}>Andere Aufgabe wählen</button>
    </>}
    {s.phase==="solve" && planted && <>
      <div className="rounded-xl bg-white p-3"><p>1. {first} = {planted[0]}</p><p>2. {operation(planted[0],ones)} = {planted[1]}</p></div>
      {rows(s.mark)}
      {s.mark===0 && input("Richtiges Ergebnis in Zeile 1",0)}
      {s.mark!==null && input("Richtiges Ergebnis in Zeile 2",1)}
      <Button disabled={s.mark===null || s.inputs[1]==="" || (s.mark===0 && s.inputs[0]==="")} onClick={()=>act({type:"check"})}>Korrektur prüfen</Button>
    </>}
    {s.phase==="done" && <><p>{s.row===0?"Der Fehler begann in Zeile 1. Mit dem richtigen Zwischenergebnis stimmt auch das Endergebnis.":"Zeile 1 war richtig. Du hast das Ergebnis in Zeile 2 korrigiert."}</p>
      <Button onClick={()=>act({type:"reset"})}>Rollen tauschen und neue Spur bauen</Button></>}
  </>);
}
