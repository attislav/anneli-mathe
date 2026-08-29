"use client";

// Zahlentastatur fürs Kopfrechnen.
//
// Warum eine eigene Tastatur statt <input type="number">: Das Training läuft
// auf dem Tablet. Die System-Tastatur schiebt dort die halbe Seite weg und
// zeigt Buchstaben, die hier niemand braucht. Große, gut treffbare Tasten
// halten den Blick auf der Aufgabe.
//
// Die echte Tastatur funktioniert trotzdem: Ziffern, Backspace und Enter
// werden global abgefangen, damit am Laptop flüssig getippt werden kann.

import { useEffect } from "react";
import { Check, Delete } from "lucide-react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  /** Sperrt Eingabe und Tasten (z.B. während der Erfolgs-Animation). */
  disabled?: boolean;
  /** Maximale Stellenzahl — verhindert 12-stellige Zufalls-Eingaben. */
  maxLength?: number;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export function NumberPad({
  value,
  onChange,
  onSubmit,
  disabled = false,
  maxLength = 3,
}: Props) {
  useEffect(() => {
    if (disabled) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        if (value.length >= maxLength) return;
        onChange(value + e.key);
        e.preventDefault();
        return;
      }
      if (e.key === "Backspace") {
        onChange(value.slice(0, -1));
        e.preventDefault();
        return;
      }
      if (e.key === "Enter" && value.length > 0) {
        onSubmit();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [value, onChange, onSubmit, disabled, maxLength]);

  function press(digit: string) {
    if (disabled || value.length >= maxLength) return;
    onChange(value + digit);
  }

  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3">
      {KEYS.map((k) => (
        <PadButton key={k} onClick={() => press(k)} disabled={disabled} label={k}>
          {k}
        </PadButton>
      ))}

      <PadButton
        onClick={() => !disabled && onChange(value.slice(0, -1))}
        disabled={disabled || value.length === 0}
        label="Letzte Ziffer löschen"
        variant="soft"
      >
        <Delete size={24} strokeWidth={1.8} />
      </PadButton>

      <PadButton onClick={() => press("0")} disabled={disabled} label="0">
        0
      </PadButton>

      <PadButton
        onClick={() => !disabled && value.length > 0 && onSubmit()}
        disabled={disabled || value.length === 0}
        label="Antwort prüfen"
        variant="primary"
      >
        <Check size={26} strokeWidth={2.4} />
      </PadButton>
    </div>
  );
}

function PadButton({
  children,
  onClick,
  disabled,
  label,
  variant = "number",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: "number" | "soft" | "primary";
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--color-mint-deep)] text-white"
      : variant === "soft"
        ? "bg-[var(--color-lavender)]/50 text-[var(--color-ink-soft)]"
        : "bg-[var(--color-paper)] text-[var(--color-ink)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-16 items-center justify-center rounded-2xl text-2xl font-semibold tabular-nums shadow-[var(--shadow-soft)] transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${styles}`}
    >
      {children}
    </button>
  );
}
