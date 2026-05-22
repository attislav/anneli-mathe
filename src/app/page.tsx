import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        {/* Hero-Bild — Anneli mit dem leuchtenden Buch, KI-generiert mit
            durchgehendem Hilda-/Moomin-Style. Quelle: scripts/generate-hero-images.mjs */}
        <div className="mx-auto mb-8 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
          <Image
            src="/hero/anneli-with-book.png"
            alt="Anneli sitzt mit einem leuchtenden, magischen Buch auf dem Schoß"
            width={1024}
            height={1024}
            priority
            className="h-auto w-full"
          />
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
