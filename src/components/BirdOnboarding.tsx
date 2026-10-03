"use client";

// Erstes Onboarding für Anneli: „Wie soll dein Vogel heißen?"
// Erscheint genau einmal, beim ersten Besuch der SkyMap — danach merkt
// sich localStorage den Namen und das Modal taucht nie wieder auf.
//
// UX-Regeln aus der ROADMAP (UX-Konzept-Sektion):
// - kein Stress, keine „Skip"-Falle — Anneli kann immer den Default „Pip" nehmen
// - der Name persistiert sofort beim Bestätigen
// - der Name wird ab jetzt im Story-Text vom Buch verwendet (BookSays-Komponenten
//   die `{birdName}` interpolieren; v1: SkyMap-Header + BridgeChallenge Quips)

import { useEffect, useState } from "react";
import { Bird, Sparkles } from "lucide-react";
import { setBirdName, type ProgressState } from "@/data/progress";

type Props = {
  /** Aktueller Progress-State — Modal entscheidet selbst, ob es sich zeigt. */
  progress: ProgressState | null;
  /** Wird aufgerufen, wenn der Name gesetzt wurde (oder „Später"-Default). */
  onDone: (next: ProgressState) => void;
};

// Wir definieren das Onboarding als „erledigt", sobald `progress.birdName`
// vom Default-Wert „Pip" abweicht ODER eine Erledigt-Flagge in localStorage steht.
// Für v1 reicht eine eigene Flagge — das gibt Anneli die Möglichkeit, „Pip"
// bewusst zu wählen, ohne dass das Modal sie weiter nervt.
const ONBOARDING_FLAG = "anneli.onboarding.bird.v1";

function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ONBOARDING_FLAG) === "done";
  } catch {
    return true;
  }
}

function markOnboardingDone(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_FLAG, "done");
  } catch {
    // ignore — kein Showstopper
  }
}

// Ein paar Beispiel-Namen, die Anneli inspirieren können (kein Druck, frei wählbar).
const SUGGESTIONS = ["Pip", "Fips", "Lotti", "Wolki", "Schnabel", "Federchen"] as const;

export function BirdOnboarding({ progress, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    // Modal nur zeigen, wenn:
    //  1) progress geladen ist (sonst wissen wir nichts)
    //  2) Onboarding-Flag noch nicht gesetzt
    if (!progress) return;
    if (hasCompletedOnboarding()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, [progress]);

  if (!open || !progress) return null;

  function commit(chosenName: string) {
    const next = setBirdName(progress!, chosenName);
    markOnboardingDone();
    setOpen(false);
    onDone(next);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/30 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bird-onboarding-title"
    >
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-paper)] p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-mint)] text-[var(--color-mint-deep)]">
            <Bird size={42} strokeWidth={1.6} />
          </div>
        </div>

        <h2
          id="bird-onboarding-title"
          className="mb-3 text-center text-2xl font-semibold"
        >
          Ein kleiner Vogel kommt mit dir.
        </h2>

        <p className="mb-6 text-center text-base leading-relaxed text-[var(--color-ink-soft)]">
          Er begleitet dich durchs Himmelreich. Wie soll er heißen?
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            commit(trimmed || "Pip");
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sein Name …"
            maxLength={24}
            autoFocus
            className="mb-4 w-full rounded-2xl bg-[var(--color-bg)] px-5 py-3 text-center text-xl font-semibold text-[var(--color-ink)] outline-none ring-2 ring-transparent focus:ring-[var(--color-lavender-deep)]"
            aria-label="Name des Vogels"
          />

          <div className="mb-6">
            <p className="mb-2 text-center text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
              Oder einer von hier:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setName(s)}
                  className="rounded-full bg-[var(--color-lavender)]/50 px-3 py-1 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-lavender)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-mint-deep)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
            >
              <Sparkles size={18} strokeWidth={1.8} />
              {name.trim() ? `Hallo, ${name.trim()}!` : "Hallo, Pip!"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
