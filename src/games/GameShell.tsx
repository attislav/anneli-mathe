"use client";

// Rahmen für Mini-Spiele: Startbildschirm (kostet Münzen, zählt Spielzeit),
// Spiel, Ende mit Punkten und Rekord.

import { useState, type ReactNode } from "react";
import { addArcadeSeconds, recordGame, spendCoins, type SaveState } from "@/game/state";
import { sfx } from "@/game/sound";
import { arcadeSecondsLeft, GAME_COST, ROUND_SECONDS } from "@/screens/ArcadeScreen";
import { CoinIcon } from "@/ui/art";
import { Button, LinkButton } from "@/ui/Button";
import { Confetti, useBackdrop } from "@/ui/chrome";

type Props = {
  save: SaveState;
  gameId: string;
  title: string;
  rules: string;
  tone: string;
  children: (finish: (score: number) => void) => ReactNode;
};

export function GameShell({ save, gameId, title, rules, tone, children }: Props) {
  const [phase, setPhase] = useState<"start" | "play" | "end">("start");
  useBackdrop(tone);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(false);
  const [round, setRound] = useState(0);
  const left = arcadeSecondsLeft(save);
  const best = save.games[gameId] ?? 0;

  const start = () => {
    if (left <= 0 || !spendCoins(GAME_COST)) {
      sfx.wrong();
      return;
    }
    addArcadeSeconds(ROUND_SECONDS);
    sfx.coin();
    setRound((r) => r + 1);
    setPhase("play");
  };

  const finish = (s: number) => {
    setScore(s);
    setRecord(s > best);
    recordGame(gameId, s);
    sfx.fanfare();
    setPhase("end");
  };

  if (phase === "play") return <div key={round}>{children(finish)}</div>;

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-5 px-5 py-10 text-center text-white" style={{ background: tone }}>
      {phase === "end" && record && <Confetti />}
      <h1 className="font-display text-4xl font-semibold">{phase === "end" ? (record ? "Neuer Rekord!" : "Gut gespielt!") : title}</h1>
      {phase === "end" ? (
        <div className="font-display text-7xl font-semibold">{score}</div>
      ) : (
        <p className="max-w-sm text-lg text-white/90">{rules}</p>
      )}
      <div className="text-white/85">Rekord: {Math.max(best, phase === "end" ? score : 0)}</div>
      {left > 0 ? (
        <Button tone="sun" className="w-full max-w-sm" onClick={start} disabled={save.coins < GAME_COST}>
          {phase === "end" ? "Nochmal" : "Spielen"}
          <span className="flex items-center gap-1 text-lg">
            <CoinIcon size={20} /> {GAME_COST}
          </span>
        </Button>
      ) : (
        <p className="font-extrabold">Die Spielzeit für heute ist um. Morgen geht&apos;s weiter!</p>
      )}
      {save.coins < GAME_COST && left > 0 && <p className="text-white/85">Dir fehlen noch Münzen — die gibt&apos;s auf dem Pfad!</p>}
      <LinkButton href="/spielen" tone="white" className="w-full max-w-sm !text-ink">
        Zur Spielhalle
      </LinkButton>
    </main>
  );
}
