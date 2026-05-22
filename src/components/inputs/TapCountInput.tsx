"use client";

import { useEffect, useMemo, useState } from "react";
import type { InputProps } from "./types";

// Glyphen analog `counting20.ts` — wir lesen sie aus dem Visual.
// Wenn der Generator später ein eigenes Glyph mitschickt, nutzen wir das.
const DEFAULT_GLYPH = "🪨";

/**
 * Tap-zähle-mit Input (Brücke 1 / counting20).
 *
 * Mechanik:
 *  1. Steine erscheinen in Gruppen (aus `exercise.visual` mit kind="stones").
 *  2. Anneli tippt jeden Stein an — angetippte werden farbig markiert,
 *     der Counter oben zählt mit hoch.
 *  3. Sobald sie meint, sie ist fertig (oder einfach: nach Lust und Laune),
 *     wählt sie eine der 4 Number-Buttons unten ("Meine Zahl ist…").
 *  4. Auswahl = `onSubmit(zahl)`.
 *
 * Pädagogik:
 *  - Der Counter ist nur ein HELFER, nicht die Antwort. Die Antwort kommt
 *    aus den Buttons — Anneli muss aktiv "wählen". Das verhindert, dass sie
 *    nur durchtippt ohne nachzudenken.
 *  - Bei "retry" werden Tap-States resettet, damit sie noch mal zählen kann.
 *  - Die 4 Buttons enthalten: korrekte Zahl + 3 Distraktoren in der Nähe.
 *  - Distraktoren sind nie negativ und nie über 25 — typische Off-by-One-/
 *    Fünferbündel-Fehler.
 */
export function TapCountInput({ exercise, status, onSubmit, disabled }: InputProps) {
  const visual = exercise.visual;
  const groups: number[] = visual?.kind === "stones" ? visual.groups : fallbackGroups(exercise.correctAnswer);
  const total = groups.reduce((s, n) => s + n, 0);

  const [tapped, setTapped] = useState<Set<string>>(new Set());

  // Reset bei neuer Aufgabe oder retry.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTapped(new Set());
  }, [exercise.id, status]);

  function toggleTap(key: string) {
    if (disabled || status === "step-success") return;
    setTapped((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Antwort-Optionen: korrekte Zahl + 3 plausible Distraktoren.
  // `exercise.id` ist hier nur als Cache-Buster gewünscht — die Optionen
  // sollen pro Aufgabe stabil bleiben, sich aber bei neuer Aufgabe neu mischen.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => buildOptions(exercise.correctAnswer), [exercise.id]);

  return (
    <div className="space-y-6">
      {/* Counter-Anzeige */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
          Schon angetippt:
        </span>
        <span
          className="rounded-full bg-[var(--color-lavender)]/60 px-4 py-1 text-xl font-bold tabular-nums text-[var(--color-ink)]"
          aria-live="polite"
          aria-atomic="true"
        >
          {tapped.size}
        </span>
      </div>

      {/* Stein-Gruppen — tap-bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        {groups.map((count, gi) => (
          <div key={`g-${gi}`} className="flex items-center gap-1.5">
            {Array.from({ length: count }, (_, si) => {
              const key = `${exercise.id}-${gi}-${si}`;
              const isTapped = tapped.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleTap(key)}
                  aria-label={isTapped ? `Stein angetippt` : `Stein antippen`}
                  aria-pressed={isTapped}
                  disabled={disabled || status === "step-success"}
                  className={
                    "flex h-12 w-12 items-center justify-center rounded-2xl text-3xl transition-all duration-150 select-none " +
                    (isTapped
                      ? "scale-110 bg-[var(--color-mint)] shadow-[var(--shadow-soft)] ring-2 ring-[var(--color-mint-deep)]"
                      : "bg-[var(--color-paper)] shadow-sm hover:scale-105 hover:bg-[var(--color-peach)]/40 disabled:hover:scale-100")
                  }
                >
                  <span aria-hidden>{DEFAULT_GLYPH}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Auswahl-Buttons */}
      <div className="space-y-3">
        <p className="text-center text-sm font-medium text-[var(--color-ink-soft)]">
          Wie viele sind es?
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSubmit(opt)}
              disabled={disabled || status === "step-success"}
              className="rounded-2xl bg-[var(--color-lavender-deep)] px-5 py-4 text-2xl font-bold tabular-nums text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              aria-label={`Antwort ${opt}`}
            >
              {opt}
            </button>
          ))}
        </div>
        {/* Fußnote — kein Druck, dass alle Steine angetippt sein müssen */}
        <p className="text-center text-xs text-[var(--color-ink-soft)]/80">
          Du musst nicht alle antippen — wähle einfach die Zahl, die passt.
        </p>
      </div>

      {/* Stiller Eintrag fürs Tooling/Aria — exakte erwartete Antwort
          ist nicht ablesbar, aber wir geben einen barrierearmen Hinweis. */}
      <span className="sr-only">
        {total} Objekte sind insgesamt zu sehen, aufgeteilt in {groups.length} Gruppen.
      </span>
    </div>
  );
}

/** Fallback, falls visual fehlt — eine Gruppe mit n Steinen. */
function fallbackGroups(total: number): number[] {
  if (total <= 5) return [total];
  if (total <= 10) return [5, total - 5];
  if (total <= 15) return [5, 5, total - 10];
  return [5, 5, 5, total - 15];
}

/**
 * Baut 4 Antwort-Optionen: korrekte Zahl + 3 plausible Distraktoren.
 * Distraktoren sind ±1, ±2, ±3, ±5 (typische Off-by-One-/Fünferbündel-Fehler),
 * werden gefiltert auf >= 1 und <= 25 (counting20-Range).
 */
function buildOptions(correct: number): number[] {
  const candidates = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 5, correct - 5, correct + 3, correct - 3];
  const seen = new Set<number>([correct]);
  const picks: number[] = [];
  for (const c of candidates) {
    if (c < 1 || c > 25) continue;
    if (seen.has(c)) continue;
    seen.add(c);
    picks.push(c);
    if (picks.length >= 3) break;
  }
  // Auffüllen, falls Range eng war (selten).
  let bump = 1;
  while (picks.length < 3) {
    const c = correct + bump;
    if (c <= 25 && !seen.has(c)) {
      seen.add(c);
      picks.push(c);
    }
    bump = bump > 0 ? -bump : -bump + 1;
    if (bump > 10) break;
  }
  const all = [correct, ...picks];
  // Mischen (deterministisch via correct als Seed-Surrogat — eigentlich nur,
  // damit nicht immer die richtige Lösung an Stelle 0 steht).
  return shuffleStable(all, correct);
}

function shuffleStable<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.abs(s) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
