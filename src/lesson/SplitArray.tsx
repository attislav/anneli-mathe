import { useState } from "react";
import { activeProfileId } from "@/game/state";
import { splitCard } from "@/game/strategyCards";
import { RememberStrategy } from "./RememberStrategy";
import { checkSplit, newSplit, parts, type SplitEntry } from "@/game/splitArray";
import type { SplitAxis, SplitTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function SplitArray({ task, status, onAnswer }: FormatProps<SplitTask>) {
  const [owner] = useState(activeProfileId);
  const [entry, setEntry] = useState(() => newSplit(task.axis === "either" ? "rows" : task.axis, task.presetLine));
  const solved = status === "right" || status === "reveal";
  const locked = status !== "ask";
  const { axis } = entry;
  const line = entry.line ?? (solved ? Math.floor(task[axis] / 2) : null);
  const fields = parts(task, axis, line);
  const labels = axis === "rows" ? ["Oben", "Unten"] : ["Links", "Rechts"];
  const dimension = axis === "rows" ? "Reihe" : "Spalte";
  const ready = fields && entry.first !== "" && entry.second !== "" && entry.total !== "";
  function cut(newAxis: SplitAxis, newLine: number | null) {
    if (axis !== newAxis || line !== newLine) setEntry(newSplit(newAxis, newLine));
  }
  function input(key: "first" | "second" | "total", value: string) {
    if (/^\d{0,3}$/.test(value)) setEntry((old: SplitEntry) => ({ ...old, [key]: value }));
  }
  const option = "min-h-11 min-w-11 rounded-xl border-2 border-grape-light bg-white px-2 aria-pressed:border-grape aria-pressed:bg-grape-light";
  const box = "w-20 rounded-xl border-2 border-grape p-1 text-center text-xl";
  return <form className="grid gap-3" onSubmit={e => {
    e.preventDefault();
    if (locked || !ready) return;
    const result = checkSplit(task, entry);
    onAnswer(result.correct, result.hint);
  }}>
    <div className="grid justify-items-center gap-2 rounded-2xl bg-white p-3">
      <p>{task.rows} Reihen mit je {task.cols} Punkten</p>
      <div role="img" aria-label={`Punktefeld mit ${task.rows} Reihen und ${task.cols} Spalten${line === null ? "" : ", geteilt nach " + dimension + " " + line}`}
        className="grid max-w-full" style={{ width: `${task.cols * 1.65}rem`, gridTemplateColumns: `repeat(${task.cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: task.rows * task.cols }, (_, i) => {
          const n = axis === "rows" ? Math.floor(i / task.cols) : i % task.cols;
          const second = line !== null && n >= line;
          const boundary = line !== null && n === line - 1;
          return <span key={i} className={`grid aspect-square place-items-center ${second ? "bg-sun-light" : "bg-grape-light"} ${boundary ? (axis === "rows" ? "border-b-4 border-ink" : "border-r-4 border-ink") : ""}`}>
            <i className={`size-2/5 rounded-full ${second ? "bg-amber-800" : "bg-grape-dark"}`} /></span>;
        })}
      </div>
    </div>
    {!solved && !task.presetLine && <>
      {task.axis === "either" && <fieldset disabled={locked} className="flex flex-wrap gap-2">
        <legend>Wie möchtest du teilen?</legend>
        {(["rows", "cols"] as const).map(a => <button key={a} type="button" className={option} aria-pressed={axis === a}
          onClick={() => cut(a, null)}>{a === "rows" ? "Zwischen Reihen" : "Zwischen Spalten"}</button>)}
      </fieldset>}
      <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Trenne nach welcher {dimension}?</legend>
        {Array.from({ length: task[axis] - 1 }, (_, i) => <button type="button" key={i} className={option}
          aria-label={`Nach ${dimension} ${i + 1} trennen`} aria-pressed={line === i + 1} onClick={() => cut(axis, i + 1)}>{i + 1}</button>)}
      </fieldset>
    </>}
    {fields && <>
      {fields.map((f, i) => {
        const key = i === 0 ? "first" : "second";
        return <label key={key} className={`flex items-center justify-between gap-2 rounded-xl p-3 ${i === 0 ? "bg-grape-light" : "bg-sun-light"}`}>
          <span>{labels[i]}: {f.rows} · {f.cols} = </span>
          {solved ? <strong>{f.value}</strong> : <input type="text" inputMode="numeric" disabled={locked} value={entry[key]}
            className={box} onChange={e => input(key, e.target.value)} />}
        </label>;
      })}
      {solved ? <p className="rounded-xl bg-white p-3 font-display text-xl">Zusammen: {fields[0].value} + {fields[1].value} = {task.rows * task.cols}</p> :
        <><label className="flex items-center justify-between gap-2 rounded-xl bg-white p-3">Punkte zusammen
          <input type="text" inputMode="numeric" disabled={locked} className={box} value={entry.total} onChange={e => input("total", e.target.value)} /></label>
          <Button type="submit" disabled={locked || !ready}>Zerlegung prüfen</Button></>}
    </>}
    {solved && entry.line !== null && !task.presetLine && <RememberStrategy owner={owner} card={splitCard(task, axis, entry.line)} />}
  </form>;
}
