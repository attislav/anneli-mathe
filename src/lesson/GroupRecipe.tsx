import { useState } from "react";
import { recipeAmounts, recipeHint } from "@/game/groupRecipe";
import type { GroupRecipeTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function GroupRecipe({ task, status, onAnswer }: FormatProps<GroupRecipeTask>) {
  const [groups, setGroups] = useState(0);
  const blank = () => task.ingredients.map(() => "");
  const [needs, setNeeds] = useState(blank);
  const [shortages, setShortages] = useState(blank);
  const [compare, setCompare] = useState(false);
  const solved = status === "right" || status === "reveal";
  const disabled = status !== "ask";
  const shownGroups = solved ? task.children / 2 : groups;
  const button = "min-h-11 rounded-xl border-2 bg-white px-3";

  function check() {
    if (disabled) return;
    const hint = recipeHint(task, groups, needs, compare ? shortages : undefined);
    if (hint) onAnswer(false, hint);
    else if (compare) onAnswer(true);
    else setCompare(true);
  }

  return <section className="grid gap-3">
    <h2 className="font-display text-xl">{task.title} für {task.children} Kinder</h2>
    <div className="rounded-xl bg-leaf-light p-3">
      <h3 className="font-bold">Grundrezept für 2 Kinder</h3>
      <ul>{task.ingredients.map(item => <li key={item.name}>{item.name} · {item.base} {item.unit}</li>)}</ul>
    </div>
    <div className="grid gap-2">
      <h3 className="font-bold">Deine Zweiergruppen</h3>
      <div aria-live="polite" className="flex flex-wrap items-center gap-2">
        <span>{shownGroups} {shownGroups === 1 ? "Gruppe" : "Gruppen"}</span>
        {Array.from({ length: shownGroups }, (_, i) => <span key={i} aria-hidden="true" className="rounded-lg bg-sky-light p-1">👤👤</span>)}
      </div>
      {!compare && !solved && <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={disabled || groups >= 5} onClick={() => setGroups(groups + 1)}>Gruppe dazulegen</button>
        <button type="button" className={button} disabled={disabled || groups === 0} onClick={() => setGroups(groups - 1)}>Gruppe wegnehmen</button>
      </div>}
    </div>
    <h3 className="font-bold">{compare || solved ? "Vergleiche mit dem Vorrat" : "Wie viel brauchst du insgesamt?"}</h3>
    {compare && !solved && <p>Trage für jede Zutat ein, wie viel noch fehlt. Reicht der Vorrat, trage 0 ein.</p>}
    {task.ingredients.map((item, index) => {
      const { needed, missing } = recipeAmounts(item, task.children / 2);
      const field = compare ? "Fehlmenge" : "Bedarf";
      return <div key={item.name} className="rounded-xl border-2 bg-white p-2">
        <h4 className="font-bold">{item.name}</h4>
        {(compare || solved) && <p>Bedarf {solved ? needed : needs[index]} {item.unit} · Vorrat {item.stock} {item.unit}</p>}
        {solved ? <strong>Fehlmenge {missing} {item.unit}</strong> : <label>
          {field} <input aria-label={field + " für " + item.name + " in " + item.unit} inputMode="numeric" disabled={disabled}
            className={button + " w-16"} value={(compare ? shortages : needs)[index]} onChange={event => {
              const value = event.target.value;
              if (/^\d{0,2}$/.test(value)) (compare ? setShortages : setNeeds)(old => old.map((n,i) => i === index ? value : n));
            }}/> {item.unit}
        </label>}
      </div>;
    })}
    {!solved && <>{compare && <button type="button" disabled={disabled} className="min-h-11 underline"
      onClick={() => { setCompare(false); setShortages(blank()); }}>Bedarf ändern</button>}
      <Button onClick={check} disabled={disabled || (compare ? shortages : needs).some(n => n === "")}>
        {compare ? "Vorrat prüfen" : "Bedarf prüfen"}
      </Button></>}
  </section>;
}
