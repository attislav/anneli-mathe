"use client";

// Lernbericht für Eltern: Was klappt, wo hakt es, wie viel wird geübt.
// Alle Daten stammen aus diesem Gerät.

import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronLeft } from "lucide-react";
import { randInt } from "@/game/random";
import { dailyActivity, mistakesFor, overview, skillReports, type SkillReport } from "@/game/report";
import type { SaveState } from "@/game/state";
import { WORLDS } from "@/game/worlds";
import { useBackdrop } from "@/ui/chrome";

const pct = (x: number) => `${Math.round(x * 100)} %`;
const dayLabel = (d: string) => {
  const [, m, day] = d.split("-");
  return `${Number(day)}.${Number(m)}.`;
};

function Gate({ onOpen }: { onOpen: () => void }) {
  const [q] = useState(() => ({ a: randInt(6, 9), b: randInt(6, 9) }));
  const [v, setV] = useState("");
  return (
    <div className="mx-auto mt-24 flex max-w-sm flex-col gap-3 rounded-[24px] bg-white p-6 text-center">
      <h1 className="font-display text-2xl font-semibold">Lernbericht – nur für Erwachsene</h1>
      <p className="text-ink-soft">
        Wie viel ist {q.a} × {q.b}?
      </p>
      <input
        inputMode="numeric"
        value={v}
        aria-label="Antwort"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          setV(val);
          if (Number(val) === q.a * q.b) onOpen();
        }}
        className="h-14 rounded-[18px] border-4 border-grape-light text-center font-display text-3xl outline-none focus:border-grape"
      />
    </div>
  );
}

function Trend({ t }: { t: number | null }) {
  if (t === null) return <span className="text-ink-soft/60">–</span>;
  if (t > 0.1) return <ArrowUpRight size={18} className="text-leaf-dark" aria-label="besser geworden" />;
  if (t < -0.1) return <ArrowDownRight size={18} className="text-rose-dark" aria-label="schlechter geworden" />;
  return <ArrowRight size={18} className="text-ink-soft" aria-label="gleich geblieben" />;
}

const barColor = (r: SkillReport) => (r.status === "stark" ? "#2BB673" : r.status === "hakt" ? "#FF9F1C" : "#7B4DFF");

export function ReportScreen({ save }: { save: SaveState }) {
  useBackdrop("#F4F1FF");
  const [open, setOpen] = useState(false);
  if (!open) return <Gate onOpen={() => setOpen(true)} />;

  const name = save.profile?.name ?? "Dein Kind";
  const reports = skillReports(save);
  const ov = overview(save);
  const days = dailyActivity(save);
  const week = days.slice(-7).reduce((a, d) => a + d.minutes, 0);
  const maxMin = Math.max(5, ...days.map((d) => d.minutes));
  const strong = reports.filter((r) => r.status === "stark");
  const weak = reports.filter((r) => r.status === "hakt").sort((a, b) => a.acc - b.acc);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 pb-16 pt-5">
      <div className="flex items-center gap-3">
        <Link href="/ich/" aria-label="Zurück" className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white">
          <ChevronLeft size={26} />
        </Link>
        <h1 className="font-display text-3xl font-semibold">Lernbericht: {name}</h1>
      </div>

      {ov.answers === 0 ? (
        <p className="mt-6 rounded-[22px] bg-white p-5 text-ink-soft">Noch keine Daten. Ab jetzt wird jede Aufgabe mitgeschrieben — nach ein paar Lektionen steht hier, was schon gut klappt und wo es noch hakt.</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [String(ov.answers), "Aufgaben seit " + (ov.since ? dayLabel(ov.since) : "–")],
              [ov.acc === null ? "–" : pct(ov.acc), "gleich richtig (letzte 100)"],
              [`${week} Min`, "geübt in 7 Tagen"],
              [String(ov.activeDays), "Tage aktiv"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-[20px] bg-white p-3 text-center">
                <div className="font-display text-2xl font-semibold">{v}</div>
                <div className="text-xs font-extrabold text-ink-soft">{l}</div>
              </div>
            ))}
          </div>

          <section className="mt-4 rounded-[22px] bg-white p-4">
            <h2 className="font-display text-xl font-semibold">Übezeit (14 Tage)</h2>
            <div className="mt-3 flex h-28 items-end gap-1.5">
              {days.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${dayLabel(d.day)}: ${d.minutes} Min, ${d.tasks} Aufgaben`}>
                  <div className="w-full rounded-t-md bg-grape" style={{ height: `${(d.minutes / maxMin) * 88}px`, minHeight: d.tasks ? 4 : 0 }} />
                  <span className="text-[9px] font-extrabold text-ink-soft">{dayLabel(d.day).replace(/\.\d+\.$/, ".")}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <section className="rounded-[22px] bg-leaf-light p-4">
              <h2 className="font-display text-xl font-semibold text-leaf-dark">Das klappt schon gut</h2>
              {strong.length === 0 ? (
                <p className="mt-1 text-sm text-ink-soft">Noch nicht genug Daten — ab 8 Aufgaben pro Thema.</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {strong.map((r) => (
                    <li key={r.id} className="rounded-full bg-white px-3 py-1 text-sm font-extrabold">
                      {r.title} · {pct(r.acc)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-[22px] bg-coin-light p-4">
              <h2 className="font-display text-xl font-semibold text-coin-dark">Hier hakt es noch</h2>
              {weak.length === 0 ? (
                <p className="mt-1 text-sm text-ink-soft">Aktuell kein Thema unter 60 % — prima!</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {weak.map((r) => (
                    <li key={r.id} className="rounded-xl bg-white p-2.5 text-sm">
                      <div className="font-extrabold">
                        {r.title} · {pct(r.acc)} gleich richtig
                      </div>
                      {mistakesFor(save, r.id).map((m, i) => (
                        <div key={i} className="mt-0.5 text-ink-soft">
                          • {m}
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="mt-4 rounded-[22px] bg-white p-4">
            <h2 className="font-display text-xl font-semibold">Alle Themen</h2>
            <p className="text-sm text-ink-soft">Trefferquote beim ersten Versuch (letzte 20 Aufgaben), Entwicklung, typische Antwortzeit, Stufe 1–5.</p>
            {WORLDS.map((w) => {
              const list = reports.filter((r) => r.world === w.id);
              if (list.length === 0) return null;
              return (
                <div key={w.id} className="mt-3">
                  <div className="text-sm font-extrabold tracking-wider text-ink-soft">{w.name.toUpperCase()}</div>
                  {list.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 border-b border-mist py-1.5 text-sm">
                      <span className="w-32 shrink-0 font-extrabold sm:w-48">{r.title}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist">
                        <div className="h-full rounded-full" style={{ width: pct(r.acc), background: barColor(r) }} />
                      </div>
                      <span className="w-12 shrink-0 whitespace-nowrap text-right font-extrabold">{pct(r.acc)}</span>
                      <Trend t={r.trend} />
                      <span className="hidden w-12 text-right text-ink-soft sm:inline">{r.seconds}s</span>
                      <span className="hidden w-10 text-right text-ink-soft sm:inline">St. {r.level.toFixed(1)}</span>
                      <span className="w-10 text-right text-ink-soft">{r.count}×</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </section>
        </>
      )}
      <p className="mt-4 text-center text-xs text-ink-soft">Alle Daten bleiben auf diesem Gerät. Mit „Spielstand mitnehmen“ wandern sie mit.</p>
    </main>
  );
}
