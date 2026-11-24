"use client";

import Link from "next/link";
import { useState } from "react";
import { activeProfileId, needsProfilePick, useSave } from "@/game/state";
import { strategyKey, strategyTitle, type StrategyCard } from "@/game/strategyCards";
import { removeStrategy, startStrategy, type StrategyRound } from "@/game/strategyPractice";
import { Button } from "@/ui/Button";
import { Splash } from "@/ui/chrome";
import { LabActivity } from "./LabScreen";
import { Onboarding } from "./Onboarding";
import { ProfilePicker } from "./ProfilePicker";

export function StrategyScreen() {
  const save = useSave();
  if (!save) return <Splash />;
  if (needsProfilePick()) return <ProfilePicker />;
  if (!save.profile) return <Onboarding />;
  const owner = activeProfileId();
  return <StrategyList key={owner} owner={owner} cards={save.strategies} />;
}
function StrategyList({ owner, cards }: { owner: string; cards: StrategyCard[] }) {
  const [round, setRound] = useState<StrategyRound | null>(null);
  const play = (key: string) => setRound(startStrategy(owner, key));
  if (round) return <LabActivity key={round.id} round={round} onBack={() => setRound(null)} onReplay={() => play(round.cardKey)} />;
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <Link href="/labor/" className="w-fit rounded-xl bg-white px-4 py-2">← Zum Labor</Link>
    <h1 className="font-display text-3xl">Meine Rechenwege</h1>
    {!cards.length && <p>Beim Mal-Feld und in der Fragenwerkstatt kannst du nach der Lösung „Diesen Weg merken“ wählen. Hier kannst du ihn mit neuen Zahlen ausprobieren.</p>}
    {cards.map(card => { const key = strategyKey(card), title = strategyTitle(card);
      return <section key={key} className="grid gap-2 rounded-2xl bg-white p-3"><h2 className="font-display text-lg">{title}</h2>
        <div className="flex flex-wrap items-center gap-2"><Button size="md" onClick={() => play(key)}>Mit neuen Zahlen üben</Button>
          <button type="button" className="min-h-11 px-2" aria-label={title + " entfernen"} onClick={() => removeStrategy(owner, key)}>Entfernen</button></div>
      </section>; })}
  </main>;
}
