import Link from "next/link";
import { Cloud, Bird } from "lucide-react";
import { BRIDGES } from "@/data/bridges";
import { BookSays } from "./BookSays";

export function SkyMap() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 text-center">
        <div className="mb-4 flex justify-center gap-3 text-[var(--color-mint-deep)]">
          <Cloud size={36} strokeWidth={1.6} />
          <Bird size={36} strokeWidth={1.6} />
          <Cloud size={36} strokeWidth={1.6} />
        </div>
        <h1 className="mb-3 text-3xl font-semibold md:text-4xl">Das Himmelreich</h1>
      </header>

      <BookSays audio="sky-kingdom-arrival">
        „Da sind wir. Sechs Brücken — alle wackelig. Such dir eine aus, mit der du anfangen willst. Du musst nicht der Reihe nach, ich verrate dich nicht."
      </BookSays>

      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BRIDGES.map((bridge) => (
          <li key={bridge.id}>
            <Link
              href={`/quest/sky-kingdom/${bridge.id}`}
              className="group block h-full rounded-[var(--radius-card)] bg-[var(--color-paper)] p-6 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
            >
              <div className="mb-3 inline-flex items-center justify-center rounded-full bg-[var(--color-mint)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mint-deep)]">
                Brücke {bridge.order}
              </div>
              <h2 className="mb-2 text-xl font-semibold leading-snug">
                {bridge.name}
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {bridge.description}
              </p>
              <div className="text-xs font-medium text-[var(--color-lavender-deep)]">
                {bridge.skillLabel}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
