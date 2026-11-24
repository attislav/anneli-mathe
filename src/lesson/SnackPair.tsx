import { useState } from "react";
import { snackPairFits } from "@/game/classTrip";
import { fmtMoney } from "@/game/money";
import type { SnackTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function SnackPair({ task, status, onAnswer }: FormatProps<SnackTask>) {
  const [selected, setSelected] = useState<number[]>([]);
  const locked = status !== "ask";
  const shown = status === "reveal"
    ? [[0, 1], [0, 2], [1, 2]].find(pair => snackPairFits(task, pair)) ?? []
    : selected;
  function toggle(i: number) {
    setSelected(previous => previous.includes(i) ? previous.filter(n => n !== i) : [...previous, i]);
  }
  const total = selected.reduce((sum, i) => sum + task.snacks[i].price, 0);
  return <div className="grid gap-3">
    <div className="grid grid-cols-3 gap-2">{task.snacks.map(({ name, price }, i) =>
      <button key={name} type="button" aria-pressed={shown.includes(i)} disabled={locked || selected.length === 2 && !selected.includes(i)}
        onClick={() => toggle(i)} className="min-h-16 rounded-xl border-2 border-grape-light bg-white px-1 aria-pressed:border-grape aria-pressed:bg-grape-light">
        {name}<span className="block">{fmtMoney(price)}</span>
      </button>)}</div>
    <Button disabled={locked || selected.length !== 2} onClick={() => onAnswer(snackPairFits(task, selected),
      `Diese beiden kosten ${fmtMoney(total)}. Gesucht sind ${fmtMoney(task.budget)}. Tippe auf einen gewählten Snack, um ihn zu tauschen.`)}>Snacks prüfen</Button>
  </div>;
}
