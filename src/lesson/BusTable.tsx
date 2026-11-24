import { useState } from "react";
import { busJourney, busTime, checkBus } from "@/game/busTable";
import type { BusTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function BusTable({ task, status, onAnswer }: FormatProps<BusTask>) {
  const [departure, setDeparture] = useState(-1);
  const [arrival, setArrival] = useState(-1);
  const [minutes, setMinutes] = useState("");
  const locked = status !== "ask";
  const journey = busJourney(task);
  const ready = departure >= 0 && arrival >= 0 && minutes !== "";
  return <form className="grid gap-3" onSubmit={event => {
    event.preventDefault();
    if (!ready || locked) return;
    const result = checkBus(task, departure, arrival, minutes);
    onAnswer(result.correct, result.hint);
  }}>
    <div className="overflow-x-auto rounded-2xl bg-white p-2">
      <table className="w-full border-separate border-spacing-1 text-center">
        <caption className="pb-2 text-left">Wähle deine Abfahrt bei {task.stops[task.from]} und deine Ankunft bei {task.stops[task.to]}.</caption>
        <thead><tr><th scope="col" className="text-left">Halt</th>{task.trips.map((_, i) => <th key={i} scope="col">Fahrt {i + 1}</th>)}</tr></thead>
        <tbody>{task.stops.map((stop, row) => <tr key={stop}>
          <th scope="row" className="text-left text-sm">{stop}</th>
          {task.trips.map((trip, col) => {
            const time = busTime(trip[row]);
            if (row !== task.from && row !== task.to) return <td key={col} className="text-ink-soft">{time}</td>;
            const start = row === task.from;
            const selected = col === (status === "reveal" ? journey.column : start ? departure : arrival);
            return <td key={col}><button type="button" aria-pressed={selected} disabled={locked}
              aria-label={`${start ? "Abfahrt" : "Ankunft"} ${stop}, Fahrt ${col + 1}, ${time} Uhr`}
              onClick={() => start ? setDeparture(col) : setArrival(col)}
              className={`min-h-11 w-full rounded-xl border-2 px-1 font-display text-lg ${selected ? "border-ink bg-grape text-white" : "border-grape-light bg-grape-light"}`}>
              {time}</button></td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
    <label className="grid justify-items-center gap-2 rounded-2xl bg-white p-3">
      Wie viele Minuten fährst du?
      <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} disabled={locked}
        className="w-24 rounded-xl border-2 border-grape p-2 text-center font-display text-2xl"
        value={status === "reveal" ? String(journey.duration) : minutes}
        onChange={event => { if (/^\d{0,3}$/.test(event.target.value)) setMinutes(event.target.value); }} />
    </label>
    <Button type="submit" disabled={!ready || locked}>Fahrt prüfen</Button>
  </form>;
}
