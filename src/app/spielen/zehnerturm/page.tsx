"use client";

import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { GameShell } from "@/games/GameShell";
import { TenTower } from "@/games/TenTower";

export default function TenTowerPage() {
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return (
    <GameShell save={save} gameId="/spielen/zehnerturm" title="Zehner-Turm" rules="Tippe auf den Turm, auf den der Klotz fallen soll. Ist ein Turm genau 10, knallt er und du bekommst 10 Punkte! Zu viel passt nicht drauf." tone="#3A3E85">
      {(finish) => <TenTower onEnd={finish} />}
    </GameShell>
  );
}
