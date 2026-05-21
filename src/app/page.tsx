import Link from "next/link";
import { BookHeart } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-[var(--color-peach)] text-[var(--color-peach-deep)] shadow-[var(--shadow-soft)]">
          <BookHeart size={68} strokeWidth={1.6} />
        </div>

        <h1 className="mb-4 text-4xl font-semibold leading-tight md:text-5xl">
          Anneli & das verzauberte Buch
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-[var(--color-ink-soft)]">
          Auf deinem Schreibtisch liegt ein altes Buch, das du noch nie gesehen hast.
          Es funkelt ein bisschen, wenn du nicht hinsiehst. Willst du es aufschlagen?
        </p>

        <Link
          href="/quest/intro"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-lavender-deep)] px-8 py-4 text-lg font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
        >
          Buch öffnen
        </Link>

        <p className="mt-8 text-sm text-[var(--color-ink-soft)]">
          Eine Lernreise für neugierige Kinder ab Klasse 1.
        </p>
      </div>
    </main>
  );
}
