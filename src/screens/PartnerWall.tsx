import { useReducer } from "react";
import { freshWall, wallMove, wallPositions, wallRows, type PartnerAction, type PartnerState } from "@/game/partnerWall";
import { Button } from "@/ui/Button";

export function PartnerWall({ onBack }: { onBack: () => void }) {
  const [state, dispatch] = useReducer(wallMove, undefined, freshWall);
  return <PartnerWallView state={state} act={dispatch} onBack={onBack} />;
}
export function PartnerWallView({ state, act, onBack }: { state: PartnerState; act: (action: PartnerAction) => void; onBack: () => void }) {
  const { phase, stones, hidden, guess, message } = state;
  const headings = { write: "Baue deine Zahlenmauer", choose: "Welchen Stein versteckst du?", pass: "Jetzt ist dein Partner dran",
    solve: "Welche Zahl fehlt?", done: "Mauer gelöst!" };
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-5">
    <button type="button" className="min-h-11 justify-self-start rounded-xl bg-white px-3" onClick={onBack}>← Zum Labor</button>
    <h1 className="font-display text-3xl">{headings[phase]}</h1>
    {phase === "pass" ? <>
      <p>Gib das Gerät weiter. Öffne die Mauer, wenn du bereit zum Rätseln bist.</p>
      <Button onClick={() => act({ type: "open" })}>Ich bin bereit</Button>
    </> : <>
      {phase === "write" && <p>Wähle unten drei Zahlen von 1 bis 20. Rechne die nächste Reihe und die Spitze selbst aus. Jeder obere Stein ist die Summe der zwei Steine darunter.</p>}
      {phase === "choose" && <p>Deine Mauer stimmt. Tippe den Stein an, den dein Partner ausrechnen soll.</p>}
      <div role="group" aria-label="Zahlenmauer" className="grid gap-1 rounded-2xl bg-white p-3">
        {wallRows.map((row, r) => <div key={r} className="flex justify-center gap-1">{row.map(i => {
          const tile = "grid h-14 w-1/4 place-items-center rounded-xl border-2 text-center font-display text-2xl ";
          const pos = "Stein " + wallPositions[i];
          if (phase === "write") return <input key={i} className={tile + "border-grape-light bg-white"} aria-label={pos}
            inputMode="numeric" autoComplete="off" value={stones[i]} onChange={e => act({ type: "stone", at: i, value: e.target.value })} />;
          if (phase === "choose") return <button key={i} type="button" aria-label={pos + ", " + stones[i]} aria-pressed={hidden === i}
            className={tile + (hidden === i ? "border-grape bg-grape-light" : "border-grape-light bg-white")}
            onClick={() => act({ type: "hide", at: i })}>{stones[i]}</button>;
          const missing = phase === "solve" && hidden === i;
          return <span key={i} className={tile + (i === hidden ? "border-grape bg-grape-light" : "border-grape-light bg-white")}>
            <span className="sr-only">{pos}, </span>{missing ? <><span aria-hidden="true">?</span><span className="sr-only">gesuchte Zahl</span></> : stones[i]}</span>;
        })}</div>)}
      </div>
      {message && <p role="status" className="rounded-xl bg-sun-light p-3">{message}</p>}
      {phase === "write" && <Button onClick={() => act({ type: "check" })}>Mauer prüfen</Button>}
      {phase === "choose" && <>
        <Button disabled={hidden === null} onClick={() => act({ type: "pass" })}>Für die Übergabe verdecken</Button>
        <button type="button" className="min-h-11 underline" onClick={() => act({ type: "edit" })}>Mauer ändern</button>
      </>}
      {phase === "solve" && <form className="grid gap-2" onSubmit={e => { e.preventDefault(); act({ type: "solve" }); }}>
        <label>Meine Zahl <input inputMode="numeric" autoComplete="off" aria-label="Meine Zahl" value={guess} className="min-h-11 w-20 rounded-xl border-2 border-grape-light px-2"
          onChange={e => act({ type: "guess", value: e.target.value })} /></label>
        <Button type="submit" disabled={!guess}>Zahl prüfen</Button></form>}
      {phase === "done" && <Button onClick={() => act({ type: "swap" })}>Rollen tauschen und neue Mauer bauen</Button>}
    </>}
  </main>;
}
