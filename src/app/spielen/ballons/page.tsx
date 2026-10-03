"use client";

import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { GameShell } from "@/games/GameShell";
import { Balloons } from "@/games/Balloons";

export default function BalloonsPage() {
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return (
    <GameShell save={save} gameId="/spielen/ballons" title="Ballon-Platzen" rules="Oben steht, welche Ballons zählen. Goldene Ballons bringen immer 5 Punkte! Alle 15 Sekunden kommt eine neue Regel." tone="#FF5D9E">
      {(finish) => <Balloons onEnd={finish} />}
    </GameShell>
  );
}
