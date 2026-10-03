"use client";

import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { GameShell } from "@/games/GameShell";
import { Memory } from "@/games/Memory";

export default function MemoryPage() {
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return (
    <GameShell save={save} gameId="/spielen/memory" title="Rechen-Memory" rules="Finde immer die Aufgabe und ihr Ergebnis. Je weniger Züge du brauchst, desto mehr Punkte!" tone="#2A9FD9">
      {(finish) => <Memory onEnd={finish} />}
    </GameShell>
  );
}
