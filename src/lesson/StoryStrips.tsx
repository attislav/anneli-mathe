import { useState } from "react";
import { moveStrip, stripEquationHint, stripLayoutHint, stripNumber, stripOwner, stripRoles, stripValue, type StoryRole } from "@/game/storyStrips";
import type { StripStoryTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function StripResult({task,terms,op}:{task:StripStoryTask;terms:(StoryRole|"")[];op:string}) {
  const own=stripEquationHint(task,terms,op,String(stripValue(task,task.missing)))===null;
  const whole=task.missing==="whole";
  const roles:StoryRole[]=own?terms as StoryRole[]:whole?["first","second","whole"]:
    ["whole",task.missing==="first"?"second":"first",task.missing];
  const operator=own?op:whole?"+":"−";
  return <div className="rounded-xl bg-leaf-light p-3"><h3 className="font-bold">{own?"Deine Rechnung":"Ein möglicher Rechenweg"}</h3>
    <p>{roles.map((r,i)=>(i===1?" "+operator+" ":i===2?" = ":"")+stripValue(task,r)).join("")}</p><p>{task.solution}</p></div>;
}

export function StoryStrips({task,status,onAnswer}:FormatProps<StripStoryTask>) {
  const [positions,setPositions]=useState<(StoryRole|null)[]>([null,null,null]),[card,setCard]=useState<StoryRole|null>(null);
  const [equation,setEquation]=useState(false),[terms,setTerms]=useState<(StoryRole|"")[]>(["","",""]),[op,setOp]=useState(""),[entry,setEntry]=useState("");
  const solved=status==="right" || status==="reveal",locked=status!=="ask",control="min-h-11 rounded-xl border-2 bg-white px-2 aria-pressed:bg-sky-light";
  const shown=solved && stripLayoutHint(positions)?stripRoles:positions;
  const label=(s:StoryRole)=>stripOwner(task,s)+" · "+(solved?stripValue(task,s):stripNumber(task,s));
  function check(){
    const hint=equation?stripEquationHint(task,terms,op,entry):stripLayoutHint(positions);
    if(hint)onAnswer(false,hint);
    else if(equation)onAnswer(true);
    else setEquation(true);
  }
  function term(i:number){
    return <select aria-label={["Erste Karte","Zweite Karte","Ergebniskarte"][i]} className={control} disabled={locked} value={terms[i]}
      onChange={e=>setTerms(terms.map((v,j)=>j===i?e.target.value as StoryRole|"":v))}>
      <option value="">Karte</option>{task.order.map(r=><option key={r} value={r}>{label(r)}</option>)}</select>;
  }
  return <section className="grid gap-3">
    {!equation && !solved && <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Wähle eine Karte und dann ihren Platz.</legend>
      {task.order.map(r=><button type="button" key={r} className={control} aria-pressed={card===r} onClick={()=>setCard(r)}>{label(r)}</button>)}</fieldset>}
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-sky-light p-2"><h3 className="col-span-2 font-bold">Streifenplan</h3>
      {shown.map((r,i)=><div key={i} className={(i===0?"col-span-2 ":"")+"grid rounded-md border-2 border-sky-700 bg-white text-center"}>
        {equation||solved?<span className="p-2">{i===0?"Ganzes":"Teil"}: {r && label(r)}</span>:
          <button type="button" className="min-h-12 px-2" disabled={locked || !card}
            aria-label={(i===0?"Ganzes":i===1?"Teil links":"Teil rechts")+", "+(r?label(r):"leer")}
            onClick={()=>{if(card){setPositions(moveStrip(positions,card,i));setCard(null);}}}>{i===0?"Ganzes":"Teil"} · {r?label(r):"Karte ablegen"}</button>}
      </div>)}
      <p className="col-span-2 text-sm">Die Streifen zeigen, was zusammengehört. Ihre Länge verrät keine Anzahl.</p>
    </div>
    {equation && !solved && <><fieldset disabled={locked} className="flex flex-wrap items-center gap-1"><legend>Baue die Rechnung mit jeder Karte genau einmal.</legend>
      {term(0)}<select aria-label="Rechenzeichen" className={control} value={op} onChange={e=>setOp(e.target.value)}>
        <option value="">Zeichen</option><option>+</option><option>−</option></select>{term(1)} = {term(2)}
    </fieldset>
      <label>Welche Zahl gehört zu „?“ <input inputMode="numeric" className={control+" w-20"} disabled={locked} value={entry}
        onChange={e=>{if(/^\d{0,3}$/.test(e.target.value))setEntry(e.target.value);}}/></label>
      <button type="button" className="min-h-11 underline" disabled={locked} onClick={()=>{setEquation(false);setTerms(["","",""]);setOp("");setEntry("");}}>Streifenplan ändern</button>
    </>}
    {solved ? <StripResult task={task} terms={terms} op={op}/>:
      <Button disabled={locked || (equation?terms.includes("") || !op || !entry:positions.includes(null))} onClick={check}>
        {equation?"Rechnung prüfen":"Streifenplan prüfen"}</Button>}
  </section>;
}
