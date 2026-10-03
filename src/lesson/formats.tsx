"use client";

// Die Aufgaben-Formate. Jedes bekommt seine Aufgabe und meldet über
// `onAnswer(richtig)` zurück. Während Rückmeldung läuft, ist `locked` an.

import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import type { ChoiceTask, CompareTask, InputTask, MoneyBuildTask, NumberLineTask, ShareTask, Task, TensOnesTask, Visual, WallTask } from "@/game/types";
import { PlateArt, TreatIcon } from "@/ui/Bakery";
import { MoneyPiece, MoneyRow } from "@/ui/Money";
import { sfx } from "@/game/sound";
import { Button } from "@/ui/Button";

export type Status = "ask" | "right" | "wrong" | "reveal";

type FormatProps<T extends Task> = { task: T; status: Status; onAnswer: (correct: boolean) => void };

export function TaskView(props: FormatProps<Task>) {
  const { task } = props;
  switch (task.format) {
    case "choice":
      return <ChoiceView {...props} task={task} />;
    case "input":
      return <InputView {...props} task={task} />;
    case "tens-ones":
      return <TensOnesView {...props} task={task} />;
    case "number-line":
      return <NumberLineView {...props} task={task} />;
    case "wall":
      return <WallView {...props} task={task} />;
    case "compare":
      return <CompareView {...props} task={task} />;
    case "money-build":
      return <MoneyBuildView {...props} task={task} />;
    case "share":
      return <ShareView {...props} task={task} />;
  }
}

const card = "rounded-[28px] bg-white shadow-[0_6px_0_#E4E0F5]";

function pickedColors(status: Status): { bg: string; shade: string; fg: string } {
  if (status === "right") return { bg: "#2BB673", shade: "#1E8F57", fg: "#fff" };
  if (status === "wrong" || status === "reveal") return { bg: "#FFB648", shade: "#E08E10", fg: "#fff" };
  return { bg: "#fff", shade: "#DCD6F5", fg: "#1F2347" };
}

// --- Antippen ---------------------------------------------------------------

function ChoiceView({ task, status, onAnswer }: FormatProps<ChoiceTask>) {
  const [picked, setPicked] = useState<string | null>(null);
  const long = task.options.some((o) => o.length > 4);
  return (
    <div className="flex flex-col gap-5">
      {task.visual && <VisualCard visual={task.visual} />}
      {task.term && <div className={`${card} flex min-h-[130px] items-center justify-center px-4 py-6 text-center font-display text-[clamp(2.4rem,11vw,3.8rem)] font-semibold leading-tight`}>{renderTerm(task.term)}</div>}
      <div className={`grid gap-4 ${task.options.length === 2 || long ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"}`}>
        {task.options.map((opt) => {
          const c = opt === picked ? pickedColors(status) : pickedColors("ask");
          const showRight = status === "reveal" && opt === task.answer;
          return (
            <button
              key={opt}
              disabled={status !== "ask"}
              onClick={() => {
                setPicked(opt);
                onAnswer(opt === task.answer);
              }}
              className={`chunky rounded-[26px] font-display font-semibold ${long ? "h-[72px] text-2xl" : "h-[92px] text-[2.6rem]"}`}
              style={{ background: showRight ? "#2BB673" : c.bg, color: showRight ? "#fff" : c.fg, ["--shade" as string]: showRight ? "#1E8F57" : c.shade, ["--depth" as string]: "7px" }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Setzt das „?" im Term farbig ab. */
function renderTerm(term: string, entry?: string) {
  const parts = term.split("?");
  if (parts.length === 1) return <span>{term}</span>;
  // Ein umschließendes span, sonst schluckt der Flex-Container die Leerzeichen um das „?".
  return (
    <span>
      {parts[0]}
      <span className={entry !== undefined ? "mx-1 inline-flex min-w-[1.6em] justify-center rounded-2xl border-4 border-grape px-2 text-grape" : "text-grape"}>{entry !== undefined ? entry || "\u00a0" : "?"}</span>
      {parts[1]}
    </span>
  );
}

// --- Eintippen --------------------------------------------------------------

export function NumPad({ value, onChange, onOk, disabled }: { value: string; onChange: (v: string) => void; onOk: () => void; disabled: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key) && value.length < 3) onChange(value + e.key);
      else if (e.key === "Backspace") onChange(value.slice(0, -1));
      else if (e.key === "Enter" && value) onOk();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, onChange, onOk, disabled]);

  const key = "chunky h-[60px] rounded-[18px] bg-white font-display text-3xl font-semibold text-ink";
  const press = (d: string) => {
    if (disabled || value.length >= 3) return;
    sfx.tap();
    onChange(value + d);
  };
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button key={d} className={key} style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "5px" }} onClick={() => press(d)} disabled={disabled}>
          {d}
        </button>
      ))}
      <button aria-label="Löschen" className={`${key} flex items-center justify-center text-ink-soft`} style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "5px" }} onClick={() => onChange(value.slice(0, -1))} disabled={disabled}>
        <Delete size={30} />
      </button>
      <button className={key} style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "5px" }} onClick={() => press("0")} disabled={disabled}>
        0
      </button>
      <button className="chunky h-[60px] rounded-[18px] bg-grape font-display text-2xl font-semibold text-white disabled:opacity-60" style={{ ["--shade" as string]: "#5A2FE0", ["--depth" as string]: "5px" }} onClick={() => value && onOk()} disabled={disabled || !value}>
        OK
      </button>
    </div>
  );
}

function InputView({ task, status, onAnswer }: FormatProps<InputTask>) {
  const [entry, setEntry] = useState("");
  return (
    <div className="flex flex-col gap-5">
      {task.visual && <VisualCard visual={task.visual} />}
      <div className={`${card} flex min-h-[130px] flex-wrap items-center justify-center px-4 py-6 text-center font-display text-[clamp(2.2rem,10vw,3.6rem)] font-semibold leading-tight`}>{renderTerm(task.term, entry)}</div>
      <NumPad value={entry} onChange={setEntry} onOk={() => onAnswer(Number(entry) === task.answer)} disabled={status !== "ask"} />
    </div>
  );
}

// --- Zehner und Einer legen -------------------------------------------------

function TensOnesView({ status, task, onAnswer }: FormatProps<TensOnesTask>) {
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const locked = status !== "ask";
  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} flex h-[250px] flex-col gap-2 p-4`}>
        <div className="flex flex-1 items-end gap-4">
          <div className="flex h-full flex-1 items-end gap-1.5">
            {Array.from({ length: tens }, (_, i) => (
              <button
                key={i}
                aria-label="Zehner wegnehmen"
                disabled={locked}
                onClick={() => setTens((t) => t - 1)}
                className="anim-pop h-[190px] w-[22px] rounded-md border-2 border-sky-dark"
                style={{ background: "repeating-linear-gradient(#4CC3FF 0 17px, #2A9FD9 17px 19px)" }}
              />
            ))}
          </div>
          <div className="flex w-[96px] flex-wrap-reverse content-start gap-1.5">
            {Array.from({ length: ones }, (_, i) => (
              <button key={i} aria-label="Einer wegnehmen" disabled={locked} onClick={() => setOnes((o) => o - 1)} className="anim-pop h-[26px] w-[26px] rounded-md border-2 border-coin-dark bg-coin" />
            ))}
          </div>
        </div>
        <div className="text-center font-display text-xl font-semibold text-ink-soft">
          {tens} Zehner · {ones} Einer
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button tone="sky" size="md" disabled={locked || tens >= 9} onClick={() => setTens((t) => t + 1)}>
          + Zehner
        </Button>
        <Button tone="coin" size="md" disabled={locked || ones >= 9} onClick={() => setOnes((o) => o + 1)}>
          + Einer
        </Button>
      </div>
      <Button tone="grape" disabled={locked || tens + ones === 0} onClick={() => onAnswer(tens * 10 + ones === task.target)}>
        Prüfen
      </Button>
    </div>
  );
}

// --- Zahlenstrahl -----------------------------------------------------------

function NumberLineView({ task, status, onAnswer }: FormatProps<NumberLineTask>) {
  const [tapped, setTapped] = useState<number | null>(null);
  const ticks: number[] = [];
  for (let v = task.from; v <= task.to; v += task.step) ticks.push(v);
  const mark = status === "right" ? "#2BB673" : "#FFB648";
  // Strich-Spalten sind gleich breit; die Linie läuft von der Mitte der ersten
  // bis zur Mitte der letzten Spalte.
  const half = 50 / ticks.length;
  return (
    <div className={`${card} px-2 pb-3 pt-4`}>
      <div className="relative h-[150px]">
        <div className="absolute top-[66px] h-2 rounded bg-ink" style={{ left: `${half}%`, right: `${half}%` }} />
        <div className="absolute inset-0 flex">
          {ticks.map((v) => {
            const isLabel = task.labels.includes(v);
            const showTarget = status === "reveal" && v === task.target;
            const marked = tapped === v || showTarget;
            const color = showTarget ? "#2BB673" : mark;
            return (
              <button
                key={v}
                aria-label={isLabel ? `Strich bei ${v}` : `Strich ${(v - task.from) / task.step}`}
                disabled={status !== "ask"}
                onClick={() => {
                  setTapped(v);
                  onAnswer(v === task.target);
                }}
                className="relative h-full flex-1"
              >
                {marked && (
                  <span className="anim-pop absolute left-1/2 top-2 -translate-x-1/2 rounded-xl px-1.5 py-0.5 font-display text-base font-semibold text-white" style={{ background: color }}>
                    {v}
                  </span>
                )}
                <span className="absolute left-1/2 top-[56px] w-1 -translate-x-1/2 rounded bg-ink" style={{ height: isLabel ? 34 : 24 }} />
                {marked && <span className="absolute left-1/2 top-[58px] h-6 w-6 -translate-x-1/2 rounded-full border-[3px] border-white" style={{ background: color }} />}
                {isLabel && <span className="absolute left-1/2 top-[98px] -translate-x-1/2 font-display text-xl font-semibold">{v}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-center text-sm font-extrabold text-ink-soft">Tippe auf den richtigen Strich.</p>
    </div>
  );
}

// --- Zahlenmauer ------------------------------------------------------------

function WallView({ task, status, onAnswer }: FormatProps<WallTask>) {
  const [entry, setEntry] = useState("");
  const width = task.rows[task.rows.length - 1].length;
  const brick = width >= 3 ? "w-[96px]" : "w-[110px]";
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-1.5">
        {task.rows.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((n, c) =>
              n === null ? (
                <div key={c} className={`${brick} flex h-14 items-center justify-center rounded-xl border-4 border-grape bg-white font-display text-3xl font-semibold text-grape`}>
                  {entry || "?"}
                </div>
              ) : (
                <div key={c} className={`${brick} flex h-14 items-center justify-center rounded-xl border-[3px] border-[#FFB648] bg-[#FFE7B8] font-display text-3xl font-semibold`}>
                  {n}
                </div>
              ),
            )}
          </div>
        ))}
      </div>
      <NumPad value={entry} onChange={setEntry} onOk={() => onAnswer(Number(entry) === task.answer)} disabled={status !== "ask"} />
    </div>
  );
}

// --- Vergleichen ------------------------------------------------------------

function CompareView({ task, status, onAnswer }: FormatProps<CompareTask>) {
  const [picked, setPicked] = useState<string | null>(null);
  const shown = status === "reveal" ? task.answer : picked;
  const c = pickedColors(status);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-3">
        <div className={`${card} flex h-[110px] flex-1 items-center justify-center font-display text-[clamp(1.8rem,8vw,2.8rem)] font-semibold`}>{task.left}</div>
        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border-4 border-dashed border-grape font-display text-5xl font-semibold" style={{ background: shown ? c.bg : "transparent", color: shown ? c.fg : "#7B4DFF", borderStyle: shown ? "solid" : "dashed" }}>
          {shown ?? ""}
        </div>
        <div className={`${card} flex h-[110px] flex-1 items-center justify-center font-display text-[clamp(1.8rem,8vw,2.8rem)] font-semibold`}>{task.right}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(["<", "=", ">"] as const).map((sym) => (
          <button
            key={sym}
            disabled={status !== "ask"}
            onClick={() => {
              setPicked(sym);
              onAnswer(sym === task.answer);
            }}
            className="chunky flex h-[96px] flex-col items-center justify-center rounded-[24px] bg-white font-display text-5xl font-semibold"
            style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "7px" }}
          >
            {sym}
            <span className="font-sans text-xs font-extrabold text-ink-soft">{sym === "<" ? "kleiner" : sym === "=" ? "gleich" : "größer"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Bild über der Aufgabe -------------------------------------------------

function VisualCard({ visual }: { visual: Visual }) {
  if (visual.kind === "dots") {
    const dot = Math.min(26, Math.floor(220 / Math.max(visual.rows, visual.cols)));
    return (
      <div className={`${card} flex justify-center px-3 py-4`}>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${visual.cols}, ${dot}px)` }} aria-label={`${visual.rows} Reihen mit je ${visual.cols} Punkten`}>
          {Array.from({ length: visual.rows * visual.cols }, (_, i) => (
            <span key={i} className="rounded-full" style={{ width: dot, height: dot, background: Math.floor(i / visual.cols) % 2 ? "#FF5D9E" : "#7B4DFF" }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={`${card} px-3 py-4`}>
      <MoneyRow items={visual.items} size={visual.items.length > 6 ? 46 : 56} />
    </div>
  );
}

// --- Geld legen -------------------------------------------------------------

function MoneyBuildView({ task, status, onAnswer }: FormatProps<MoneyBuildTask>) {
  const [laid, setLaid] = useState<{ id: number; v: number }[]>([]);
  const [nextId, setNextId] = useState(0);
  const locked = status !== "ask";
  const add = (v: number) => {
    if (locked || laid.length >= 20) return;
    sfx.coin();
    setLaid((l) => [...l, { id: nextId, v }]);
    setNextId((n) => n + 1);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} flex min-h-[170px] flex-wrap content-center items-center justify-center gap-2 p-4`}>
        {laid.length === 0 && <span className="font-extrabold text-ink-soft">Tippe unten auf Münzen und Scheine.</span>}
        {laid.map((p) => (
          <button key={p.id} disabled={locked} onClick={() => setLaid((l) => l.filter((x) => x.id !== p.id))} aria-label="wieder wegnehmen" className="anim-pop">
            <MoneyPiece value={p.v} size={48} />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-[24px] bg-white/60 p-3">
        {[...task.pieces].sort((a, b) => b - a).map((v) => (
          <button key={v} disabled={locked} onClick={() => add(v)} className="chunky rounded-2xl bg-white p-1.5" style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "4px" }}>
            <MoneyPiece value={v} size={50} />
          </button>
        ))}
      </div>
      <Button tone="grape" disabled={locked || laid.length === 0} onClick={() => onAnswer(laid.reduce((a, p) => a + p.v, 0) === task.target)}>
        Prüfen
      </Button>
    </div>
  );
}

// --- Verteilen auf Teller ----------------------------------------------------

function ShareView({ task, status, onAnswer }: FormatProps<ShareTask>) {
  const [onPlate, setOnPlate] = useState<number[]>(() => Array.from({ length: task.plates }, () => 0));
  const locked = status !== "ask";
  const pile = task.total - onPlate.reduce((a, b) => a + b, 0);
  const put = (i: number) => {
    if (locked || pile === 0) return;
    sfx.pop();
    setOnPlate((p) => p.map((n, j) => (j === i ? n + 1 : n)));
  };
  const takeBack = (i: number) => {
    if (locked || onPlate[i] === 0) return;
    sfx.tap();
    setOnPlate((p) => p.map((n, j) => (j === i ? n - 1 : n)));
  };
  const round = () => {
    if (locked || pile < task.plates) return;
    sfx.pop();
    setOnPlate((p) => p.map((n) => n + 1));
  };
  return (
    <div className="flex flex-col gap-3">
      <div className={`${card} flex min-h-[92px] flex-wrap content-center items-center justify-center gap-1 p-3`}>
        {pile === 0 ? (
          <span className="font-extrabold text-ink-soft">Alles verteilt!</span>
        ) : (
          Array.from({ length: pile }, (_, i) => (
            <span key={i} className="anim-pop">
              <TreatIcon item={task.item} size={30} />
            </span>
          ))
        )}
      </div>
      <div className="flex flex-wrap items-end justify-center gap-2.5">
        {onPlate.map((n, i) => (
          <div key={i} className="flex w-[104px] flex-col items-center">
            <button
              aria-label={`Teller ${i + 1}: ${n}`}
              disabled={locked}
              onClick={() => put(i)}
              className="chunky flex min-h-[86px] w-full flex-wrap content-end items-end justify-center gap-0.5 rounded-[22px] bg-white/70 px-1.5 pb-1 pt-2"
              style={{ ["--shade" as string]: "#E4D3C0", ["--depth" as string]: "4px" }}
            >
              {Array.from({ length: n }, (_, k) => (
                <span key={k} className="anim-pop">
                  <TreatIcon item={task.item} size={24} />
                </span>
              ))}
              <PlateArt width={92} />
            </button>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                aria-label={`Von Teller ${i + 1} zurücklegen`}
                disabled={locked || n === 0}
                onClick={() => takeBack(i)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-display text-xl font-semibold leading-none text-ink-soft shadow-[0_3px_0_#E4D3C0] disabled:opacity-30"
              >
                −
              </button>
              <span className="w-6 text-center font-display text-lg font-semibold text-ink-soft">{n}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Button tone="sky" disabled={locked || pile < task.plates} onClick={round}>
          Reihum
        </Button>
        <Button tone="grape" disabled={locked || pile > 0} onClick={() => onAnswer(onPlate.every((n) => n === onPlate[0]))}>
          Prüfen
        </Button>
      </div>
    </div>
  );
}
