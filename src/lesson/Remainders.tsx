import { useState } from "react";
import { groupHint, restAnswer, restReasons, restStories, restValues, singleTrip } from "@/game/remainders";
import type { RemainderTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function Remainders({task,status,onAnswer}: FormatProps<RemainderTask>) {
  const [groups,setGroups] = useState<number[][]>([]), [selected,setSelected] = useState<number[]>([]);
  const [pastGrouping,setPastGrouping] = useState(false), [rest,setRest] = useState("");
  const [rides,setRides] = useState(""), [bundles,setBundles] = useState("");
  const [whyRide,setWhyRide] = useState(""), [whyBundle,setWhyBundle] = useState("");
  const solved = status==="right" || status==="reveal", locked = status!=="ask";
  const story = restStories[task.scene], {full,rest: left} = restValues(task);
  const all = Array.from({length:task.total},(_,i)=>i);
  const shown = solved ? Array.from({length:full},(_,i)=>all.slice(i*task.size,(i+1)*task.size)) : groups;
  const free = all.filter(i => !shown.some(g => g.includes(i)));
  const chip = "min-h-11 rounded-lg border-2 px-2 ";
  const input = (label: string,value: string,set: (v:string)=>void) => <label>{label} <input disabled={locked} inputMode="numeric" className={chip+"w-16 bg-white"} value={value}
    onChange={e => { if (/^\d{0,2}$/.test(e.target.value)) set(e.target.value); }} /></label>;
  const reasons = (legend: string, active: string, set: (v:string)=>void) => <fieldset className="grid gap-1" disabled={locked}><legend>{legend}</legend>
    {task.reasons.map(key => <button type="button" key={key} aria-pressed={active===key} className={chip+"text-left "+(active===key?"border-grape bg-grape-light":"border-grape-light bg-white")}
      onClick={() => set(key)}>{restReasons[key]}</button>)}</fieldset>;
  function check() {
    if (locked) return;
    if (!pastGrouping) {
      const hint = groupHint(task,groups,rest);
      if (hint) onAnswer(false,hint);
      else { setSelected([]); setPastGrouping(true); }
    } else {
      const hint = restAnswer(task,rides,bundles,whyRide,whyBundle);
      onAnswer(hint === null, hint ?? undefined);
    }
  }
  return <section className="grid gap-3">
    <div className="rounded-xl bg-white p-3"><h2 className="font-display text-lg">Volle Gruppen</h2>
      <div className="flex flex-wrap gap-1">{shown.map((g,i) => <span key={i} className="rounded-lg border-2 border-sky-light px-1" aria-label={`Gruppe ${i+1} mit ${g.length} Punkten`}>
        <span aria-hidden="true">{"●".repeat(g.length)}</span></span>)}</div>
      {!solved && !pastGrouping && groups.length>0 && <button type="button" disabled={locked} className="min-h-11 underline" onClick={() => {
        setGroups(groups.slice(0,-1)); setSelected([]); setRest("");
      }}>Letzte Gruppe auflösen</button>}
    </div>
    <div className="rounded-xl bg-sun-light p-3"><h2 className="font-display text-lg">Einzelne Punkte</h2>
      {solved || pastGrouping ? <p>{left ? "● ".repeat(left) : "Kein Punkt übrig"}</p> : <>
        <p>Lege immer {task.size} Punkte als Gruppe ab. Sind weniger übrig, ist das dein Rest.</p>
        <div className="flex flex-wrap gap-1">{free.map(i => <button key={i} type="button" aria-label={`Punkt ${i+1}`} aria-pressed={selected.includes(i)}
          disabled={locked || selected.length===task.size && !selected.includes(i)} className={chip+"w-11 "+(selected.includes(i)?"border-grape bg-grape-light":"border-transparent bg-white")}
          onClick={() => setSelected(selected.includes(i)?selected.filter(v=>v!==i):[...selected,i])}>●</button>)}</div>
        <button type="button" className={chip+"mt-2 bg-white"} disabled={locked || selected.length!==task.size}
          onClick={() => { setGroups([...groups,selected]); setSelected([]); setRest(""); }}>Gruppe ablegen</button>
      </>}
    </div>
    {solved ? <p className="rounded-xl bg-leaf-light p-3">{task.solution}</p> : !pastGrouping ?
      input("Wie viele einzelne Punkte bleiben übrig?",rest,setRest) : <>
        <section className="grid gap-2 rounded-xl bg-white p-3"><p>{task.total} {story.people} In jedes Fahrzeug passen {task.size} Kinder. {singleTrip}</p>
          {input(`Wie viele ${story.carriers} braucht ihr mindestens?`,rides,setRides)}
          {reasons("Warum reicht diese Zahl?",whyRide,setWhyRide)}</section>
        <section className="grid gap-2 rounded-xl bg-white p-3"><p>Es gibt {task.total} {story.objects}. In jede Packung kommen genau {task.size} Stück.</p>
          {input(`Wie viele volle ${story.bundles} entstehen?`,bundles,setBundles)}
          {reasons("Warum zählt diese Zahl?",whyBundle,setWhyBundle)}</section>
      </>}
    {!solved && <Button disabled={locked || (pastGrouping ? !rides || !bundles || !whyRide || !whyBundle : !rest)} onClick={check}>
      {pastGrouping ? "Beide Antworten prüfen" : "Gruppen und Rest prüfen"}</Button>}
  </section>;
}
