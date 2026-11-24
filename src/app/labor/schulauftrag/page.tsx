import { Suspense } from "react";
import { SchoolScreen } from "@/screens/SchoolScreen";
import { Splash } from "@/ui/chrome";

export default function Page() {
  return <Suspense fallback={<Splash />}><SchoolScreen /></Suspense>;
}
