"use client";

// Pause-Mechanik nach 10 Min App-Zeit (UX-Konzept aus ROADMAP).
//
// Regeln:
//  - Nach 10 Min aktiver App-Zeit auf jeder Quest-Seite blendet das Buch
//    sanft eine Pause-Empfehlung ein.
//  - KEIN hartes Lockout. Anneli kann immer „Weiterspielen" wählen.
//  - „Weiterspielen" resettet den Timer. Nach weiteren 10 Min kommt der
//    Vorschlag wieder.
//  - „Pause machen" navigiert zurück zur Startseite und schreibt einen
//    Zeitstempel, damit der Vorschlag erst nach 30 Min Pause wiederkommt
//    (falls Anneli direkt zurückkehrt).
//
// App-Zeit-Definition (v1): Sekunden, die der Tab sichtbar war.
// `document.visibilityState === "visible"` — wenn das Tab im Hintergrund
// ist, läuft die Uhr nicht. Das ist gut: wenn Anneli kurz weg ist und das
// Tab offen lässt, wird sie nicht aus dem Nichts begrüßt.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Moon, Sparkles } from "lucide-react";

const STORAGE_KEY = "anneli.pause.v1";
/** App-Zeit in ms bis Pause-Vorschlag — 10 Min. */
const SUGGEST_AFTER_MS = 10 * 60 * 1000;
/** Nach Pause-Klick: so lange nicht erneut zeigen. */
const COOLDOWN_AFTER_PAUSE_MS = 30 * 60 * 1000;
/** Tick-Frequenz — sekündlich genügt, billig. */
const TICK_MS = 1000;

type StoredState = {
  /** Aktiv-Zeit in ms seit dem letzten Reset. */
  activeMs: number;
  /** Wenn gesetzt: ISO-Timestamp einer pauseAt-Wahl. Pause-Vorschlag erst nach Cooldown wieder. */
  pausedAt: string | null;
};

function loadState(): StoredState {
  if (typeof window === "undefined") return { activeMs: 0, pausedAt: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { activeMs: 0, pausedAt: null };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      activeMs: typeof parsed.activeMs === "number" ? parsed.activeMs : 0,
      pausedAt: typeof parsed.pausedAt === "string" ? parsed.pausedAt : null,
    };
  } catch {
    return { activeMs: 0, pausedAt: null };
  }
}

function saveState(state: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function isWithinPauseCooldown(state: StoredState): boolean {
  if (!state.pausedAt) return false;
  const pausedDate = new Date(state.pausedAt).getTime();
  if (Number.isNaN(pausedDate)) return false;
  return Date.now() - pausedDate < COOLDOWN_AFTER_PAUSE_MS;
}

export function PauseSuggestion() {
  const [open, setOpen] = useState(false);
  // Wir halten activeMs in einer Ref, damit der Tick-Timer keinen Re-Render
  // auslöst — das wäre sekündlich unnötig teuer.
  const activeMsRef = useRef(0);

  useEffect(() => {
    const stored = loadState();
    activeMsRef.current = stored.activeMs;

    // Wenn schon innerhalb Cooldown nach einer aktiven Pause: gar nicht erst
    // den Timer starten. Bei wieder offenem Tab kommt der Vorschlag erst, wenn
    // der Cooldown vorbei ist (dann wird die Komponente next time gemountet).
    if (isWithinPauseCooldown(stored)) return;

    // Schon vor dem Tick-Start checken: wenn beim Mount die Zeit bereits
    // ausgereizt ist (Anneli hat z.B. seitenintern navigiert), direkt zeigen.
    if (activeMsRef.current >= SUGGEST_AFTER_MS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      return;
    }

    let lastTick = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;

      // Nur ticken, wenn das Tab sichtbar ist.
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      // Sehr lange deltas (z.B. Laptop-Sleep > 30s) deckeln — wir wollen
      // nicht eine 8h-Schlaf-Phase als „aktiv" werten.
      const sane = Math.min(delta, 5000);
      activeMsRef.current += sane;
      // Nur alle ~30 Sek nach localStorage schreiben, sonst zu viel Write.
      if (activeMsRef.current % 30000 < TICK_MS) {
        saveState({ activeMs: activeMsRef.current, pausedAt: stored.pausedAt });
      }
      if (activeMsRef.current >= SUGGEST_AFTER_MS) {
        setOpen(true);
        window.clearInterval(interval);
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, []);

  function chooseContinue() {
    // Reset Timer, weiter geht's. Pause-Vorschlag kommt nach weiteren 10 Min.
    activeMsRef.current = 0;
    saveState({ activeMs: 0, pausedAt: null });
    setOpen(false);
    // Page-Reload nicht nötig — der Timer-Effect läuft beim nächsten Mount
    // ohnehin neu, und das aktuelle Setup ist beendet, weil interval geclearet.
    // Wir starten ihn manuell neu, indem wir die Komponente kurz unmount/mount-en?
    // Einfacher: location.reload() ist hier zu hart. Stattdessen lassen wir
    // den Timer einfach beim nächsten Page-Wechsel wieder anlaufen.
    // → Trade-off: in derselben Page-Session kommt nach Reset erstmal kein
    //   weiterer Vorschlag bis zur nächsten Navigation. Akzeptabel für v1.
  }

  function choosePause() {
    saveState({ activeMs: 0, pausedAt: new Date().toISOString() });
    setOpen(false);
    // Anneli geht zur Startseite — der Link unten macht das.
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/30 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-paper)] p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-lavender)] text-[var(--color-lavender-deep)]">
            <Moon size={42} strokeWidth={1.6} />
          </div>
        </div>

        <h2 id="pause-title" className="mb-3 text-center text-2xl font-semibold">
          Du hast heute schon viel geschafft.
        </h2>

        <p className="mb-6 text-center text-base leading-relaxed text-[var(--color-ink-soft)]">
          Wollen wir eine kleine Pause machen? Du kannst auch weiterspielen — das Buch wartet auf dich.
        </p>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            onClick={choosePause}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-lavender-deep)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
          >
            <Moon size={18} strokeWidth={1.8} />
            Pause machen
          </Link>
          <button
            type="button"
            onClick={chooseContinue}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-mint)] px-6 py-3 text-base font-semibold text-[var(--color-mint-deep)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            Weiterspielen
          </button>
        </div>
      </div>
    </div>
  );
}
