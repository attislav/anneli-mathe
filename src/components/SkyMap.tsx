"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cloud, Bird, Feather, CheckCircle2 } from "lucide-react";
import { BRIDGES } from "@/data/bridges";
import {
  loadProgress,
  bridgesDoneCount,
  getBridgeProgress,
  type ProgressState,
} from "@/data/progress";
import { BookSays } from "./BookSays";

export function SkyMap() {
  // Persistenz nur client-side — beim ersten Render zeigen wir den
  // Default-State (keine Brücke fertig), nach Hydration den echten Stand.
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    // localStorage gibt es nicht auf dem Server — daher Lese-Hydration
    // hier nach Mount. Das ist der dokumentierte SSR-safe Pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadProgress());
  }, []);

  const doneCount = progress ? bridgesDoneCount(progress) : 0;
  const allDone = doneCount === BRIDGES.length;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 text-center">
        <div className="mb-4 flex justify-center gap-3 text-[var(--color-mint-deep)]">
          <Cloud size={36} strokeWidth={1.6} />
          <Bird size={36} strokeWidth={1.6} />
          <Cloud size={36} strokeWidth={1.6} />
        </div>
        <h1 className="mb-3 text-3xl font-semibold md:text-4xl">Das Himmelreich</h1>
        {progress ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            {doneCount} von {BRIDGES.length} Brücken repariert
          </p>
        ) : null}
      </header>

      <BookSays audio="sky-kingdom-arrival">
        {allDone
          ? "Du hast es geschafft! Alle Brücken stehen wieder. Die Vögel zwitschern dir hinterher — und ich glaube, ich habe ein Geschenk für dich."
          : "Da sind wir. Sechs Brücken — alle wackelig. Such dir eine aus, mit der du anfangen willst. Du musst nicht der Reihe nach, ich verrate dich nicht."}
      </BookSays>

      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BRIDGES.map((bridge) => {
          const bp = progress ? getBridgeProgress(progress, bridge.id) : null;
          const isDone = bp?.status === "done";

          return (
            <li key={bridge.id}>
              <Link
                href={`/quest/sky-kingdom/${bridge.id}`}
                className={`group relative block h-full rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1 ${
                  isDone
                    ? "bg-[var(--color-mint)]/60"
                    : "bg-[var(--color-paper)]"
                }`}
              >
                {isDone ? (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--color-mint-deep)] px-2 py-1 text-xs font-semibold text-white">
                    <CheckCircle2 size={14} strokeWidth={2} />
                    Fertig
                  </div>
                ) : null}

                <div
                  className={`mb-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    isDone
                      ? "bg-white/70 text-[var(--color-mint-deep)]"
                      : "bg-[var(--color-mint)] text-[var(--color-mint-deep)]"
                  }`}
                >
                  Brücke {bridge.order}
                </div>
                <h2 className="mb-2 text-xl font-semibold leading-snug">
                  {bridge.name}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {bridge.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-[var(--color-lavender-deep)]">
                    {bridge.skillLabel}
                  </div>
                  {isDone && bp ? (
                    <div className="inline-flex items-center gap-1 text-xs text-[var(--color-mint-deep)]">
                      <Feather size={14} strokeWidth={1.8} />
                      {bp.tasksDone}/{bridge.totalTasks}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
