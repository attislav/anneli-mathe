"use client";

import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { ArcadeScreen } from "@/screens/ArcadeScreen";

export default function ArcadePage() {
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return <ArcadeScreen save={save} />;
}
