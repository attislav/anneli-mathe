import { useState } from "react";
import { changeLabel, checkPacket, packetValues, type PacketEntry, type PacketStage } from "@/game/sumPacket";
import type { PacketTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Blocks({ value, tint }: { value: number; tint: string }) {
  return <div role="img" aria-label={`${value}: ${Math.floor(value / 10)} Zehner und ${value % 10} Einer`}
    className="flex flex-wrap items-center gap-1">
    {Array.from({ length: Math.floor(value / 10) }, (_, i) => <span key={i} className="flex gap-px">
      {Array.from({ length: 10 }, (_, j) => <i key={j} className={`size-1.5 ${tint}`} />)}
    </span>)}
    {Array.from({ length: value % 10 }, (_, i) => <i key={`e${i}`} className={`size-1.5 ${tint}`} />)}
    {value === 0 && <span>0</span>}
  </div>;
}

function Equation({ title, a, b }: { title: string; a: number; b: number }) {
  return <div className="grid gap-2 rounded-2xl bg-white p-3">
    <p>{title} · <strong>{a} + {b} = {a + b}</strong></p>
    <Blocks value={a} tint="bg-grape" /><Blocks value={b} tint="bg-leaf-dark" />
  </div>;
}

export function SumPacket({ task, status, onAnswer }: FormatProps<PacketTask>) {
  const [stage, setStage] = useState<PacketStage>("change");
  const [entry, setEntry] = useState<PacketEntry>({ changed: [null, null], direction: null, amount: "", result: "" });
  const locked = status !== "ask";
  const values = packetValues(task);
  if (status === "right" || status === "reveal") return <div className="grid gap-2">
    <Equation title="Vorher" a={task.before[0]} b={task.before[1]} />
    <Equation title="Nachher" a={values.a} b={values.b} />
    <p>{task.changes.map((n, i) => n ? `Zahl ${i + 1}: ${changeLabel(n)}` : `Zahl ${i + 1} bleibt gleich`).join(" · ")}.</p>
    <strong>{values.delta === 0 ? "Die Summe bleibt gleich." : `Die Summe wird um ${Math.abs(values.delta)} ${values.delta > 0 ? "größer" : "kleiner"}.`}</strong>
  </div>;
  const ready = stage === "change" ? task.changes.every((d, i) => d === 0 || entry.changed[i] !== null)
    : stage === "predict" ? entry.direction !== null && (!task.exact || entry.direction === 0 || entry.amount !== "") : entry.result !== "";
  function submit() {
    if (!ready || locked) return;
    const outcome = checkPacket(task, stage, entry);
    if (outcome.next) setStage(outcome.next);
    else onAnswer(outcome.correct === true, outcome.hint);
  }
  const button = "min-h-11 rounded-xl border-2 border-grape-light bg-white px-3 aria-pressed:border-grape aria-pressed:bg-grape-light";
  return <form className="grid gap-3" onSubmit={event => { event.preventDefault(); submit(); }}>
    <p className="rounded-2xl bg-white p-4 text-center font-display text-2xl">{task.before[0]} + {task.before[1]} = {values.oldSum}</p>
    {stage === "change" ? task.changes.map((change, i) => change !== 0 && <fieldset key={i} disabled={locked} className="rounded-2xl bg-white p-3">
      <legend>{i === 0 ? "Erste" : "Zweite"} Zahl: Mach die {task.before[i]} um {Math.abs(change)} {change > 0 ? "größer" : "kleiner"}.</legend>
      <div className="flex flex-wrap gap-2">{[-10, -1, 1, 10].map(d => <button key={d} type="button"
        className={button} aria-pressed={entry.changed[i] === d} disabled={task.before[i] + d < 0 || task.before[i] + d > (task.level === 1 ? 20 : 100)}
        onClick={() => setEntry({ ...entry, changed: entry.changed.map((old, j) => j === i ? d : old) })}>{changeLabel(d)}</button>)}</div>
      {entry.changed[i] !== null && <output>{task.before[i]} → {task.before[i] + (entry.changed[i] ?? 0)}</output>}
    </fieldset>) : <p className="text-center font-display text-2xl">{values.a} + {values.b} = ?</p>}
    {stage === "predict" && <fieldset disabled={locked} className="grid gap-2">
      <legend>Was wird aus der Summe?</legend>
      <div className="flex flex-wrap gap-2">{["Kleiner", "Gleich", "Größer"].map((name, i) =>
        <button key={name} type="button" className={button} aria-pressed={entry.direction === i - 1}
          onClick={() => setEntry({ ...entry, direction: i - 1 })}>{name}</button>)}</div>
    </fieldset>}
    {(stage === "result" || stage === "predict" && task.exact && entry.direction !== null && entry.direction !== 0) &&
      <label className="grid gap-1">{stage === "result" ? "Wie groß ist die neue Summe?" : "Um wie viel?"}
        <input type="text" inputMode="numeric" maxLength={3} disabled={locked} className="w-24 rounded-xl border-2 border-grape p-2 text-center text-2xl"
          value={stage === "result" ? entry.result : entry.amount} onChange={event => {
            if (/^\d{0,3}$/.test(event.target.value)) setEntry({ ...entry, [stage === "result" ? "result" : "amount"]: event.target.value });
          }} /></label>}
    <Button type="submit" disabled={!ready || locked}>{stage === "change" ? "Zahlen übernehmen" : stage === "predict" ? "Vorhersage prüfen" : "Ergebnis prüfen"}</Button>
  </form>;
}
