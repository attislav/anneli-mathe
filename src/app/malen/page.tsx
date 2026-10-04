"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { PaintScreen } from "@/screens/PaintScreen";

function Inner() {
  const params = useSearchParams();
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return <PaintScreen save={save} puzzleId={params.get("p") ?? ""} />;
}

export default function PaintPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Inner />
    </Suspense>
  );
}
