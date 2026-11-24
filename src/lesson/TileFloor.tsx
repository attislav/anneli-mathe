import { useState } from "react";
import { floorComplete, tileFootprint, tileIssue, tileOffsets } from "@/game/tileFloor";
import type { TilePlacement, TileTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const colors = ["bg-sun-light", "bg-grape-light", "bg-leaf-light", "bg-rose-light"];

export function TileFloor({ task, status, onAnswer }: FormatProps<TileTask>) {
  const [placed, setPlaced] = useState<TilePlacement[]>([]);
  const [piece, setPiece] = useState(0);
  const [turns, setTurns] = useState(0);
  const [anchor, setAnchor] = useState<number | null>(null);
  const locked = status !== "ask";
  const reveal = status === "reveal";
  const target = task.example.flat();
  const current = piece >= 0 && anchor !== null ? { piece, anchor, turns } : null;
  const preview = current ? tileFootprint(task, current) : [];
  const issue = current ? tileIssue(task, placed, current) : undefined;
  const groups = reveal ? task.example : task.example.map((_, i) => {
    const match = placed.find(p => p.piece === i);
    return match ? tileFootprint(task, match) : [];
  });
  const shape = piece < 0 ? [] : tileOffsets(task.example[piece].length, turns);
  function place() {
    if (!current || issue || locked) return;
    const next = [...placed, current];
    setPlaced(next);
    setPiece(task.example.findIndex((_, i) => !next.some(p => p.piece === i)));
    setTurns(0);
    setAnchor(null);
  }
  function undo() {
    const last = placed.at(-1);
    if (!last || locked) return;
    setPlaced(placed.slice(0, -1));
    setPiece(last.piece);
    setTurns(last.turns);
    setAnchor(last.anchor);
  }
  return <div className="grid gap-3">
    {!reveal && <>
      <div role="group" aria-label="Steine auswählen" className="flex flex-wrap gap-2">{task.example.map((cells, i) =>
        <button key={i} type="button" disabled={locked || placed.some(p => p.piece === i)} aria-pressed={piece === i}
          onClick={() => { setPiece(i); setTurns(0); }}
          className={`min-h-11 rounded-xl border-2 border-transparent px-3 aria-pressed:border-grape disabled:opacity-60 ${colors[i]}`}>
          {i + 1} · {cells.length === 2 ? "Domino" : "L-Stein"}</button>)}</div>
      {piece >= 0 && <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white p-2">
        <div role="img" aria-label={`Stein ${piece + 1} vom Stern aus: ${shape.slice(1).map(([x, y]) => x > 0 ? "rechts" : x < 0 ? "links" : y > 0 ? "unten" : "oben").join(" und ")}`}
          className="grid grid-cols-3 gap-px">
          {Array.from({ length: 9 }, (_, i) => {
            const active = shape.some(([x, y]) => x === i % 3 - 1 && y === Math.floor(i / 3) - 1);
            return <span key={i} className={`grid size-5 place-items-center rounded ${active ? "bg-grape text-white" : "bg-cloud"}`}>{i === 4 ? "★" : ""}</span>;
          })}
        </div>
        <button type="button" disabled={locked} className="min-h-11 rounded-xl bg-grape-light px-4" onClick={() => setTurns((turns + 1) % 4)}>↻ Drehen</button>
      </div>}
    </>}
    <p className="text-center">{reveal ? "So kannst du die Steine legen:" : piece >= 0 ? "Tippe auf das Startfeld für den Stern." : "Alle Steine liegen. Prüfe deine Fläche."}</p>
    <div role="group" aria-label="Zielfläche" className="mx-auto grid gap-1" style={{ gridTemplateColumns: `repeat(${task.width}, minmax(44px, 1fr))` }}>
      {Array.from({ length: task.width * task.height }, (_, cell) => {
        const owner = groups.findIndex(group => group.includes(cell));
        const marked = !reveal && preview.includes(cell);
        const text = owner >= 0 ? String(owner + 1) : marked ? (cell === anchor ? "★" : "•") : "";
        const pos = `Zeile ${Math.floor(cell / task.width) + 1}, Spalte ${cell % task.width + 1}`;
        return <button type="button" key={cell} disabled={locked || piece < 0 || !target.includes(cell)}
          aria-label={`${pos}, ${owner >= 0 ? "Stein " + (owner + 1) : target.includes(cell) ? "frei" : "außerhalb"}${marked ? ", Vorschau" : ""}`}
          onClick={() => setAnchor(cell)} className={`size-12 rounded-lg border-2 font-display text-xl ${owner >= 0 ? colors[owner] : target.includes(cell) ? "bg-white" : "bg-cloud opacity-45"} ${marked ? (issue ? "border-rose-dark" : "border-grape") : "border-ink/20"}`}>
          {text}</button>;
      })}
    </div>
    {!reveal && <>
      <p role="status" className="text-center">{issue || (current ? `Vorschau für Stein ${piece + 1}. Passt er hier?` : "")}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="md" tone="white" disabled={locked || !placed.length} onClick={undo}>Zurücknehmen</Button>
        {piece >= 0 && <Button size="md" disabled={locked || !current || Boolean(issue)} onClick={place}>Stein legen</Button>}
      </div>
      <Button disabled={locked || !placed.length} onClick={() => onAnswer(floorComplete(task, placed),
        "Es sind noch Kästchen frei. Passt keiner der übrigen Steine hinein? Nimm den letzten zurück und drehe ihn.")}>Fläche prüfen</Button>
    </>}
  </div>;
}
