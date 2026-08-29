import { notFound } from "next/navigation";
import { TRAINING_MODULES, getTrainingModule } from "@/data/training/modules";
import { TrainingModuleView } from "@/components/TrainingModuleView";

type Params = { module: string };

export function generateStaticParams(): Params[] {
  return TRAINING_MODULES.map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { module: moduleId } = await params;
  const mod = getTrainingModule(moduleId);
  if (!mod) return {};
  return {
    title: `${mod.title} — Kopfrechnen`,
    description: mod.summary,
  };
}

export default async function TrainingModulePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { module: moduleId } = await params;
  const mod = getTrainingModule(moduleId);
  if (!mod) notFound();

  return <TrainingModuleView module={mod} />;
}
