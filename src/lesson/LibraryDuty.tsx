import { useState } from "react";
import { bookCount, bookingBetween, bookTransfer, directionNames, explanations, receiptHint, stockHint, type Booking, type Stock } from "@/game/libraryDuty";
import type { LibraryTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function StockPiles({stock}:{stock:Stock}){
  return <div className="grid grid-cols-2 gap-2" aria-live="polite">{(["shelf","borrowed"] as const).map(place=>
    <section key={place} className={"rounded-xl p-2 "+(place==="shelf"?"bg-sun-light":"bg-sky-light")}>
      <h3 className="font-bold">{place==="shelf"?"Im Regal":"Ausgeliehen"}</h3><p>{bookCount(stock[place])}</p>
      <div aria-hidden="true" className="flex flex-wrap gap-1">{Array.from({length:stock[place]},(_,index)=>
        <span key={index} className="h-4 w-2 rounded-sm border-l-2 border-ink bg-grape"/>)}</div>
    </section>)}</div>;
}
export function LibraryLog({task,confirmed,solved}:{task:LibraryTask;confirmed:Stock[];solved:boolean}){
  const rows=[task.initial,...confirmed];
  if(solved)while(rows.length<=task.bookings.length){
    rows.push(bookTransfer(rows[rows.length-1],task.bookings[rows.length-1])!);
  }
  if(solved)rows.push(task.afterMissing);
  return <table className="w-full rounded-xl bg-white text-left text-sm"><caption className="font-bold">Buchungsprotokoll</caption>
    <thead><tr><th scope="col">Buchung</th><th scope="col">Im Regal</th><th scope="col">Ausgeliehen</th></tr></thead>
    <tbody>{rows.map((stock,index)=>{
      const booking=index===0?null:index<=2?task.bookings[index-1]:bookingBetween(rows[index-1],stock);
      const label=booking?directionNames[booking.direction]+" · "+bookCount(booking.amount):"Am Anfang";
      return <tr key={index} className="border-t"><th scope="row" className="p-1">
        {label}{index>0&&index<=2&&<small className="block">{index<=confirmed.length?"Von dir bestätigt":"Vorgerechnet"}</small>}
        {index===3&&<small className="block">Fehlender Beleg</small>}</th><td>{stock.shelf}</td><td>{stock.borrowed}</td></tr>;
    })}</tbody></table>;
}
export function LibraryDuty({task,status,onAnswer}:FormatProps<LibraryTask>){
  const [confirmed,setConfirmed]=useState<Stock[]>([]),[current,setCurrent]=useState(task.initial);
  const [direction,setDirection]=useState<Booking["direction"]|null>(null),[amount,setAmount]=useState(""),[total,setTotal]=useState("");
  const [reason,setReason]=useState<number|null>(null);
  const locked=status!=="ask",solved=status==="right"||status==="reveal";
  const before=confirmed.at(-1)??task.initial,booking=task.bookings[confirmed.length];
  function move(direction:Booking["direction"]){
    const next=bookTransfer(current,{direction,amount:1});
    if(next)setCurrent(next);
  }
  function confirm(){
    const hint=stockHint(before,booking,current);
    if(hint)onAnswer(false,hint);
    else setConfirmed([...confirmed,{...current}]);
  }
  const input=(label:string,value:string,set:(v:string)=>void)=><label>{label} <input aria-label={label} disabled={locked}
    inputMode="numeric" className="w-16 rounded border p-1" value={value} onChange={event=>set(event.target.value)}/></label>;
  return <section className="grid gap-3"><LibraryLog task={task} confirmed={confirmed} solved={solved}/>
    {solved?<p>{task.solution}</p>:booking?<><p><strong>Beleg {confirmed.length+1}: {directionNames[booking.direction]} · {bookCount(booking.amount)}.</strong></p>
      <StockPiles stock={current}/><p>Bewege die Bücher. Jeder Klick bewegt ein Buch.</p>
      <div className="flex flex-wrap gap-2"><Button tone="sky" disabled={locked||current.shelf===0} onClick={()=>move("loan")}>Ein Buch ausleihen →</Button>
        <Button tone="white" disabled={locked||current.borrowed===0} onClick={()=>move("return")}>← Ein Buch zurückgeben</Button></div>
      <Button disabled={locked} onClick={confirm}>Zwischenstand bestätigen</Button></>:
      <><h3 className="font-bold">Ein weiterer Beleg fehlt</h3><p>Dein letzter Eintrag zeigt {bookCount(before.shelf)} im Regal und {bookCount(before.borrowed)} in der Ausleihe. Danach zählt ihr diese Bücher:</p>
        <StockPiles stock={task.afterMissing}/><p>Was steht auf dem fehlenden Beleg?</p>
        <div className="flex gap-2">{(["loan","return"] as const).map(value=><button key={value} type="button" disabled={locked} aria-pressed={direction===value}
          className={"min-h-11 rounded-xl border-2 px-3 "+(direction===value?"bg-grape-light":"bg-white")} onClick={()=>setDirection(value)}>{directionNames[value]}</button>)}</div>
        {input("Anzahl auf dem Beleg",amount,setAmount)}{input("Wie viele Bücher gehören insgesamt zur Bücherei?",total,setTotal)}
        <fieldset className="grid gap-1"><legend>Warum bleibt die Gesamtzahl gleich?</legend>{task.reasonOrder.map(index=>
          <label key={index} className="flex min-h-11 items-center gap-2"><input type="radio" name="book-reason" disabled={locked} checked={reason===index} onChange={()=>setReason(index)}/>{explanations[index]}</label>)}</fieldset>
        <Button disabled={locked||direction===null||reason===null||![amount,total].every(v=>/^\d+$/.test(v))} onClick={()=>{
          if(direction===null||reason===null)return;
          const hint=receiptHint(before,task.afterMissing,{direction,amount:Number(amount)},Number(total),reason);
          onAnswer(!hint,hint??undefined);
        }}>Beleg und Begründung prüfen</Button></>}
  </section>;
}
