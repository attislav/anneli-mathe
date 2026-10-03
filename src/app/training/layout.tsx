import type { ReactNode } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { PauseSuggestion } from "@/components/PauseSuggestion";

/**
 * Rahmen für das Kopfrechen-Training: bewusst schlicht, nur Rechnen.
 * Nach 10 Minuten schlägt die App eine Pause vor.
 */
export default function TrainingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="kopfrechnen flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
          aria-label="Zur Startseite"
        >
          <Home size={18} />
          <span>Startseite</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col pb-16">{children}</main>

      <PauseSuggestion />
    </div>
  );
}
