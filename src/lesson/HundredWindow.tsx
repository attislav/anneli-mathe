import { useState } from "react";
import { cellPosition, firstIncorrectGap, windowHint, windowValue } from "@/game/hundredWindow";
import type { HundredWindowTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function HundredWindow({ task, status, onAnswer }: FormatProps<HundredWindowTask>) {
  const [entries, setEntries] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState(task.gaps[0]);
  const locked = status !== "ask";
  const rows = Array.from({ length: task.size }, (_, i) => i);
  const complete = task.gaps.every(gap => Boolean(entries[gap]));
  return <form className="grid gap-4" onSubmit={event => {
    event.preventDefault();
    if (locked || !complete) return;
    const missed = firstIncorrectGap(task, entries);
    onAnswer(missed === undefined, missed === undefined ? undefined : windowHint(task, missed));
  }}>
    <table className="mx-auto w-full max-w-xs table-fixed border-separate border-spacing-2 rounded-3xl bg-white p-2 text-center">
      <caption className="pb-2 text-sm text-ink-soft">Tippe in ein leeres Feld und trage die Zahl ein.</caption>
      <tbody>{rows.map(row => <tr key={row}>{rows.map(col => {
        const cell = row * task.size + col;
        const value = windowValue(task, cell);
        if (!task.gaps.includes(cell)) return <td key={cell} className="h-14 rounded-xl bg-cloud font-display text-2xl">{value}</td>;
        return <td key={cell}><input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3}
          aria-label={cellPosition(task.size, cell)} disabled={locked}
          className="h-14 w-full rounded-xl border-2 border-grape bg-grape-light text-center font-display text-2xl text-ink focus-visible:outline-4"
          value={status === "reveal" ? String(value) : entries[cell] ?? ""} placeholder="?"
          onFocus={event => { setSelected(cell); event.currentTarget.select(); }}
          onChange={event => {
            const value = event.target.value;
            if (/^\d{0,3}$/.test(value)) setEntries(previous => ({ ...previous, [cell]: value }));
          }} /></td>;
      })}</tr>)}</tbody>
    </table>
    {status === "ask" && <p className="text-center text-ink-soft">Dein Feld: {cellPosition(task.size, selected)}</p>}
    <Button type="submit" disabled={!complete || locked}>Zahlen prüfen</Button>
  </form>;
}
