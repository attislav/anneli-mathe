import type { ReactNode } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Book } from "@/components/Book";
import { PauseSuggestion } from "@/components/PauseSuggestion";

export default function QuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
          aria-label="Zur Startseite"
        >
          <Home size={18} />
          <span>Zurück</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col pb-36">{children}</main>

      <Book message="Hallo Anneli! Schön, dass du da bist. Ich bin … nun, ein Buch. Aber ein ganz besonderes." />

      {/* Pause-Vorschlag nach 10 Min App-Zeit. Sanft, kein hartes Lockout —
          läuft im Layout, damit alle Quest-Seiten denselben Timer teilen. */}
      <PauseSuggestion />
    </div>
  );
}
