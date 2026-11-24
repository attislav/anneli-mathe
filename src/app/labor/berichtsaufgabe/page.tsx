import { Suspense } from "react";
import { ReportPracticeScreen } from "@/screens/ReportPractice";
import { Splash } from "@/ui/chrome";

export default function ReportPracticePage() {
  return <Suspense fallback={<Splash/>}><ReportPracticeScreen/></Suspense>;
}
