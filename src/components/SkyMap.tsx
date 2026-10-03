"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bird, Feather, CheckCircle2 } from "lucide-react";
import { BRIDGES } from "@/data/bridges";
import {
  loadProgress,
  bridgesDoneCount,
  getBridgeProgress,
  type ProgressState,
} from "@/data/progress";
import { BookSays } from "./BookSays";
import { BirdOnboarding } from "./BirdOnboarding";
import { AmbientPlayer } from "./AmbientPlayer";
import { ambientSrc } from "@/data/voices";

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
  const birdName = progress?.birdName ?? "Pip";

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* Onboarding: erste Frage beim ersten Mal — „Wie soll dein Vogel heißen?".
          PauseSuggestion wird vom Quest-Layout für alle Quest-Seiten gerendert. */}
      <BirdOnboarding progress={progress} onDone={setProgress} />

      {/* Sky-Kingdom-Ambient: leiser Pastell-Pad / Wind-Loop im Hintergrund.
          Datei wird in Slot 4 / Wo 4 nach public/audio/ambient/ gedroppt;
          bis dahin scheitert der Player leise. */}
      <AmbientPlayer src={ambientSrc("sky-kingdom")} label="Himmelreich-Musik" />

      {/* Hero-Bild der schwebenden Inseln + Brücken — gibt der Karte sofort
          Atmosphäre. KI-generiert (gpt-image-2, quality low). */}
      <div className="mb-8 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
        <Image
          src="/hero/sky-kingdom-vista.png"
          alt="Wackelige Brücken zwischen schwebenden Pastell-Inseln im Himmelreich"
          width={1536}
          height={1024}
          priority
          className="h-auto w-full"
        />
      </div>

      <header className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-semibold md:text-4xl">Das Himmelreich</h1>
        {progress ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-[var(--color-ink-soft)]">
              {doneCount} von {BRIDGES.length} Brücken repariert
            </p>
            <p className="inline-flex items-center gap-1 text-sm text-[var(--color-mint-deep)]">
              <Bird size={14} strokeWidth={1.8} />
              <span>
                <strong>{birdName}</strong> ist bei dir.
              </span>
            </p>
          </div>
        ) : null}
      </header>

      <BookSays audio="sky-kingdom-arrival">
        {allDone
          ? `Du hast es geschafft! Alle Brücken stehen wieder. Die Vögel zwitschern dir hinterher — und ich glaube, ${birdName} hat ein Geschenk für dich.`
          : `Da sind wir. Sechs Brücken — alle wackelig. Such dir eine aus, mit der du anfangen willst. Du musst nicht der Reihe nach, ${birdName} und ich verraten dich nicht.`}
      </BookSays>

      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BRIDGES.map((bridge) => {
          const bp = progress ? getBridgeProgress(progress, bridge.id) : null;
          const isDone = bp?.status === "done";

          // Pro Brücke ein eigenes Status-Bild — `broken` solange nicht
          // repariert, `repaired` nach Abschluss. Dateien liegen unter
          // public/bridges/<id>/{broken,repaired}.png (gpt-image-2, quality low).
          const imageSrc = `/bridges/${bridge.id}/${isDone ? "repaired" : "broken"}.png`;

          return (
            <li key={bridge.id}>
              <Link
                href={`/quest/sky-kingdom/${bridge.id}`}
                className={`group relative block h-full overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1 ${
                  isDone
                    ? "bg-[var(--color-mint)]/60"
                    : "bg-[var(--color-paper)]"
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-lavender)]/30">
                  <Image
                    src={imageSrc}
                    alt={`${bridge.name} — ${isDone ? "repariert" : "wackelig"}`}
                    width={512}
                    height={512}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isDone ? (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-mint-deep)] px-2 py-1 text-xs font-semibold text-white shadow-[var(--shadow-soft)]">
                      <CheckCircle2 size={14} strokeWidth={2} />
                      Fertig
                    </div>
                  ) : null}
                </div>

                <div className="p-5">
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
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
