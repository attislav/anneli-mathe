import {useState} from "react";
import {seatLabel,TheaterRound} from "@/game/classTheater";
import {Button} from "@/ui/Button";

function Seats({round,plan,closed=-1,choose}:{round:TheaterRound;plan:number[];closed?:number;choose?:(seat:number)=>void}){
  return <section className="rounded-xl bg-sky-light p-2" aria-label="Sitzplan"><p className="mb-2 rounded-lg bg-white p-1 text-center font-bold">Bühne</p>
    <p className="mb-2 text-center text-sm">Der Mittelgang liegt zwischen Platz 2 und 3.</p>
    {[0,1,2].map(row=><div key={row} className="mb-1"><strong>Reihe {row+1}</strong><div className="grid grid-cols-[1fr_1fr_.5rem_1fr_1fr] gap-1">
      {[0,1,2,3].map(col=>{
        const seat=row*4+col,person=plan.indexOf(seat),blocked=round.room.occupied.includes(seat)||closed===seat;
        const label=closed===seat?"gesperrt":blocked?"belegt":person===-1?"frei":round.room.names[person];
        const style="min-h-11 rounded border px-1 text-center text-sm "+(col===2?"col-start-4 ":"")+(blocked?"bg-mist":person===-1?"bg-white":"bg-sun-light");
        return choose?<button type="button" key={seat} disabled={blocked} aria-label={seatLabel(seat)+", "+label} onClick={()=>choose(seat)} className={style}>
          {col+1}<br/>{label}</button>:<div key={seat} className={style} aria-label={seatLabel(seat)+", "+label}>{col+1}<br/>{label}</div>;
      })}</div></div>)}</section>;
}
export function TheaterNote({round}:{round:TheaterRound}){
  return <div className="grid gap-2 rounded-xl bg-white p-3"><strong>Eintrittskarten fürs Klassentheater</strong>
    <p>{round.revealed.has(1)?"Erster Sitzplan als Beispiel.":"Dein erster Sitzplan."} {round.revealed.has(2)?"Die ersten Karten wurden aufgelöst.":""}
      {round.revealed.has(3)?" Die Umbuchung zeigt eine mögliche Lösung.":""}</p>
    {round.final.length>0&&<p>Gesperrt wurde {seatLabel(round.closedSeat)}.</p>}
    <ul>{round.room.names.map((name,i)=><li key={name}><b>{name}</b> · {seatLabel(round.original[i])}
      {round.final.length>0&&(round.final[i]===round.original[i]?" · bleibt gültig":" → "+seatLabel(round.final[i]))}</li>)}</ul></div>;
}
export function TheaterWork({round,refresh}:{round:TheaterRound;refresh:()=>void}){
  const {number,status,task}=round.state;
  const [plan,setPlan]=useState<number[]>(()=>number===3?[...round.original]:[-1,-1,-1]);
  const [person,setPerson]=useState(0),[keep,setKeep]=useState<boolean|null>(null);
  const [tickets,setTickets]=useState(()=>round.room.names.map(()=>({row:0,seat:0})));
  const locked=status!=="ask",finished=status==="right"||status==="reveal";
  const names=round.room.names;
  function choose(seat:number){
    const next=[...plan],other=next.indexOf(seat);
    if(other>=0&&other!==person)next[other]=next[person];
    next[person]=seat;setPlan(next);
    const unplaced=next.indexOf(-1);
    if(unplaced>=0)setPerson(unplaced);
  }
  const arrangement=number===1||(number===3&&keep===false);
  return <section className="grid gap-3">
    {number!==2&&<p>{names[0]} und {names[1]} möchten nebeneinander sitzen. Zwischen ihnen darf kein Gang sein. {names[2]} möchte direkt am Gang sitzen.</p>}
    {number===3&&<>{!finished&&<TheaterNote round={round}/>}<p className="rounded-xl bg-sun-light p-2">Dieser Sitz fällt aus: <b>{seatLabel(round.closedSeat)}</b>.</p>
      {!finished&&<fieldset><legend>Bleiben alle drei Karten gültig?</legend>{[true,false].map(yes=><button type="button" key={String(yes)}
        disabled={locked} aria-pressed={keep===yes} onClick={()=>setKeep(yes)} className={"mr-2 rounded-lg border p-2 "+(keep===yes?"bg-grape-light":"bg-white")}>
        {yes?"Ja, alle bleiben":"Nein, umbuchen"}</button>)}</fieldset>}</>}
    {arrangement&&!finished&&<fieldset><legend>Für wen wählst du einen Sitz?</legend>{names.map((name,i)=><button type="button" key={name}
      disabled={locked} aria-pressed={person===i} onClick={()=>setPerson(i)} className={"mr-1 min-h-11 rounded-lg border px-2 "+(person===i?"bg-grape-light":"bg-white")}>{name}</button>)}</fieldset>}
    <Seats round={round} plan={finished?(number===3?round.final:round.original):number===2||number===3&&keep!==false?round.original:plan}
      closed={number===3?round.closedSeat:-1} choose={arrangement&&!locked?choose:undefined}/>
    {number===2&&!finished&&tickets.map((ticket,i)=><fieldset key={names[i]} className="flex flex-wrap gap-2 rounded-lg bg-white p-2">
      <legend>Eintrittskarte für {names[i]}</legend>{(["row","seat"] as const).map(key=><label key={key}>{key==="row"?"Reihe":"Platz"} <select disabled={locked}
        value={ticket[key]} onChange={event=>setTickets(tickets.map((t,j)=>i===j?{...t,[key]:Number(event.target.value)}:t))}>
        <option value={0}>–</option>{(key==="row"?[1,2,3]:[1,2,3,4]).map(n=><option key={n}>{n}</option>)}</select></label>)}</fieldset>)}
    {!finished&&<Button disabled={locked||(number===1&&plan.includes(-1))||(number===2&&tickets.some(t=>!t.row||!t.seat))||(number===3&&keep===null)} onClick={()=>{
      if(number===1)round.submit(task.id,{step:1,plan});
      else if(number===2)round.submit(task.id,{step:2,tickets});
      else if(keep!==null)round.submit(task.id,{step:3,keep,plan});
      refresh();
    }}>{number===1?"Sitze buchen":number===2?"Karten prüfen":"Buchung prüfen"}</Button>}
    {finished&&<TheaterNote round={round}/>}
  </section>;
}
