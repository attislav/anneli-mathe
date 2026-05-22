"use client";

import { useEffect, useState } from "react";
import type { InputProps } from "./types";

/**
 * Vergleichs-Symbol-Input (Brücke 4 / compare100).
 *
 * Mechanik:
 *  - Anneli sieht zwei Zahlen mit einem Lücken-Slot dazwischen ("47 ◯ 42").
 *  - Sie tippt eines der drei Symbole an: <, =, >. Symbol "wandert" in die
 *    Lücke (kleine Move-Animation), dann onSubmit.
 *  - Auf Touch/Tablet pures Tap-to-Select — kein „echtes" Drag, weil das
 *    auf Mobile weniger zuverlässig ist.
 *
 * Mapping (siehe `compare100.ts`):
 *    < → -1
 *    = →  0
 *    > →  1
 *
 * `exercise.correctAnswer` ist bereits in diesem Symbol-Code.
 */
export function CompareSymbolInput({ exercise, status, onSubmit, disabled }: InputProps) {
  const visual = exercise.visual;

  const [selected, setSelected] = useState<-1 | 0 | 1 | null>(null);

  // Reset bei neuer Aufgabe oder retry.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(null);
  }, [exercise.id, status]);

  if (visual?.kind !== "compare") {
    return (
      <p className="text-center text-sm text-[var(--color-ink-soft)]">
        Diese Aufgabe hat keine Vergleichs-Daten.
      </p>
    );
  }
  const { left, right } = visual;

  const isDisabled = disabled || status === "step-success";

  function choose(sym: -1 | 0 | 1) {
    if (isDisabled) return;
    setSelected(sym);
    // Kleine Verzögerung, damit die Animation sichtbar ist.
    window.setTimeout(() => onSubmit(sym), 250);
  }

  return (
    <div className="space-y-8">
      {/* Vergleichs-Anzeige: Zahl — Slot — Zahl */}
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        <NumberPlate value={left} />
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-lavender-deep)]/40 bg-[var(--color-paper)] text-5xl font-bold text-[var(--color-lavender-deep)] shadow-inner transition-all duration-300 sm:h-24 sm:w-24"
          aria-live="polite"
          aria-label={selected !== null ? `Ausgewähltes Zeichen: ${symbolText(selected)}` : "Leerer Symbol-Platz"}
        >
          {selected !== null ? (
            <span className="animate-symbol-pop">{symbolText(selected)}</span>
          ) : (
            <span className="text-[var(--color-ink-soft)]/40">?</span>
          )}
        </div>
        <NumberPlate value={right} />
      </div>

      {/* Symbol-Auswahl */}
      <div className="space-y-3">
        <p className="text-center text-sm font-medium text-[var(--color-ink-soft)]">
          Welches Zeichen passt dazwischen?
        </p>
        <div className="mx-auto flex justify-center gap-4">
          {([-1, 0, 1] as const).map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => choose(sym)}
              disabled={isDisabled}
              aria-label={`Zeichen ${symbolText(sym)} (${symbolName(sym)})`}
              aria-pressed={selected === sym}
              className={
                "h-20 w-20 rounded-3xl text-5xl font-bold shadow-[var(--shadow-soft)] transition-transform sm:h-24 sm:w-24 " +
                (selected === sym
                  ? "scale-95 bg-[var(--color-mint-deep)] text-white"
                  : "bg-[var(--color-lavender-deep)] text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100")
              }
            >
              {symbolText(sym)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumberPlate({ value }: { value: number }) {
  return (
    <div className="flex h-20 min-w-20 items-center justify-center rounded-2xl bg-[var(--color-mint)] px-5 text-4xl font-bold tabular-nums text-[var(--color-ink)] shadow-[var(--shadow-soft)] sm:h-24 sm:min-w-24 sm:text-5xl">
      {value}
    </div>
  );
}

function symbolText(sym: -1 | 0 | 1): string {
  if (sym === -1) return "<";
  if (sym === 0) return "=";
  return ">";
}

function symbolName(sym: -1 | 0 | 1): string {
  if (sym === -1) return "kleiner";
  if (sym === 0) return "gleich";
  return "größer";
}
