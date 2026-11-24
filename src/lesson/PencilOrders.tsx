import {useState} from "react";
import {bestShipment,emptyShipment,movePencils,openPack,pencilCount,shipped,stockLeft,type Shipment,type Stock} from "@/game/pencilOrders";
import type {PencilTask} from "@/game/types";
import type {FormatProps} from "./formats";
import {Button} from "@/ui/Button";

function StockText({stock}:{stock:Stock}){
  return <span>{stock.packs} Päckchen und {stock.singles} {stock.singles===1?"loser Stift":"lose Stifte"}</span>;
}
function StockPicture({stock}:{stock:Stock}){
  return <div aria-hidden className="flex flex-wrap items-center gap-1">
    {Array.from({length:stock.packs},(_,i)=><span key={"p"+i} className="rounded border border-grape bg-grape-light px-1 text-xs font-bold">10</span>)}
    {Array.from({length:stock.singles},(_,i)=><span key={"s"+i} className={"h-4 w-1 rounded-t bg-grape "+(i%5===0?"ml-1":"")}/>)}
  </div>;
}
function Slips({plan,task}:{plan:Shipment;task:PencilTask}){
  return <ul className="grid gap-1">{plan.boxes.map((box,i)=><li key={i}>Klasse 2{i===0?"a":"b"}: <StockText stock={box}/> = {pencilCount(box)} Stifte.</li>)}
    <li>Im Lager: <StockText stock={stockLeft(task,plan)}/> · Geöffnete Päckchen: {plan.opened}.</li></ul>;
}
export function PencilOrders({task,status,onAnswer}:FormatProps<PencilTask>){
  const [history,setHistory]=useState<Shipment[]>(()=>[emptyShipment()]);
  const [original,setOriginal]=useState<Shipment|null>(null);
  const [better,setBetter]=useState<boolean|null>(null),[amount,setAmount]=useState("1");
  const plan=history.at(-1)!,rest=stockLeft(task,plan);
  const locked=status!=="ask",finished=status==="right"||status==="reveal";
  const best=bestShipment(task);
  function change(next:Shipment){if(next!==plan)setHistory([...history,next]);}
  if(finished){
    const own=shipped(task,plan)&&(status==="right"||!task.optimize||plan.opened===best.opened);
    return <section className="grid gap-3">{original&&<details><summary>Deine ersten Lieferscheine</summary><Slips plan={original} task={task}/></details>}
      <strong>{own?"Deine Lieferscheine":"So können die Lieferscheine aussehen"}</strong><Slips plan={own?plan:best} task={task}/>
      {task.optimize&&<p>Die beiden Bestellungen brauchen mindestens {task.orders[0]%10} + {task.orders[1]%10} lose Stifte.
        Im Lager liegen am Anfang {task.singles} lose Stifte. Darum reicht es, {best.opened} Päckchen zu öffnen.</p>}</section>;
  }
  function submit(){
    if(!shipped(task,plan)){
      const i=plan.boxes.findIndex((box,index)=>pencilCount(box)!==task.orders[index]);
      const delta=task.orders[i]-pencilCount(plan.boxes[i]);
      onAnswer(false,"Klasse 2"+(i===0?"a":"b")+(delta>0?" braucht noch ":" hat zu viel: ")+Math.abs(delta)+(Math.abs(delta)===1?" Stift.":" Stifte."));return;
    }
    if(!task.optimize){onAnswer(true);return;}
    if(!original){setOriginal(plan);return;}
    const canImprove=original.opened>best.opened;
    if(better!==canImprove){onAnswer(false,"Vergleiche die ersten Lieferscheine mit dem Lagerbestand. Wie viele lose Stifte brauchst du mindestens?");return;}
    if(plan.opened!==best.opened){onAnswer(false,"Deine Lieferungen stimmen. Probiere dieselben Mengen mit mehr verschlossenen Päckchen.");return;}
    onAnswer(true);
  }
  return <section className="grid gap-3"><p>Klasse <b>2a bestellt {task.orders[0]}</b> Stifte, Klasse <b>2b bestellt {task.orders[1]}</b>.
    Jedes verschlossene Päckchen enthält zehn Stifte.</p>
    {original&&<div className="rounded-xl bg-sun-light p-3"><strong>Deine ersten Lieferscheine</strong><Slips plan={original} task={task}/>
      <p>Geht es mit weniger geöffneten Päckchen? Finde eine Lieferung mit möglichst wenigen geöffneten Päckchen.</p>
      <div className="flex gap-2">{[true,false].map(answer=><button key={String(answer)} type="button" aria-pressed={better===answer} disabled={locked}
        className={"min-h-10 rounded border px-3 "+(better===answer?"bg-sky-light":"bg-white")} onClick={()=>setBetter(answer)}>{answer?"Ja":"Nein"}</button>)}</div>
      <button className="min-h-10 underline" type="button" disabled={locked} onClick={()=>{setHistory([emptyShipment()]);setAmount("1");}}>
        Noch einmal mit dem Anfangsvorrat packen</button></div>}
    <div className="rounded-xl bg-grape-light p-3"><b>Im Lager</b><p><StockText stock={rest}/>.</p><StockPicture stock={rest}/><p>Bisher geöffnet: {plan.opened} Päckchen.</p>
      <button type="button" disabled={locked||rest.packs===0} className="min-h-11 rounded-lg border bg-white px-2"
        onClick={()=>change(openPack(task,plan))}>1 Päckchen öffnen → 10 lose Stifte</button></div>
    <div className="grid gap-1"><label>Lose Stifte je Schritt <input type="number" min="1" max={pencilCount(task)} inputMode="numeric"
      className="w-16 rounded border p-2" disabled={locked} value={amount} onChange={event=>setAmount(event.target.value)}/></label>
      <div className="flex gap-2">{[1,5,10].map(n=><button type="button" key={n} aria-pressed={amount===String(n)} disabled={locked}
        className="min-h-10 rounded border px-3" onClick={()=>setAmount(String(n))}>{n}</button>)}</div></div>
    {([0,1] as const).map(i=><section key={i} className="grid gap-2 rounded-xl bg-white p-3"><strong>Klasse 2{i===0?"a":"b"} · bestellt: {task.orders[i]} Stifte</strong>
      <p><StockText stock={plan.boxes[i]}/></p><StockPicture stock={plan.boxes[i]}/><div className="flex flex-wrap gap-2">{(["packs","singles"] as const).flatMap(kind=>[1,-1].map(direction=>{
        const units=kind==="packs"?1:Number(amount),delta=direction*units;
        const next=Number.isInteger(units)&&units>0?movePencils(task,plan,i,kind,delta):plan;
        return <button type="button" key={kind+direction} disabled={locked||next===plan} className="min-h-10 rounded-lg border px-2"
          onClick={()=>change(next)}>{kind==="packs"?"1 Päckchen":(amount||"…")+(units===1?" Stift":" Stifte")} {direction===1?"einpacken":"zurücklegen"}</button>;
      }))}</div></section>)}
    <button type="button" disabled={locked||history.length===1} className="min-h-10 underline" onClick={()=>setHistory(history.slice(0,-1))}>Letzten Schritt zurücknehmen</button>
    <Button disabled={locked||(original!==null&&better===null)} onClick={submit}>{original?"Sparsame Lieferung prüfen":"Beide Lieferscheine bestätigen"}</Button>
  </section>;
}
