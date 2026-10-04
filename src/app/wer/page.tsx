"use client";

import { useRouter } from "next/navigation";
import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { ProfilePicker } from "@/screens/ProfilePicker";

export default function WhoPage() {
  const save = useSave();
  const router = useRouter();
  if (!save) return <Splash />;
  return <ProfilePicker onDone={() => router.push("/")} />;
}
