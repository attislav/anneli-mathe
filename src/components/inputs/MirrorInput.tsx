"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { InputProps } from "./types";

/**
 * Spiegel-Input (Brücke 6 / doubleHalf).
 *
 * Mechanik:
 *  - Links sieht Anneli die Original-Menge (z.B. 7 Federn bei „Doppelte von 7?").
 *  - Rechts ist eine Spiegel-Seite — leer. Anneli legt dort mit „+"/„−"-Tap
 *    Federn drauf, bis es passt. Counter zeigt die aktuelle Spiegel-Menge.
 *  - Wenn sie meint, sie hat's richtig, tippt sie „Brücke prüfen".
 *
 * Modus aus `exercise.visual` (kind="mirror"):
 *   - `mode: "double"` → links steht `value`, rechts braucht 2*value.
 *   - `mode: "half"`   → links steht `value`, rechts braucht value/2.
 *
 * Pädagogik: dadurch dass Anneli die Federn AKTIV legt, fühlt sie die
 * Verdopplung/Halbierung — kein abstraktes Tippen einer Zahl.
 */
export function MirrorInput({ exercise, status, onSubmit, disabled }: InputProps) {
  const visual = exercise.visual;
  const hasMirrorVisual = visual?.kind === "mirror";
  // Sichere Default-Werte für Hook-Stabilität, falls Visual fehlt.
  const value = hasMirrorVisual ? visual.value : 0;
  const mode = hasMirrorVisual ? visual.mode : "double";

  const [mirrorCount, setMirrorCount] = useState(0);

  // Reset bei neuer Aufgabe oder retry.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMirrorCount(0);
  }, [exercise.id, status]);

  // Wie soll der „Original"-Stapel dargestellt werden?
  // Für value > ~24 (kommt bei hard-double vor) wechseln wir auf
  // Stapel + Zahl, sonst lego-artig.
  const showAsLego = value <= 24;

  // Pro Reihe max 5 Federn — schön übersichtlich (Fünfer-Strukturierung).
  const originalRows = useMemo(() => chunkInto(value, 5), [value]);
  // Mirror analog — aber MAX-Reihen für Performance.
  const mirrorRows = useMemo(() => chunkInto(Math.min(mirrorCount, 50), 5), [mirrorCount]);

  if (!hasMirrorVisual) {
    return (
      <p className="text-center text-sm text-[var(--color-ink-soft)]">
        Diese Aufgabe hat keine Spiegel-Daten.
      </p>
    );
  }

  const isDisabled = disabled || status === "step-success";

  function add() {
    if (isDisabled) return;
    // Cap bei einem sinnvollen Maximum, damit die Anzeige nicht explodiert.
    setMirrorCount((c) => Math.min(c + 1, 100));
  }
  function remove() {
    if (isDisabled) return;
    setMirrorCount((c) => Math.max(0, c - 1));
  }

  function submit() {
    if (isDisabled) return;
    onSubmit(mirrorCount);
  }

  return (
    <div className="space-y-6">
      {/* Spiegel-Anzeige: links Original, rechts Spiegel */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* LINKS: Original */}
        <div className="rounded-2xl bg-[var(--color-mint)]/40 p-4 shadow-inner">
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-mint-deep)]">
            Anneli&apos;s Seite
          </div>
          <div className="flex min-h-32 flex-col items-center justify-center gap-1">
            {showAsLego ? (
              <FeatherStack rows={originalRows} />
            ) : (
              <div className="text-5xl font-bold tabular-nums text-[var(--color-ink)]">
                {value}
              </div>
            )}
            <div className="mt-2 text-xs text-[var(--color-ink-soft)]">
              {value} Federn
            </div>
          </div>
        </div>

        {/* RECHTS: Spiegel — wird befüllt */}
        <div className="rounded-2xl border-2 border-dashed border-[var(--color-lavender-deep)]/50 bg-[var(--color-lavender)]/20 p-4">
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-lavender-deep)]">
            Spiegel-Seite
          </div>
          <div className="flex min-h-32 flex-col items-center justify-center gap-1">
            {mirrorCount === 0 ? (
              <span className="text-sm text-[var(--color-ink-soft)]/60">
                Leer — tippe + zum Hinzufügen.
              </span>
            ) : (
              <FeatherStack rows={mirrorRows} />
            )}
            <div className="mt-2 text-xs text-[var(--color-ink-soft)]">
              <span className="font-bold tabular-nums text-[var(--color-ink)]">
                {mirrorCount}
              </span>{" "}
              Federn
            </div>
          </div>
        </div>
      </div>

      {/* Zähler-Controls.
          Bei großen Doppelt-Werten (>20) wäre 98-mal "+" unzumutbar — wir
          bieten zusätzlich +5/+10 Schnell-Tasten. Sie werden nur sichtbar,
          wenn der Original-Wert das auch nötig macht. */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={remove}
          disabled={isDisabled || mirrorCount === 0}
          aria-label="Eine Feder weniger"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-peach)] text-[var(--color-peach-deep)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Minus size={28} strokeWidth={2.2} />
        </button>
        <div
          className="flex h-14 min-w-24 items-center justify-center rounded-2xl bg-[var(--color-paper)] px-4 text-3xl font-bold tabular-nums text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
          aria-live="polite"
          aria-label={`Spiegel-Seite hat ${mirrorCount} Federn`}
        >
          {mirrorCount}
        </div>
        <button
          type="button"
          onClick={add}
          disabled={isDisabled}
          aria-label="Eine Feder mehr"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-mint)] text-[var(--color-mint-deep)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Plus size={28} strokeWidth={2.2} />
        </button>
      </div>

      {showFastButtons(mode, value) ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              !isDisabled && setMirrorCount((c) => Math.max(0, c - 5))
            }
            disabled={isDisabled || mirrorCount === 0}
            aria-label="Fünf Federn weniger"
            className="rounded-xl bg-[var(--color-peach)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--color-peach-deep)] shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            −5
          </button>
          <button
            type="button"
            onClick={() =>
              !isDisabled && setMirrorCount((c) => Math.min(100, c + 5))
            }
            disabled={isDisabled}
            aria-label="Fünf Federn mehr"
            className="rounded-xl bg-[var(--color-mint)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--color-mint-deep)] shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            +5
          </button>
          <button
            type="button"
            onClick={() =>
              !isDisabled && setMirrorCount((c) => Math.min(100, c + 10))
            }
            disabled={isDisabled}
            aria-label="Zehn Federn mehr"
            className="rounded-xl bg-[var(--color-mint)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--color-mint-deep)] shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            +10
          </button>
        </div>
      ) : null}

      {/* Submit */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={submit}
          disabled={isDisabled || mirrorCount === 0}
          className="rounded-full bg-[var(--color-lavender-deep)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {mode === "double" ? "So viele sind es doppelt!" : "So viel ist die Hälfte!"}
        </button>
      </div>
    </div>
  );
}

/** Schnell-Tasten nur, wenn die Ziel-Menge groß ist. */
function showFastButtons(mode: "double" | "half", value: number): boolean {
  const target = mode === "double" ? value * 2 : value / 2;
  return target > 20;
}

/** Schneidet die Anzahl `n` in Reihen à `rowSize` Federn. */
function chunkInto(n: number, rowSize: number): number[] {
  if (n <= 0) return [];
  const out: number[] = [];
  let left = n;
  while (left > 0) {
    const take = Math.min(rowSize, left);
    out.push(take);
    left -= take;
  }
  return out;
}

/** Visualisiert Federn in Reihen à max. 5 — fünferstrukturiert. */
function FeatherStack({ rows }: { rows: number[] }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {rows.map((count, i) => (
        <div key={i} className="flex gap-0.5">
          {Array.from({ length: count }, (_, j) => (
            <span key={j} className="text-xl leading-none" aria-hidden>
              🪶
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
