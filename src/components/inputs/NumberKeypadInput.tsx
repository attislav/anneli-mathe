"use client";

import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import type { InputProps } from "./types";

/**
 * On-Screen-Zahlentastatur — der „Ich-kann-Zahlen-tippen"-Stolz-Modus.
 * Wird für Brücke 2 (addition20 — Speech ist auf Static-Export blockiert)
 * und Brücke 3 (subtraction20) verwendet.
 *
 * Layout:
 *   7 8 9
 *   4 5 6
 *   1 2 3
 *   ← 0  Brücke prüfen
 *
 * Max-Länge 2 Zeichen, weil im Hunderterraum max. 2-stellige Antworten
 * sinnvoll sind (compare ist eigener Modus).
 */
export function NumberKeypadInput({ exercise, status, onSubmit, disabled }: InputProps) {
  const [value, setValue] = useState("");

  // Reset bei neuer Aufgabe oder retry.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue("");
  }, [exercise.id, status]);

  const isDisabled = disabled || status === "step-success";

  function tapDigit(d: string) {
    if (isDisabled) return;
    setValue((prev) => {
      if (prev.length >= 2) return prev;
      // Kein führender Zweistelliger Eintrag mit "0".
      if (prev === "0") return d;
      return prev + d;
    });
  }

  function tapDelete() {
    if (isDisabled) return;
    setValue((prev) => prev.slice(0, -1));
  }

  function tapSubmit() {
    if (isDisabled) return;
    if (value.length === 0) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    onSubmit(parsed);
  }

  return (
    <div className="space-y-5">
      {/* Display der eingetippten Zahl */}
      <div
        className="mx-auto flex h-20 w-32 items-center justify-center rounded-2xl bg-[var(--color-paper)] text-5xl font-bold tabular-nums text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Eingabe: ${value || "leer"}`}
      >
        {value || <span className="text-[var(--color-ink-soft)]/40">—</span>}
      </div>

      {/* Keypad */}
      <div className="mx-auto grid w-fit grid-cols-3 gap-2.5">
        {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => tapDigit(d)}
            disabled={isDisabled}
            className="h-16 w-16 rounded-2xl bg-[var(--color-paper)] text-3xl font-bold text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 sm:h-20 sm:w-20"
            aria-label={`Ziffer ${d}`}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={tapDelete}
          disabled={isDisabled || value.length === 0}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-peach)] text-[var(--color-peach-deep)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 sm:h-20 sm:w-20"
          aria-label="Zurück (eine Ziffer löschen)"
        >
          <Delete size={26} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => tapDigit("0")}
          disabled={isDisabled}
          className="h-16 w-16 rounded-2xl bg-[var(--color-paper)] text-3xl font-bold text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 sm:h-20 sm:w-20"
          aria-label="Ziffer 0"
        >
          0
        </button>
        <button
          type="button"
          onClick={tapSubmit}
          disabled={isDisabled || value.length === 0}
          className="h-16 w-16 rounded-2xl bg-[var(--color-mint-deep)] text-2xl font-bold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 sm:h-20 sm:w-20"
          aria-label="Antwort abschicken"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
