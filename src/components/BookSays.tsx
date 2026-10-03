import Image from "next/image";
import type { ReactNode } from "react";
import { AudioButton } from "./AudioButton";
import { audioSrc } from "@/data/narration";

type Props = {
  /** Narration ID (without the /audio/ prefix or .mp3) — must exist in narration.ts. */
  audio?: string;
  children: ReactNode;
};

/**
 * Inline „das Buch sagt X"-Block — wird in MDX-Stories und Brücken-Seiten
 * verwendet. Pairing aus Buch-Asset + Text + Vorlese-Button. Das Buch-Asset
 * ist dasselbe wie in der schwebenden Book-Komponente — visuelle Konsistenz.
 */
export function BookSays({ audio, children }: Props) {
  return (
    <div className="my-6 flex items-start gap-3 rounded-2xl bg-[var(--color-paper)] px-5 py-4 shadow-[var(--shadow-soft)]">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--color-lavender)]/40">
        <Image
          src="/characters/book.png"
          alt="Das verzauberte Buch spricht"
          width={96}
          height={96}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 text-base leading-relaxed text-[var(--color-ink)]">
        {children}
      </div>
      {audio ? <AudioButton src={audioSrc(audio)} label="Vorlesen" /> : null}
    </div>
  );
}
