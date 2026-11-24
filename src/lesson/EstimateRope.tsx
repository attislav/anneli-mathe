import { useState } from "react";
import type { RopeTask } from "@/game/types";
import { checkRope, wholeCm } from "@/game/estimateRope";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function EstimateRope({ task, status, onAnswer }: FormatProps<RopeTask>) {
  const [guess, setGuess] = useState("");
  const [estimate, setEstimate] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const [starts, setStarts] = useState<number[]>([]);
  const [measured, setMeasured] = useState("");
  const [difference, setDifference] = useState("");
  const locked = status !== "ask";
  const solved = status === "right" || status === "reveal";
  const span = (cm: number) => `${100 * cm / task.extent}%`;
  const pieces = solved ? Array.from({ length: task.length / task.unit }, (_, i) => i * task.unit) : starts;
  const maxCursor = task.extent - task.unit;
  const numeric = "w-24 rounded-xl border-2 border-grape px-2 py-1 text-center font-display text-xl";
  function submit() {
    if (locked) return;
    if (estimate === null) {
      const value = wholeCm(guess);
      if (value !== null) setEstimate(value);
    } else if (wholeCm(measured) !== null && wholeCm(difference) !== null) {
      const result = checkRope(task, starts, estimate, measured, difference);
      onAnswer(result.correct, result.hint);
    }
  }
  return <form className="grid gap-3" onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className="grid gap-2 rounded-2xl bg-white p-4">
      <span>Schnur im Modell</span>
      <div className="h-3 rounded-full bg-rose-dark" style={{ width: span(task.length) }} role="img" aria-label="Schnur zum Vergleichen" />
      <span>So lang ist {task.unit === 1 ? "ein Modellzentimeter" : "ein Messstück von 2 Modellzentimetern"}:</span>
      <div className="h-3 bg-grape" style={{ width: span(task.unit) }} />
      {estimate !== null && <>
        <div className="relative mt-2 h-16 border-b-2 border-ink/30" aria-label="Deine Messstrecke">
          <div className="absolute top-0 h-2 rounded-full bg-rose-dark" style={{ left: 0, width: span(task.length) }} />
          {pieces.map((start, i) => <span key={i} aria-hidden className="absolute top-4 h-5 border border-ink bg-grape-light"
            style={{ left: span(start), width: span(task.unit) }} />)}
          {!solved && <span className="absolute top-4 h-5 border-2 border-dashed border-grape" style={{ left: span(cursor), width: span(task.unit) }} />}
          {Array.from({ length: task.extent + 1 }, (_, i) => <i key={i} aria-hidden className="absolute bottom-0 h-2 border-l border-ink/60" style={{ left: span(i) }} />)}
        </div>
        <p className="text-sm">Gelegte Stücke: {pieces.length} · je {task.unit} cm</p>
      </>}
    </div>
    {estimate === null ? <>
      <p>Du darfst frei schätzen. Es zählen deine Messung und der Vergleich mit deinem Tipp.</p>
      <label className="flex items-center gap-2">Mein Tipp <input type="text" inputMode="numeric" value={guess} disabled={locked}
        className={numeric} onChange={e => { if (/^\d*$/.test(e.target.value)) setGuess(e.target.value); }} /> cm</label>
      <Button type="submit" disabled={locked || wholeCm(guess) === null}>Tipp festhalten</Button>
    </> : <>
      <p>Dein Tipp: {estimate} cm</p>
      {solved ? <p>Gemessen: {task.length} cm. {estimate === task.length ? "Dein Tipp passt genau. Abstand: 0 cm." :
        `Dein Tipp liegt ${Math.abs(estimate - task.length)} cm ${estimate > task.length ? "darüber" : "darunter"}.`}</p> : <>
        <p>Schiebe den Umriss an den Anfang des nächsten Messstücks.</p>
        <label>Startposition: {cursor} cm
          <input type="range" min={0} max={maxCursor} step={1} value={cursor} disabled={locked}
            className="block min-h-11 w-full" onChange={e => setCursor(Number(e.target.value))} /></label>
        <div className="flex flex-wrap gap-2">
          <Button size="md" disabled={locked} onClick={() => { setStarts([...starts, cursor]); setCursor(Math.min(maxCursor, cursor + task.unit)); }}>Messstück legen</Button>
          <Button size="md" tone="white" disabled={locked || !starts.length} onClick={() => { setCursor(starts[starts.length - 1]); setStarts(starts.slice(0, -1)); }}>Zurücknehmen</Button>
        </div>
        <label>Gemessene Länge in cm <input type="text" inputMode="numeric" className={numeric} value={measured} disabled={locked}
          onChange={e => { if (/^\d*$/.test(e.target.value)) setMeasured(e.target.value); }} /></label>
        <label>Abstand zu deinem Tipp in cm <input type="text" inputMode="numeric" className={numeric} value={difference} disabled={locked}
          onChange={e => { if (/^\d*$/.test(e.target.value)) setDifference(e.target.value); }} /></label>
        <Button type="submit" disabled={locked || !starts.length || wholeCm(measured) === null || wholeCm(difference) === null}>Messung prüfen</Button>
      </>}
    </>}
  </form>;
}
