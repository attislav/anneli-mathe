"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Tier } from "@/game/adaptive";
import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { LessonScreen } from "@/lesson/LessonScreen";
import { Onboarding } from "@/screens/Onboarding";

function Inner() {
  const params = useSearchParams();
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  const tier = Math.min(2, Math.max(0, Number(params.get("t") ?? 0))) as Tier;
  return <LessonScreen save={save} nodeId={params.get("n") ?? ""} tier={tier} />;
}

export default function LessonPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Inner />
    </Suspense>
  );
}
