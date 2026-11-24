import type { Metadata } from "next";
import { LabScreen } from "@/screens/LabScreen";

export const metadata: Metadata = { title: "Mathe-Labor — Sternenpfad" };

export default function LabPage() {
  return <LabScreen />;
}
