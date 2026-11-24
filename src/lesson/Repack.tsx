import { useState } from "react";
import { appendPacking, canRepack, factorsFit, materialChecked, packingReason, packingReport, type PackedGroup, type Packing } from "@/game/repack";
import type { RepackTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Stones({amount}:{amount:number}){
  return <span role="img" aria-label={amount+(amount===1?" Stein":" Steine")} className="inline-flex flex-wrap gap-0.5 rounded border bg-white p-1">
    {Array.from({length:amount},(_,index)=><span key={index} aria-hidden className="h-2 w-2 rounded-full bg-grape"/>)}</span>;
}
function instruction(pack:Packing){
  return pack.action==="split"?"Teile jede Schachtel in zwei gleich volle Schachteln.":"Lege je zwei Schachteln zu einer vollen Schachtel zusammen.";
}
function boxName(id:number){return String.fromCharCode(65+id);}
export function SplitResult({fill,cut}:{fill:number;cut:number}){
  const rest=fill-cut;
  return <span className="grid gap-1">
    {cut!==rest&&<><span>Dein Schnitt: links {cut}, rechts {rest}.</span>
      <span><Stones amount={cut}/> | <Stones amount={rest}/></span>
      <span>Von der {cut>rest?"linken":"rechten"} Seite kommt ein Stein heraus.</span></>}
    <span><Stones amount={Math.min(cut,rest)}/> und <Stones amount={Math.min(cut,rest)}/>
      {cut!==rest&&<> · übrig: <Stones amount={1}/></>}</span></span>;
}
function PackingBoard({pack,groups,setGroups,locked}:{pack:Packing;groups:PackedGroup[];setGroups:(g:PackedGroup[])=>void;locked:boolean}) {
  const [selected,setSelected]=useState<number|null>(null);
  const [note,setNote]=useState("");
  const blocked=locked||materialChecked(pack,groups);
  function select(id:number){
    setNote("");
    if(selected===id){setSelected(null);return;}
    if(pack.action==="merge"&&selected!==null){
      setGroups(appendPacking(pack,groups,[selected,id]));setSelected(null);
    }else setSelected(id);
  }
  return <div className="grid gap-2 rounded-xl bg-sky-light p-3">
    <p>{pack.action==="split"?"Wähle eine Schachtel und setze die Trennlinie zwischen zwei Steine.":"Tippe zwei Schachteln an, die du zusammenlegen möchtest."}</p>
    <div className="flex flex-wrap gap-2">{Array.from({length:pack.boxes},(_,id)=>{
      const used=groups.some(group=>group.sources.includes(id));
      return <button key={id} type="button" disabled={blocked||used} aria-pressed={selected===id} onClick={()=>select(id)}
        className={"grid gap-1 rounded-xl border p-2 "+(used?"bg-mist":selected===id?"bg-sun-light":"bg-white")}>
        <span>Schachtel {boxName(id)}{used?" ✓":""}</span><Stones amount={pack.fill}/></button>;
    })}</div>
    {pack.action==="split"&&selected!==null&&<fieldset><legend>Schachtel {boxName(selected)}: Wo trennst du?</legend>
      <div className="flex flex-wrap gap-1">{Array.from({length:pack.fill-1},(_,index)=>index+1).map(cut=><button key={cut} type="button"
        className="rounded border bg-white p-2" disabled={locked} onClick={()=>{
          const next=appendPacking(pack,groups,[selected],cut);
          if(next===groups){setNote("Auf einer Seite liegen "+cut+", auf der anderen "+(pack.fill-cut)+". Rücke die Linie näher zur Mitte.");return;}
          setGroups(next);setSelected(null);setNote("");
        }}>Nach {cut} {cut===1?"Stein":"Steinen"}</button>)}</div></fieldset>}
    <p role="status">{note}</p>
    {groups.length>0&&<><ul className="grid gap-1">{groups.map(group=><li key={group.sources.join("-")} className="flex flex-wrap items-center gap-2">
      <strong>{group.sources.map(boxName).join(" + ")} →</strong>{pack.action==="split"?
        <SplitResult fill={pack.fill} cut={group.cut!}/>:<Stones amount={2*pack.fill}/>}</li>)}</ul>
      <button type="button" className="min-h-10 justify-self-start underline" disabled={locked} onClick={()=>{setSelected(null);setNote("");setGroups(groups.slice(0,-1));}}>Letzten Schritt zurücknehmen</button></>}
  </div>;
}
const reasons={same:"Alle alten Steine liegen in den neuen Schachteln. Es kam keiner dazu und keiner ging weg.",
  oddFill:"Beim Teilen bleibt ein einzelner Stein übrig.",oddBoxes:"Beim Zusammenlegen bleibt eine Schachtel ohne Partner."};
export function Repack({task,status,onAnswer}:FormatProps<RepackTask>){
  const [stage,setStage]=useState<"first"|"predict"|"check">("first");
  const [groups,setGroups]=useState<PackedGroup[]>([]),[prediction,setPrediction]=useState<boolean|null>(null);
  const [reason,setReason]=useState(""),[total,setTotal]=useState("");
  const [boxes,setBoxes]=useState(""),[fill,setFill]=useState(""),[forecast,setForecast]=useState("");
  const pack=stage==="first"?task.first:task.transfer;
  const complete=materialChecked(pack,groups),locked=status!=="ask",finished=status==="right"||status==="reveal";
  const factors=<fieldset className="grid gap-2"><legend>{stage==="predict"?"Deine Vorhersage":"Deine Zahlen nach dem Umpacken"}</legend>
    <label>Wie viele neue Schachteln? <input className="w-16 rounded border p-2" inputMode="numeric" disabled={locked} value={boxes} onChange={event=>setBoxes(event.target.value)}/></label>
    <label>Wie viele Steine je neuer Schachtel? <input className="w-16 rounded border p-2" inputMode="numeric" disabled={locked} value={fill} onChange={event=>setFill(event.target.value)}/></label></fieldset>;
  if(finished)return <section className="grid gap-3"><p>{packingReport(task.first)}</p><strong>Neuer Auftrag</strong><p>{packingReport(task.transfer)}</p></section>;
  return <section className="grid gap-3">{stage!=="first"&&<><details><summary>Dein erster Auftrag</summary>{packingReport(task.first)}</details><strong>Neuer Auftrag</strong></>}
    <p>Hier sind {pack.boxes} Schachteln mit je {pack.fill} Steinen. {instruction(pack)} Jeder Stein bleibt ganz.</p>
    {stage==="predict"?<><p>Geht der Auftrag mit allen Steinen auf? Sage es vor dem Umpacken voraus.</p>
      <div className="flex gap-2">{[true,false].map(yes=><button key={String(yes)} type="button" disabled={locked}
        className={"rounded-xl border p-2 "+(yes===prediction?"bg-sky-light":"bg-white")} aria-pressed={yes===prediction} onClick={()=>setPrediction(yes)}>{yes?"Ja, das geht":"Nein, etwas bleibt übrig"}</button>)}</div>
      {prediction&&factors}
      <Button disabled={locked||prediction===null||(prediction&&(!/^\d+$/.test(boxes)||!/^\d+$/.test(fill)))} onClick={()=>{
        setForecast(prediction?boxes+" Schachteln mit je "+fill+" Steinen.":"Etwas bleibt übrig.");setStage("check");
      }}>Am Material prüfen</Button></>:
      <>{stage==="check"&&<p>Deine Vorhersage: {forecast} Prüfe sie an den Schachteln.</p>}
      <PackingBoard key={stage} pack={pack} groups={groups} setGroups={setGroups} locked={locked}/>
      {complete&&<><fieldset><legend>Was zeigt dein Material?</legend>{(["oddBoxes","same","oddFill"] as const).map(key=><label key={key} className="flex min-h-10 items-center gap-2">
        <input type="radio" name="pack-reason" value={key} checked={reason===key} disabled={locked} onChange={()=>setReason(key)}/>{reasons[key]}</label>)}</fieldset>
        {stage==="first"&&<label>Wie viele Steine hast du insgesamt umgepackt? <input inputMode="numeric" disabled={locked} value={total}
          className="w-16 rounded border p-2" onChange={event=>setTotal(event.target.value)}/></label>}
        {stage==="check"&&<><label><input type="checkbox" checked={prediction===true} disabled={locked}
          onChange={event=>setPrediction(event.target.checked)}/> Nach meiner Prüfung geht das Umpacken ohne Rest auf.</label>
          {prediction&&factors}</>}
        <Button disabled={locked||!reason||(stage==="first"&&!total)||(stage==="check"&&prediction===true&&(!boxes||!fill))} onClick={()=>{
          if(reason!==packingReason(pack)){onAnswer(false,"Schau auf die neuen Schachteln. Bleibt ein einzelner Stein oder eine ganze Schachtel ohne Partner?");return;}
          if(stage==="first"){
            if(!/^\d+$/.test(total)||Number(total)!==pack.boxes*pack.fill){onAnswer(false,"Zähle alle Steine in deinen neuen Schachteln.");return;}
            setStage("predict");setGroups([]);setReason("");
          }else if(prediction!==canRepack(pack)){
            onAnswer(false,"Dein Material zeigt, was passiert. Vergleiche es mit deiner Vorhersage und ändere sie, wenn nötig.");
          }else if(prediction&&!factorsFit(pack,boxes,fill)){
            onAnswer(false,"Zähle zuerst die neuen Schachteln. Zähle dann die Steine in genau einer neuen Schachtel.");
          }else onAnswer(true);
        }}>{stage==="first"?"Umpacken prüfen":"Ergebnis prüfen"}</Button></>}
        </>}
  </section>;
}
