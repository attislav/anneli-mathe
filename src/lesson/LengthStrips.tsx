import { useState } from "react";
import type { StripTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function LengthStrips({ task, status, onAnswer }: FormatProps<StripTask>) {
  const [laid, setLaid] = useState<number[]>([]);
  const total = laid.reduce((sum, index) => sum + task.lengths[index], 0);
  const locked = status !== "ask";
  const scaleLength = task.lengths.reduce((sum, cm) => sum + cm, 0);
  const targetWidth = `${100 * task.target / scaleLength}%`;
  return <div className="grid gap-4">
    <div className="rounded-3xl bg-white p-4">
      <p className="mb-2 font-bold">Zielstrecke · {task.target === 100 ? "1 m" : `${task.target} cm`}</p>
      <div className="h-4 rounded bg-slate-600" style={{width: targetWidth}}/>
      <p className="mb-2 mt-4 font-bold">Deine Strecke</p>
      <div className="relative flex h-5 rounded bg-slate-100" aria-hidden="true">
        {laid.map((index,i) => <span key={index} className={`border-r border-white ${i % 2 ? "bg-sky-500" : "bg-violet-500"}`}
          style={{width: `${100 * task.lengths[index] / scaleLength}%`}}/>)}
        <span className="absolute -inset-y-1 border-l-2 border-dashed border-slate-800" style={{left: targetWidth}}/>
      </div>
      <p aria-live="polite" className="mt-2 text-center">{laid.length ? laid.map(i => task.lengths[i]).join(" + ") + " = " : ""}{total} cm</p>
    </div>
    <p className="text-center">Tippe einen Streifen an, um ihn zu legen oder zurückzunehmen.</p>
    <div className="grid grid-cols-3 gap-3">{task.lengths.map((n,i) =>
      <Button key={i} tone={laid.includes(i) ? "grape" : "white"} disabled={locked} aria-pressed={laid.includes(i)}
        onClick={() => setLaid(laid.includes(i) ? laid.filter(k => k !== i) : [...laid, i])}>{n} cm</Button>)}</div>
    <Button disabled={locked || !laid.length} onClick={() => onAnswer(total === task.target,
      total < task.target ? `Bis zum Ziel fehlen ${task.target-total} cm.` : `Deine Strecke ist ${total-task.target} cm zu lang. Tausche einen Streifen aus.`)}>Strecke prüfen</Button>
  </div>;
}
