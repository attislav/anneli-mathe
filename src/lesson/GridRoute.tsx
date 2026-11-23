import { useState } from "react";
import type { GridRouteTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function GridRoute({ task, status, onAnswer }: FormatProps<GridRouteTask>) {
  const [marked, setMarked] = useState<number | null>(null);
  const { stops, size, findStart } = task;
  const start = stops[0];
  const end = stops[stops.length - 1];
  const given = findStart ? end : start;
  const target = findStart ? start : end;
  const locked = status !== "ask";
  return <div className="grid justify-items-center gap-4">
    <ol aria-label="Weg vom Start zum Ziel" className="flex flex-wrap justify-center gap-2">
      {stops.slice(1).map((cell, i) => {
        const delta = cell - stops[i];
        const horizontal = Math.floor(cell / size) === Math.floor(stops[i] / size);
        const distance = Math.abs(horizontal ? delta : delta / size);
        const arrow = horizontal ? (delta > 0 ? "→" : "←") : (delta > 0 ? "↓" : "↑");
        const direction = horizontal ? (delta > 0 ? "rechts" : "links") : (delta > 0 ? "unten" : "oben");
        return <li key={i} className="rounded-xl bg-white px-3 py-2 font-display text-2xl">
          <span aria-hidden="true">{distance} {arrow}</span>
          <span className="sr-only">{distance} {distance === 1 ? "Feld" : "Felder"} nach {direction}</span>
        </li>;
      })}
    </ol>
    <div className="grid gap-1 rounded-2xl bg-sky-100 p-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
      {Array.from({ length: size * size }, (_, cell) => {
        const marker = cell === given ? (findStart ? "⚑" : "★") : "";
        const solved = cell === target && (status === "right" || status === "reveal");
        return <button key={cell} disabled={locked || cell === given} aria-pressed={marked === cell}
          aria-label={`Reihe ${Math.floor(cell / size) + 1}, Spalte ${cell % size + 1}${marker ? findStart ? ", Ziel" : ", Start" : ""}`}
          className={`h-11 w-11 rounded-lg border-2 text-xl font-bold sm:h-14 sm:w-14 ${solved ? "border-green-700 bg-green-100" : marked === cell ? "border-grape bg-grape text-white" : "border-sky-200 bg-white"}`}
          onClick={() => setMarked(cell)}>{marker || (solved ? "✓" : marked === cell ? "●" : "")}</button>;
      })}
    </div>
    <Button disabled={locked || marked === null} onClick={() => onAnswer(marked === target)}>Prüfen</Button>
  </div>;
}
