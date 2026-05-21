"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Bridge } from "@/data/bridges";
import { audioSrc } from "@/data/narration";
import { MathInput } from "./MathInput";
import { AudioButton } from "./AudioButton";

type Status = "asking" | "wrong" | "correct";

const WRONG_QUIPS = [
  { text: "Oh, hoppla! Knapp daneben. Probier nochmal.", audio: "quip-wrong-1" },
  { text: "Beinahe! Die Brücke wackelt nur — sie hält noch.", audio: "quip-wrong-2" },
  { text: "Hmmm. Lass uns das nochmal zusammen anschauen.", audio: "quip-wrong-3" },
  { text: "Fast! Atme einmal tief durch und versuch's nochmal.", audio: "quip-wrong-4" },
];

const SUCCESS_QUIPS = [
  { text: "Die Brücke hält! Du hast sie repariert.", audio: "quip-success-1" },
  { text: "Genau richtig. Schau, wie sie sich aufrichtet.", audio: "quip-success-2" },
];

// PLACEHOLDER — eine einzige Stub-Aufgabe pro Brücke.
// Wird im nächsten Schritt durch echte Aufgaben-Generation pro Skill ersetzt.
// Niveau: Übergang Klasse 1 → Klasse 2.
const PLACEHOLDER_TASKS: Record<string, { prompt: string; answer: number }> = {
  steinzaehl: { prompt: "🪨🪨🪨🪨🪨 🪨🪨🪨🪨🪨 🪨🪨🪨🪨🪨 🪨🪨 — wie viele?", answer: 17 },
  holzplanken: { prompt: "8 + 7 = ?", answer: 15 },
  bruechig: { prompt: "15 − 8 = ?", answer: 7 },
  waage: { prompt: "Welche Zahl ist größer: 47 oder 74?", answer: 74 },
  nachbarn: { prompt: "Welcher Zehner kommt direkt nach 47?", answer: 50 },
  zehner: { prompt: "Das Doppelte von 27 ist?", answer: 54 },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function BridgeChallenge({ bridge }: { bridge: Bridge }) {
  const task = PLACEHOLDER_TASKS[bridge.id] ?? { prompt: "?", answer: 0 };
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [wrongQuip, setWrongQuip] = useState<typeof WRONG_QUIPS[number] | null>(null);
  const [successQuip, setSuccessQuip] = useState<typeof SUCCESS_QUIPS[number] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-play the quip when wrong / correct is freshly set.
  useEffect(() => {
    if (status === "wrong" && wrongQuip) {
      new Audio(audioSrc(wrongQuip.audio)).play().catch(() => {});
    }
    if (status === "correct" && successQuip) {
      new Audio(audioSrc(successQuip.audio)).play().catch(() => {});
    }
  }, [status, wrongQuip, successQuip]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;

    if (parsed === task.answer) {
      setSuccessQuip(pickRandom(SUCCESS_QUIPS));
      setStatus("correct");
    } else {
      setWrongQuip(pickRandom(WRONG_QUIPS));
      setStatus("wrong");
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
      <p className="mb-6 text-[var(--color-ink-soft)]">{bridge.description}</p>

      <div className="mb-8 flex items-start gap-3 rounded-2xl bg-[var(--color-lavender)]/40 px-5 py-4">
        <div className="flex-1 text-base italic leading-relaxed text-[var(--color-ink)]">
          „{bridge.bookHint}"
        </div>
        <AudioButton src={audioSrc(`bridge-${bridge.id}-hint`)} label="Tipp vorlesen" />
      </div>

      {status === "correct" && successQuip ? (
        <div className="rounded-[var(--radius-card)] bg-[var(--color-mint)] p-8 text-center shadow-[var(--shadow-soft)]">
          <Sparkles
            className="mx-auto mb-3 text-[var(--color-mint-deep)]"
            size={42}
            strokeWidth={1.6}
          />
          <div className="mb-6 flex items-center justify-center gap-3">
            <p className="text-lg font-semibold text-[var(--color-mint-deep)]">
              {successQuip.text}
            </p>
            <AudioButton src={audioSrc(successQuip.audio)} variant="primary" />
          </div>
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

          {status === "wrong" && wrongQuip ? (
            <div className="mb-6 flex items-center justify-center gap-3 text-base text-[var(--color-accent-rose)]">
              <p>{wrongQuip.text}</p>
              <AudioButton src={audioSrc(wrongQuip.audio)} />
            </div>
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
