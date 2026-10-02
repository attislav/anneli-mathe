"use client";

import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { MeScreen } from "@/screens/MeScreen";

export default function MePage() {
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return <MeScreen save={save} />;
}
