import { useState } from "react";
import { busTime } from "@/game/busTable";
import { checkPlan, examplePlan, followValue, planSlots } from "@/game/morningPlan";
import type { MorningTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function MorningPlan({ task, status, onAnswer }: FormatProps<MorningTask>) {
  const [starts, setStarts] = useState<(number | null)[]>(() => task.activities.map(() => null));
  const [active, setActive] = useState(0);
  const [planned, setPlanned] = useState(false);
  const [answer, setAnswer] = useState("");
  const solved = status === "right" || status === "reveal", locked = status !== "ask";
  const slots = planSlots(task), end = task.start + task.duration;
  const display = solved && checkPlan(task, starts) ? examplePlan(task) : starts;
  const target = task.activities[task.target].name;
  const follow = task.follow === "end" ? `Wann endet „${target}“ in deinem Plan?` : `Wie viele Minuten hast du direkt vor „${target}“ frei?`;
  const tile = "min-h-11 rounded-xl border-2 p-2 ";
  function submit() {
    if (locked) return;
    if (!planned) {
      const conflict = checkPlan(task, starts);
      if (conflict) onAnswer(false, conflict);
      else setPlanned(true);
    } else {
      const correct = answer !== "" && Number(answer) === followValue(task, starts as number[]);
      onAnswer(correct, task.follow === "end" ? "Beginne bei der Startzeit dieser Tätigkeit. Zähle ihre Dauer dazu." :
        "Gehe von ihrem Beginn rückwärts. Zähle nur die freien Abschnitte bis zur letzten Tätigkeit oder zum Anfang deines Plans.");
    }
  }
  return <section className="grid gap-3">
    <div className="rounded-xl bg-sky-light p-3">
      <p>Dein Vormittag geht von {busTime(task.start)} bis {busTime(end)} Uhr.</p>
      <p>Morgenkreis von {busTime(task.fixed)} bis {busTime(task.fixed + task.step)} Uhr.</p>
      <p>„{task.activities[0].name}“ kommt vor „{task.activities[1].name}“.</p>
    </div>
    <fieldset disabled={locked || planned} className="grid gap-1">
      <legend>{planned || solved ? "Tätigkeiten" : "Wähle eine Tätigkeit und dann ihre Startzeit."}</legend>
      {task.activities.map((a, i) => <button type="button" key={a.name} aria-pressed={active === i}
        className={tile + (active === i && !planned && !solved ? "border-grape bg-grape-light" : "border-transparent bg-white")}
        onClick={() => setActive(i)}>{a.name} · {a.duration} Min. {display[i] !== null && `· ab ${busTime(display[i]!)} Uhr`}</button>)}
    </fieldset>
    <ol className="grid grid-cols-2 gap-1 sm:grid-cols-3" aria-label={`Zeitleiste in Schritten von ${task.step} Minuten`}>
      {slots.map(t => {
        const names = task.activities.flatMap((a, i) => display[i] !== null && t >= display[i]! && t < display[i]! + a.duration ? [a.name] : []);
        if (task.fixed === t) names.push("Morgenkreis");
        return <li key={t}><button type="button" disabled={locked || planned || t === task.fixed}
          className={tile + "h-full w-full text-left text-sm " + (names.length ? "border-sky-light bg-sky-light" : "border-grape-light bg-white")}
          aria-label={`${busTime(t)} Uhr: ${names.join(" und ") || "frei"}`}
          onClick={() => setStarts(starts.map((v, i) => i === active ? t : v))}>
          <span className="block font-bold">{busTime(t)}</span>{names.join(" + ") || "frei"}</button></li>;
      })}
    </ol>
    <p>Ende um {busTime(end)} Uhr</p>
    {solved ? <p className="rounded-xl bg-white p-3">{task.follow === "end" ?
      `„${target}“ endet um ${busTime(followValue(task, display as number[]))} Uhr.` :
      `Vor „${target}“ sind ${followValue(task, display as number[])} Minuten frei.`}</p> : planned && <>
      <label className="grid gap-1">{follow}
        {task.follow === "end" ? <select className={tile} disabled={locked} value={answer} onChange={e => setAnswer(e.target.value)}>
          <option value="">Wähle die Uhrzeit</option>{[...slots, end].map(t => <option key={t} value={t}>{busTime(t)} Uhr</option>)}
        </select> : <input className={tile + "w-24"} disabled={locked} inputMode="numeric" value={answer}
          onChange={e => { if (/^\d{0,2}$/.test(e.target.value)) setAnswer(e.target.value); }} />}
      </label>
      <button type="button" disabled={locked} className="justify-self-start underline" onClick={() => { setPlanned(false); setAnswer(""); }}>Plan ändern</button>
    </>}
    {!solved && <Button disabled={locked || (planned ? answer === "" : starts.includes(null))} onClick={submit}>
      {planned ? "Antwort prüfen" : "Plan prüfen"}</Button>}
  </section>;
}
