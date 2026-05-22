"use client";

import { useEffect, useState } from "react";
import type { InputProps } from "./types";

/**
 * Zahlenstrahl-Tap-Input (Brücke 5 / tensNeighbors).
 *
 * Anneli sieht einen Ausschnitt des Zahlenstrahls (z.B. 35–55) mit allen
 * Zehnermarken sichtbar. Die aktuelle Zahl (z.B. 47) ist als Vogel-Marker
 * darüber visualisiert. Sie tippt auf den richtigen Zehner.
 *
 * `exercise.visual` mit kind="number-line" liefert `from`, `to`, `markers`.
 * Die `current value` lesen wir aus dem Prompt: der prompt enthält die Zahl
 * (z.B. "Welcher Zehner kommt direkt nach 47?"). Sauberer wäre, im Generator
 * ein eigenes Feld `valueInPrompt` zu setzen — aber als pragmatische
 * Lösung extrahieren wir die Zahl per Regex aus dem Prompt.
 */
export function NumberLineInput({ exercise, status, onSubmit, disabled }: InputProps) {
  const visual = exercise.visual;
  const hasLineVisual = visual?.kind === "number-line";
  // `markers` ist im Visual mitgegeben (= die beiden Nachbar-Zehner), wir
  // nutzen sie aktuell nicht — alle Zehner sehen gleich aus, damit Anneli
  // die Auswahl treffen muss. Bleibt für späteres Hint-System verfügbar.
  const from = hasLineVisual ? visual.from : 0;
  const to = hasLineVisual ? visual.to : 100;

  // Aktuelle Zahl aus Prompt extrahieren (erste Zahl).
  const promptValueMatch = exercise.prompt.match(/\d+/);
  const promptValue = promptValueMatch ? Number(promptValueMatch[0]) : Math.floor((from + to) / 2);

  // Alle Zehner im Range (alle Vielfachen von 10 zwischen from und to).
  const tenMarks: number[] = [];
  for (let n = Math.ceil(from / 10) * 10; n <= to; n += 10) tenMarks.push(n);

  const [selected, setSelected] = useState<number | null>(null);

  // Reset bei neuer Aufgabe oder retry.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(null);
  }, [exercise.id, status]);

  if (!hasLineVisual) {
    return (
      <p className="text-center text-sm text-[var(--color-ink-soft)]">
        Diese Aufgabe hat keinen Zahlenstrahl.
      </p>
    );
  }

  const isDisabled = disabled || status === "step-success";

  function choose(n: number) {
    if (isDisabled) return;
    setSelected(n);
    window.setTimeout(() => onSubmit(n), 250);
  }

  // Position einer Zahl als Prozent der Strecke (from..to).
  function pct(n: number): number {
    if (to === from) return 50;
    return ((n - from) / (to - from)) * 100;
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm font-medium text-[var(--color-ink-soft)]">
        Tippe auf der Brücke den richtigen Zehner an.
      </p>

      {/* Zahlenstrahl-Container */}
      <div className="relative mx-auto h-32 w-full max-w-md select-none">
        {/* Vogel-Marker für die aktuelle Zahl — sitzt darüber */}
        <div
          className="absolute -top-1 z-10 -translate-x-1/2 transition-all duration-200"
          style={{ left: `${pct(promptValue)}%` }}
          aria-hidden
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl leading-none">🐦</span>
            <div className="mt-1 rounded-md bg-[var(--color-peach)] px-2 py-0.5 text-sm font-bold tabular-nums text-[var(--color-ink)] shadow-sm">
              {promptValue}
            </div>
            <div className="h-1 w-0.5 bg-[var(--color-peach-deep)]" />
          </div>
        </div>

        {/* Strahl-Linie */}
        <div className="absolute left-0 right-0 top-20 h-1 rounded-full bg-[var(--color-lavender-deep)]/40" />

        {/* Tick-Punkte (jede ganze Zahl, dezent) */}
        <div className="absolute left-0 right-0 top-[78px]">
          {Array.from({ length: to - from + 1 }, (_, i) => {
            const n = from + i;
            const isTen = n % 10 === 0;
            if (isTen) return null;
            return (
              <span
                key={`tick-${n}`}
                aria-hidden
                className="absolute h-2 w-px -translate-x-1/2 bg-[var(--color-ink-soft)]/30"
                style={{ left: `${pct(n)}%` }}
              />
            );
          })}
        </div>

        {/* Zehner-Marker — die Tap-Targets. Alle Zehner sehen gleich aus,
            damit Anneli den richtigen WÄHLEN muss, nicht nur den
            hervorgehobenen tippt. `markers` aus dem Generator nutzen wir
            absichtlich NICHT für visuelles Highlight — wir merken sie uns
            für späteres Tracking. */}
        {tenMarks.map((n) => {
          const isSelected = selected === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => choose(n)}
              disabled={isDisabled}
              aria-label={`Zehner ${n}`}
              aria-pressed={isSelected}
              style={{ left: `${pct(n)}%` }}
              className={
                "absolute top-16 z-20 flex h-14 w-14 -translate-x-1/2 flex-col items-center justify-center rounded-2xl text-base font-bold tabular-nums shadow-[var(--shadow-soft)] transition-transform " +
                (isSelected
                  ? "scale-110 bg-[var(--color-mint-deep)] text-white"
                  : "bg-[var(--color-lavender-deep)] text-white hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100")
              }
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
