import { useState } from "react";
import { checkMarking, clueText, fitsClue } from "@/game/numberDetective";
import type { DetectiveTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function NumberDetective({ task, status, onAnswer }: FormatProps<DetectiveTask>) {
  const [used, setUsed] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [marked, setMarked] = useState<number[]>([]);
  const [reason, setReason] = useState<number | null>(null);
  const locked = status !== "ask";
  const solved = status === "right" || status === "reveal";
  const remaining = task.numbers.filter(n => (solved ? task.clues : used.map(i => task.clues[i])).every(c => fitsClue(n, c)));
  const final = solved || used.length === task.clues.length;
  const tile = "min-h-11 rounded-xl border-2 px-2 py-1 ";
  function check() {
    if (locked) return;
    if (final && reason !== null) {
      onAnswer(!fitsClue(task.excluded, task.clues[reason]), `Teste die ${task.excluded} mit deinem Hinweis. Gesucht ist einer, zu dem sie nicht passt.`);
    } else if (active !== null) {
      if (!checkMarking(remaining, task.clues[active], marked)) {
        onAnswer(false, `Prüfe jede übrige Zahl mit diesem Hinweis: „${clueText(task.clues[active])}“ Markiere alle, die passen.`);
        return;
      }
      setUsed([...used, active]); setActive(null); setMarked([]);
    }
  }
  return <section className="grid gap-3">
    <fieldset disabled={locked || final} className="grid gap-1">
      <legend className="font-display text-lg">Deine Hinweise</legend>
      {task.clues.map((c, i) => <button type="button" key={i} disabled={used.includes(i)} aria-pressed={active === i}
        className={tile + (active === i ? "border-grape bg-grape-light" : "border-transparent bg-white")}
        onClick={() => { if (i !== active) { setActive(i); setMarked([]); } }}>
        {used.includes(i) || solved ? "✓ " : ""}{clueText(c)}</button>)}
    </fieldset>
    <p aria-live="polite">{final ? `Die Geheimzahl ist ${remaining[0]}.` : active === null ?
      "Wähle einen Hinweis." : "Tippe alle übrigen Zahlen an, die zu deinem Hinweis passen."}</p>
    <div className="grid grid-cols-4 gap-1" role="group" aria-label="Ausschnitt der Hundertertafel">
      {task.numbers.map(n => {
        const out = !remaining.includes(n);
        return <button key={n} type="button" disabled={locked || active === null || final || out}
          aria-pressed={marked.includes(n) && !out || final && !out} aria-label={out ? `${n}, ausgeschieden` : String(n)}
          className={tile + (out ? "border-transparent bg-white/50 text-slate-500 line-through" : marked.includes(n) || final ? "border-grape bg-grape-light" : "border-transparent bg-white")}
          onClick={() => setMarked(marked.includes(n) ? marked.filter(v => v !== n) : [...marked, n])}>{n}</button>;
      })}
    </div>
    {final && <fieldset disabled={locked} className="grid gap-1">
      <legend>Welcher Hinweis passt nicht zur {task.excluded}?</legend>
      {task.clues.map((c, i) => {
        const selected = solved ? !fitsClue(task.excluded, c) : reason === i;
        return <button type="button" key={i} aria-pressed={selected} className={tile + (selected ? "border-grape bg-grape-light" : "border-transparent bg-white")}
          onClick={() => setReason(i)}>{selected && solved ? "✓ " : ""}{clueText(c)}</button>;
      })}
    </fieldset>}
    {!solved && <Button disabled={locked || (final ? reason === null : active === null || !marked.length)} onClick={check}>
      {final ? "Begründung prüfen" : "Markierte Zahlen prüfen"}</Button>}
  </section>;
}
