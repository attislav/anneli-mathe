"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Bridge } from "@/data/bridges";
import { MathInput } from "./MathInput";

type Status = "asking" | "wrong" | "correct";

const WRONG_QUIPS = [
  "Oh, hoppla! Knapp daneben. Probier nochmal.",
  "Beinahe! Die Brücke wackelt nur — sie hält noch.",
  "Hmmm. Lass uns das nochmal zusammen anschauen.",
  "Fast! Atme einmal tief durch und versuch's nochmal.",
];

// PLACEHOLDER — eine einzige Stub-Aufgabe pro Brücke.
// Wird im nächsten Schritt durch echte Aufgaben-Generation pro Skill ersetzt.
const PLACEHOLDER_TASKS: Record<string, { prompt: string; answer: number }> = {
  steinzaehl: { prompt: "Wie viele Steine sind das? 🪨🪨🪨🪨", answer: 4 },
  holzplanken: { prompt: "3 + 4 = ?", answer: 7 },
  bruechig: { prompt: "9 − 4 = ?", answer: 5 },
  waage: { prompt: "Tippe die größere Zahl: 6 oder 8?", answer: 8 },
  nachbarn: { prompt: "Welche Zahl kommt vor der 8?", answer: 7 },
  zehner: { prompt: "7 + ? = 10", answer: 3 },
};

export function BridgeChallenge({ bridge }: { bridge: Bridge }) {
  const task = PLACEHOLDER_TASKS[bridge.id] ?? { prompt: "?", answer: 0 };
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [quipIndex, setQuipIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;

    if (parsed === task.answer) {
      setStatus("correct");
    } else {
      setStatus("wrong");
      setQuipIndex((i) => (i + 1) % WRONG_QUIPS.length);
      setValue("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href="/quest/sky-kingdom"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} />
        Zurück zur Karte
      </Link>

      <div className="mb-2 inline-flex items-center justify-center rounded-full bg-[var(--color-mint)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mint-deep)]">
        Brücke {bridge.order} · {bridge.skillLabel}
      </div>
      <h1 className="mb-2 text-3xl font-semibold md:text-4xl">{bridge.name}</h1>
      <p className="mb-10 text-[var(--color-ink-soft)]">{bridge.description}</p>

      {status === "correct" ? (
        <div className="rounded-[var(--radius-card)] bg-[var(--color-mint)] p-8 text-center shadow-[var(--shadow-soft)]">
          <Sparkles
            className="mx-auto mb-3 text-[var(--color-mint-deep)]"
            size={42}
            strokeWidth={1.6}
          />
          <p className="mb-6 text-lg font-semibold text-[var(--color-mint-deep)]">
            Die Brücke hält! Du hast sie repariert.
          </p>
          <Link
            href="/quest/sky-kingdom"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-mint-deep)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
          >
            Weiter zur Karte →
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-[var(--radius-card)] bg-[var(--color-paper)] p-8 shadow-[var(--shadow-soft)]"
        >
          <p className="mb-6 text-center text-2xl font-medium">{task.prompt}</p>

          <div className="mb-6 flex justify-center">
            <MathInput
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              aria-label="Deine Antwort"
            />
          </div>

          {status === "wrong" ? (
            <p className="mb-6 text-center text-base text-[var(--color-accent-rose)]">
              {WRONG_QUIPS[quipIndex]}
            </p>
          ) : null}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={value.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-lavender-deep)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              Brücke prüfen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
