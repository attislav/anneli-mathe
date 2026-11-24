import { useState } from "react";
import { BookOpen, Coffee, TrainFront, TreePine, Waves } from "lucide-react";
import { checkSite, landmarks, mapCoordinate, siteMatches } from "@/game/siteMap";
import type { MapPlace, SiteMapTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const signs = { library: BookOpen, cafe: Coffee, station: TrainFront, park: TreePine, pool: Waves };
function Sign({ place }: { place: MapPlace }) {
  const Icon = signs[place];
  return <Icon aria-hidden="true" size={24} className="mx-auto text-grape" />;
}
export function SiteMap({ task, status, onAnswer }: FormatProps<SiteMapTask>) {
  const [col, setCol] = useState(""), [row, setRow] = useState(""), [place, setPlace] = useState("");
  const solved = status === "right" || status === "reveal", locked = status !== "ask";
  const target = siteMatches(task)[0];
  const letters = Array.from("ABCD").slice(0, task.size);
  const places = Object.keys(landmarks) as MapPlace[];
  const tile = "min-h-11 rounded-xl border-2 bg-white px-2 ";
  const answer = task.mode === "place" ? place : col + row;
  return <section className="grid gap-3">
    <div className="rounded-xl bg-white p-2">
      <h2 className="font-display text-lg">Legende</h2>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">{places.map(p => <li key={p} className="flex items-center gap-1"><Sign place={p} />
        <span className="sr-only">{landmarks[p].symbol} steht für </span>{landmarks[p].name}</li>)}</ul>
    </div>
    <table className="mx-auto w-full max-w-sm table-fixed border-collapse text-center">
      <caption className="font-display">Lageplan</caption>
      <thead><tr><td className="w-7" />{letters.map(l => <th scope="col" key={l}>{l}</th>)}</tr></thead>
      <tbody>{letters.map((_, y) => <tr key={y}><th scope="row">{y+1}</th>{letters.map((_, x) => {
        const i = y * task.size + x, item = task.cells[i];
        const neighbor = task.closed?.includes(i) ? task.closed.find(n => n !== i) : undefined;
        const edge = neighbor === undefined ? "" : neighbor === i+1 ? "border-r-4 border-r-rose-700" : neighbor === i-1 ? "border-l-4 border-l-rose-700" :
          neighbor > i ? "border-b-4 border-b-rose-700" : "border-t-4 border-t-rose-700";
        return <td key={x} className={`h-12 border border-grape-light ${edge} ${solved && i === target ? "bg-leaf-light" : "bg-white"}`}>
          {item && <Sign place={item} />}<span className="sr-only">{item ? landmarks[item].symbol : "Leeres Feld"}</span></td>;
      })}</tr>)}</tbody>
    </table>
    {task.mode === "neighbor" && <p>Direkt neben heißt: Die Felder teilen eine offene Seite.</p>}
    {task.closed && <p className="rounded-xl bg-rose-light p-2">Die dicke Linie sperrt die gemeinsame Seite von {mapCoordinate(task.size, task.closed[0])} und {mapCoordinate(task.size, task.closed[1])}.</p>}
    {solved ? <p className="rounded-xl bg-white p-3">{task.solution}</p> :
      <fieldset disabled={locked} className="grid gap-2">
        {task.mode === "place" ? <label>Welcher Ort? <select className={tile} value={place} onChange={e => setPlace(e.target.value)}>
          <option value="">Ort wählen</option>{places.map(p => <option key={p} value={p}>{landmarks[p].name}</option>)}</select></label> :
          <div className="flex flex-wrap gap-2">
            <label>Spalte <select className={tile} value={col} onChange={e => setCol(e.target.value)}><option value="">Wähle</option>
              {letters.map(l => <option key={l}>{l}</option>)}</select></label>
            <label>Zeile <select className={tile} value={row} onChange={e => setRow(e.target.value)}><option value="">Wähle</option>
              {letters.map((_, y) => <option key={y}>{y+1}</option>)}</select></label>
          </div>}
        <Button disabled={task.mode === "place" ? !place : !col || !row} onClick={() => {
          if (!locked) onAnswer(checkSite(task, answer), task.hint);
        }}>Antwort prüfen</Button>
      </fieldset>}
  </section>;
}
