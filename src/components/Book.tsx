import { BookOpen } from "lucide-react";

type BookProps = {
  /** What the book is "saying" right now. Can be empty. */
  message?: string;
};

export function Book({ message }: BookProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 w-full max-w-xl -translate-x-1/2 px-4">
      <div className="pointer-events-auto flex items-end gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-lavender)] text-[var(--color-lavender-deep)] shadow-[var(--shadow-soft)]">
          <BookOpen size={32} strokeWidth={1.7} />
        </div>

        {message ? (
          <div
            className="relative max-w-md flex-1 rounded-2xl rounded-bl-sm bg-[var(--color-paper)] px-5 py-3 text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
            role="status"
            aria-live="polite"
          >
            <p className="text-base leading-snug">{message}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
