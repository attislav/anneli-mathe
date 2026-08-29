import type { Metadata } from "next";
import { TrainingHome } from "@/components/TrainingHome";

export const metadata: Metadata = {
  title: "Kopfrechnen — Anneli & das verzauberte Buch",
  description:
    "Kopfrechen-Training in zehn Modulen: von den Zahlenfreunden bis 10 über den Hunderterraum bis zum Einmaleins — mit Rechentricks statt stumpfem Üben.",
};

export default function TrainingPage() {
  return <TrainingHome />;
}
