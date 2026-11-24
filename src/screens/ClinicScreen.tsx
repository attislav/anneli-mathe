"use client";

import Link from "next/link";
import { useState } from "react";
import { CLINIC_CASES, checkModel, clinicTransfer, ClinicRound, initialModel, modelPicture, moveCounter, type ClinicCase } from "@/game/clinic";
import { activeProfileId, needsProfilePick, useSave } from "@/game/state";
import { Button } from "@/ui/Button";
import { Splash } from "@/ui/chrome";
import { LabActivity } from "./LabScreen";
import { Onboarding } from "./Onboarding";
import { ProfilePicker } from "./ProfilePicker";

export function ClinicScreen() {
  const save = useSave();
  if (!save) return <Splash />;
  if (needsProfilePick()) return <ProfilePicker />;
  if (!save.profile) return <Onboarding />;
  const owner = activeProfileId();
  return <Clinic key={owner} owner={owner} />;
}

function Clinic({ owner }: { owner: string }) {
  const [topic, setTopic] = useState<ClinicCase | null>(null);
  const [round, setRound] = useState<ClinicRound | null>(null);
  function back() { setRound(null); setTopic(null); }
  if (round) return <LabActivity key={round.id} round={round} onBack={back}
    onReplay={() => setRound(new ClinicRound(owner, round.topic, clinicTransfer(round.topic, round.exercise)))} />;
  if (topic) return <ClinicModel key={topic} topic={topic} onBack={back} onNext={() => setRound(new ClinicRound(owner, topic))} />;
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-5">
    <Link href="/labor/" className="w-fit rounded-xl bg-white px-4 py-2">← Zum Labor</Link>
    <h1 className="font-display text-3xl">Mathe-Sprechstunde</h1>
    <p>Welche Rechnung möchtest du mit Plättchen ausprobieren?</p>
    {(["plus", "minus"] as const).map(key => <button key={key} type="button" onClick={() => setTopic(key)}
      className="rounded-2xl bg-white px-4 py-5 text-left font-display text-xl">{CLINIC_CASES[key].title}</button>)}
  </main>;
}

export function ClinicFrames({ total, capacity, start }: { total: number; capacity: number; start: number }) {
  return <span role="img" aria-label={`${total} Plättchen im Zehnerfeld`} className="flex flex-wrap justify-center gap-2">
    {Array.from({ length: Math.ceil(capacity / 10) }, (_, group) =>
      <span key={group} className="grid grid-cols-5 gap-0.5 rounded-xl bg-white p-1.5">
        {Array.from({ length: 10 }, (_, i) => {
          const n = group * 10 + i;
          return <i key={i} className={`size-4 rounded-full border ${n >= total ? "border-slate-300" : n >= start ? "bg-leaf-dark" : "bg-grape"}`} />;
        })}
      </span>)}
  </span>;
}

export function ClinicModel({ topic, onBack, onNext }: { topic: ClinicCase; onBack: () => void; onNext: () => void }) {
  const [state, setState] = useState(initialModel);
  const model = CLINIC_CASES[topic];
  const plus = topic === "plus";
  const { total, remaining } = modelPicture(topic, state);
  const done = state.phase === "done";
  const first = Math.abs(model.ten - model.start);
  const sign = plus ? "+" : "−";
  const move = () => setState(old => moveCounter(topic, old, 1));
  const board = <ClinicFrames total={total} start={model.start} capacity={plus ? 13 : 32} />;
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-5">
    <button type="button" onClick={onBack} className="w-fit rounded-xl bg-white px-4 py-2">← Zur Sprechstunde</button>
    <h1 className="font-display text-2xl">{model.title}</h1>
    <p>{done ? "So hast du die Rechnung zerlegt:" : state.phase === "ten" ?
      `${plus ? "Lege Plättchen dazu" : "Nimm Plättchen weg"}, bis du bei ${model.ten} bist.` :
      `Der erste Schritt ist geschafft. ${plus ? "Lege den Rest dazu." : "Nimm den Rest von der 30 weg."}`}</p>
    <div className="grid gap-2 rounded-2xl bg-sky-light p-3 text-center">
      {plus || done ? board : <button type="button" aria-label="Ein Plättchen aus dem Zehnerfeld wegnehmen" className="grid justify-items-center gap-2"
        onClick={move} disabled={!remaining}>{board}<span>Ein Plättchen wegnehmen</span></button>}
      <p aria-live="polite">Im Feld: {total}</p>
    </div>
    {!done && <>
      <div className="grid gap-2 rounded-2xl bg-white p-3 text-center">
        <p aria-live="polite">{plus ? "Noch im Vorrat" : "Noch wegzunehmen"}: {remaining}</p>
        {plus ? <button type="button" onClick={move} disabled={!remaining} aria-label="Ein Plättchen aus dem Vorrat dazulegen"
          className="grid min-h-12 justify-items-center gap-2 rounded-xl bg-leaf-light p-2">
          <span aria-hidden className="flex gap-1">{Array.from({ length: remaining }, (_, i) => <i key={i} className="size-4 rounded-full bg-leaf-dark" />)}</span>
          Ein Plättchen dazulegen</button> :
          <div aria-label={`${state.moved} weggenommene Plättchen`} role="img" className="flex min-h-5 justify-center gap-1">{Array.from({ length: state.moved }, (_, i) => <i key={i} className="size-4 rounded-full bg-grape" />)}</div>}
      </div>
      <button type="button" disabled={state.moved <= (state.phase === "rest" ? first : 0)} onClick={() => setState(old => moveCounter(topic, old, -1))}
        className="min-h-11 rounded-xl bg-white disabled:opacity-50">Ein Plättchen zurücklegen</button>
      <p role="status">{state.hint}</p>
      <Button onClick={() => setState(old => checkModel(topic, old))}>Schritt prüfen</Button>
    </>}
    {state.phase !== "ten" && <p className="rounded-xl bg-white p-3 font-display text-xl">{model.start} {sign} {first} = {model.ten}
      {done && <span className="mt-1 block">{model.ten} {sign} {model.distance - first} = {total}</span>}</p>}
    {done && <Button onClick={onNext}>Jetzt selbst rechnen</Button>}
  </main>;
}
