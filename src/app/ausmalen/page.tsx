"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { ColoringScreen } from "@/screens/ColoringScreen";

function Inner() {
  const params = useSearchParams();
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return <ColoringScreen save={save} pageId={params.get("b") ?? ""} />;
}

export default function ColoringPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Inner />
    </Suspense>
  );
}
