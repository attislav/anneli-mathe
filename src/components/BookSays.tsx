import type { ReactNode } from "react";
import { AudioButton } from "./AudioButton";
import { audioSrc } from "@/data/narration";

type Props = {
  /** Narration ID (without the /audio/ prefix or .mp3) — must exist in narration.ts. */
  audio?: string;
  children: ReactNode;
};

/**
 * Inline "the book is saying X" block — used inside MDX stories and pages.
 * Pairs the text with a play button when an `audio` id is provided.
 */
export function BookSays({ audio, children }: Props) {
  return (
    <div className="my-6 flex items-start gap-3 rounded-2xl bg-[var(--color-paper)] px-5 py-4 shadow-[var(--shadow-soft)]">
      <div className="flex-1 text-base leading-relaxed text-[var(--color-ink)]">
        {children}
      </div>
      {audio ? <AudioButton src={audioSrc(audio)} label="Vorlesen" /> : null}
    </div>
  );
}
