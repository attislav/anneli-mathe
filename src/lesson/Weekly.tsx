import {useState} from "react";
import {actualDays,calendarAnswer,calendarDays,checkWeekly,dateLabel,weekNames} from "@/game/weekly";
import type {WeeklyTask} from "@/game/types";
import {Button} from "@/ui/Button";
import type {FormatProps} from "./formats";

export function Weekly({task,status,onAnswer}:FormatProps<WeeklyTask>) {
  const [selected,setSelected]=useState<number[]>([]),[answer,setAnswer]=useState("");
  const solved=status==="right"||status==="reveal", locked=status!=="ask";
  const shown=solved?actualDays(task):selected, response=solved?calendarAnswer(task):answer;
  const days=calendarDays(task), chip="min-h-11 rounded-lg border-2 px-2 ";
  return <section className="grid gap-3">
    <div className="rounded-xl bg-sun-light p-3">
      <p>Regelmäßig: jede Woche am {task.weekdays.map(d=>weekNames[d]).join(" und am ")}.</p>
      {task.cancel!==null && <p>Ausfall am {dateLabel(task.cancel)}.</p>}
      {task.move && <p>Verschoben vom {dateLabel(task.move.from)} auf {dateLabel(task.move.to)}.</p>}
    </div>
    <table className="w-full table-fixed text-center"><caption>Kalender von {dateLabel(days[0])} bis {dateLabel(days.at(-1)!)}</caption>
      <thead><tr>{weekNames.map(name=><th key={name} scope="col" abbr={name}>{name.slice(0,2)}</th>)}</tr></thead>
      <tbody>{Array.from({length:task.weeks},(_,week)=><tr key={week}>
        {days.slice(week*7,week*7+7).map(day=>{
          const date=new Date(day*86400000), marked=shown.includes(day);
          return <td key={day}><button type="button" disabled={locked} aria-label={dateLabel(day)} aria-pressed={marked}
            onClick={()=>setSelected(prev=>prev.includes(day)?prev.filter(d=>d!==day):[...prev,day])}
            className={"min-h-12 w-full rounded-lg border-2 px-0 text-xs "+(marked?"border-grape bg-grape-light font-bold":"border-transparent bg-white")}>
            {date.getUTCDate()}.{date.getUTCMonth()+1}.<span className="block">{marked?"✓":" "}</span></button></td>;
        })}</tr>)}</tbody></table>
    <p>Markiere alle tatsächlichen Termine im Kalender.</p>
    {task.query==="count"?<label>Wie viele Termine finden im gezeigten Zeitraum statt? <input disabled={locked} className={chip+"w-16 bg-white"} inputMode="numeric"
      value={response} onChange={e=>{if(/^\d{0,2}$/.test(e.target.value))setAnswer(e.target.value);}} /></label> :
      <label>Welcher Termin ist im Kalender der erste {task.query==="from"?"ab":"nach"} {dateLabel(task.anchor)}?
        <span className="block text-sm">{task.query==="from"?"Der genannte Tag zählt mit.":"Der genannte Tag zählt nicht mit."}</span>
        <select disabled={locked} className={chip+"w-full bg-white"} value={response} onChange={e=>setAnswer(e.target.value)}>
          <option value="">Termin wählen</option>{days.map(day=><option value={day} key={day}>{dateLabel(day)}</option>)}
          <option value="none">Kein weiterer Termin im gezeigten Zeitraum</option></select></label>}
    {solved?<p className="rounded-xl bg-leaf-light p-3">{task.solution}</p>:<Button disabled={locked||answer===""} onClick={()=>{
      if(locked)return; const hint=checkWeekly(task,selected,answer); onAnswer(hint===null,hint??undefined);
    }}>Kalender prüfen</Button>}
  </section>;
}
