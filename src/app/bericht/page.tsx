"use client";

import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { ReportScreen } from "@/screens/ReportScreen";

export default function ReportPage() {
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return <ReportScreen save={save} />;
}
