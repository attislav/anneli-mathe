import { useState } from "react";
import { buildHint, checkTowerAnswer, directions, leftInBox, moveCube, silhouette, targetTower, towerCells, towerTotal } from "@/game/tower";
import type { TowerTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function Tower({ task, status, onAnswer }: FormatProps<TowerTask>) {
  const [history, setHistory] = useState<number[][]>([task.initial]);
  const [view, setView] = useState(false), [columns, setColumns] = useState([-1,-1]), [answer,setAnswer] = useState("");
  const solved = status === "right" || status === "reveal", locked = status !== "ask";
  const heights = solved ? targetTower(task) : history[history.length-1], box = leftInBox(task, heights);
  const shown = solved ? silhouette(heights, task.side) : columns;
  const tile = "min-h-11 rounded-xl border-2 border-grape-light bg-white px-2 ";
  function move(cell: number, delta: 1 | -1) {
    setHistory(prev => {
      const current = prev[prev.length-1], next = moveCube(task, current, cell, delta);
      return current === next ? prev : [...prev,next];
    });
  }
  function check() {
    if (locked) return;
    if (!view) {
      const hint = buildHint(task, heights);
      if (hint) onAnswer(false, hint);
      else setView(true);
    } else {
      const hint = checkTowerAnswer(heights,task.side,columns,answer);
      onAnswer(hint === null,hint ?? undefined);
    }
  }
  return <section className="grid gap-3">
    <div className="rounded-2xl bg-sun-light p-3"><h2 className="font-display text-lg">Umbauauftrag</h2>
      <ul>{task.changes.map(c => <li key={c.cell}>{c.delta === 1 ? "Setze einen Würfel auf" : "Nimm einen Würfel von"} {towerCells[c.cell]}{c.delta === -1 ? " weg" : ""}.</li>)}</ul>
    </div>
    <p aria-live="polite">Würfel im Vorrat: {box}. Abgebaute Würfel kommen zurück in den Vorrat.</p>
    <table className="w-full table-fixed text-center"><caption>Höhenplan von oben · Norden ist oben, Osten rechts</caption>
      <thead><tr><td className="w-7" /><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody>
      {[0,1].map(row => <tr key={row}><th scope="row">{row+1}</th>{[0,1].map(col => {
        const i = 2*row+col;
        return <td key={i} className="rounded-xl border-2 border-grape-light bg-white p-1">
          <span className="block text-xs">Start: {task.initial[i]}</span><strong className="block text-xl">{heights[i]} Würfel</strong>
          {!solved && !view && <div className="flex justify-center gap-1">{([-1,1] as const).map(d => <button key={d} type="button"
            aria-label={`${towerCells[i]}: einen Würfel ${d === 1 ? "aufsetzen" : "abbauen"}`} className={tile}
            disabled={locked || (d < 0 ? !heights[i] : box === 0 || heights[i] === 4)} onClick={() => move(i,d)}>{d < 0 ? "−" : "+"}</button>)}</div>}
        </td>;
      })}</tr>)}</tbody></table>
    {!view && !solved && <button type="button" disabled={locked || history.length < 2} className={tile}
      onClick={() => setHistory(h => h.length > 1 ? h.slice(0,-1) : h)}>Letzten Bauschritt zurücknehmen</button>}
    {(view || solved) && <>
      <p className="rounded-xl bg-sky-light p-3">Du schaust {directions[task.side].text}. Links siehst du {directions[task.side].halves[0]}, rechts {directions[task.side].halves[1]}.</p>
      <fieldset disabled={locked} className="grid grid-cols-2 gap-2"><legend>Lege die Höhe der beiden Umrisse. Tippe je eine Höhe an.</legend>
        {shown.map((h,i) => <div key={i} role="group" aria-label={i ? "Rechter Umriss" : "Linker Umriss"} className="grid">
          <strong className="text-center">{i ? "Rechts" : "Links"}</strong>
          {[4,3,2,1,0].map(n => <button type="button" key={n} aria-pressed={h === n} aria-label={`${i ? "Rechts" : "Links"}, Höhe ${n}`}
            className={"min-h-11 border " + ((n > 0 && n <= h || n === 0 && h === 0) ? "border-grape bg-grape-light" : "border-grape-light bg-white")}
            onClick={() => setColumns(v => v.map((old,j) => i === j ? n : old))}>{n}</button>)}
        </div>)}</fieldset>
      {solved ? <p>Alle vier Stapel haben zusammen {towerTotal(heights)} Würfel.</p> :
        <label>Wie viele Würfel stehen insgesamt auf dem Plan? <input disabled={locked} className={tile+"w-16"} inputMode="numeric"
          value={answer} onChange={e => { if (/^\d{0,2}$/.test(e.target.value)) setAnswer(e.target.value); }} /></label>}
      {!solved && <button type="button" className="min-h-11 underline" disabled={locked} onClick={() => { setView(false); setColumns([-1,-1]); setAnswer(""); }}>Umbau ändern</button>}
    </>}
    {!solved && <Button disabled={locked || (view ? columns.includes(-1) || !answer : false)} onClick={check}>{view ? "Ansicht und Anzahl prüfen" : "Umbau prüfen"}</Button>}
  </section>;
}
