import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calculator } from "lucide-react";

/**
 * Startseite = Weggabelung.
 *
 * Es gibt zwei voneinander unabhängige Wege durch die App:
 *   1. Die Geschichte (Quest) — Anneli, das Buch, die Welten.
 *   2. Das Kopfrechen-Training — Module, Tricks, Übungsrunden.
 *
 * Keiner der beiden Wege setzt den anderen voraus, und beide haben ihren
 * eigenen Spielstand. Wer nur rechnen will, muss nicht durch die Geschichte —
 * und wer nur die Geschichte will, sieht nie eine Übungsrunde.
 */
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl text-center">
        <h1 className="mb-3 text-4xl font-semibold leading-tight md:text-5xl">
          Anneli & das verzauberte Buch
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-[var(--color-ink-soft)]">
          Was möchtest du heute machen?
        </p>

        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2">
          {/* Weg 1 — die Geschichte */}
          <Link
            href="/quest/intro"
            className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-paper)] shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
          >
            {/* Hero-Bild — Anneli mit dem leuchtenden Buch, KI-generiert.
                Quelle: scripts/generate-hero-images.mjs */}
            <div className="aspect-[4/3] w-full overflow-hidden">
              <Image
                src="/hero/anneli-with-book.png"
                alt="Anneli sitzt mit einem leuchtenden, magischen Buch auf dem Schoß"
                width={1024}
                height={1024}
                priority
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-lavender)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-lavender-deep)]">
                <BookOpen size={14} strokeWidth={2} />
                Geschichte
              </span>
              <h2 className="mb-2 text-2xl font-semibold">Die Reise ins Buch</h2>
              <p className="mb-5 flex-1 leading-relaxed text-[var(--color-ink-soft)]">
                Auf deinem Schreibtisch liegt ein altes Buch, das du noch nie gesehen hast.
                Es funkelt ein bisschen, wenn du nicht hinsiehst. Willst du es aufschlagen?
              </p>
              <span className="inline-flex w-fit items-center justify-center rounded-full bg-[var(--color-lavender-deep)] px-6 py-3 font-semibold text-white shadow-[var(--shadow-soft)]">
                Buch öffnen
              </span>
            </div>
          </Link>

          {/* Weg 2 — das Kopfrechen-Training */}
          <Link
            href="/training"
            className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-paper)] shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
          >
            {/* Statt eines Bildes eine Rechen-Kachel: die Aufgabe selbst ist
                das Motiv — der Trick daneben zeigt sofort, worum es geht. */}
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 bg-[var(--color-mint)]">
              <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tabular-nums text-[var(--color-mint-deep)]">
                8 + 7 = 15
              </p>
              <p className="rounded-full bg-[var(--color-paper)]/80 px-4 py-1.5 text-sm font-medium text-[var(--color-ink-soft)]">
                erst zur 10, dann der Rest
              </p>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-mint)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mint-deep)]">
                <Calculator size={14} strokeWidth={2} />
                Training
              </span>
              <h2 className="mb-2 text-2xl font-semibold">Kopfrechnen</h2>
              <p className="mb-5 flex-1 leading-relaxed text-[var(--color-ink-soft)]">
                Zehn Module — von kleinen Zahlen bis zum Einmaleins. Zu jedem Modul
                gehört ein Trick, mit dem du schneller rechnest als vorher.
              </p>
              <span className="inline-flex w-fit items-center justify-center rounded-full bg-[var(--color-mint-deep)] px-6 py-3 font-semibold text-white shadow-[var(--shadow-soft)]">
                Rechnen üben
              </span>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-sm text-[var(--color-ink-soft)]">
          Eine Lernreise für neugierige Kinder ab Klasse 1.
        </p>
      </div>
    </main>
  );
}
