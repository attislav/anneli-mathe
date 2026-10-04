"use client";

import { needsProfilePick, useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { PathScreen } from "@/screens/PathScreen";
import { ProfilePicker } from "@/screens/ProfilePicker";

export default function Home() {
  const save = useSave();
  if (!save) return <Splash />;
  if (needsProfilePick()) return <ProfilePicker />;
  if (!save.profile) return <Onboarding />;
  return <PathScreen save={save} />;
}
