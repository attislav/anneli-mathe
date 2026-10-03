"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Onboarding } from "@/screens/Onboarding";
import { AdventScreen } from "@/screens/AdventScreen";

function Inner() {
  const params = useSearchParams();
  const save = useSave();
  if (!save) return <Splash />;
  if (!save.profile) return <Onboarding />;
  return <AdventScreen save={save} preview={params.get("vorschau") === "1"} />;
}

export default function AdventPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Inner />
    </Suspense>
  );
}
