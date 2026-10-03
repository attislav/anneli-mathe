// Lernbericht: wertet das Antwort-Protokoll aus (nur auf diesem Gerät).

import { getSkill, SKILLS } from "./skills";
import { todayKey, type SaveState } from "./state";
import { WORLDS } from "./worlds";

export type SkillReport = {
  id: string;
  title: string;
  world: string;
  count: number;
  /** Trefferquote beim ersten Versuch, letzte 20 Antworten (0–1). */
  acc: number;
  /** Veränderung gegenüber den 20 Antworten davor (−1…1), `null` wenn zu wenig Daten. */
  trend: number | null;
  /** Typische Antwortzeit (Median, Sekunden). */
  seconds: number;
  /** Durchschnittliche Stufe (1–5) der letzten Antworten. */
  level: number;
  lastDay: string;
  status: "stark" | "übt" | "hakt";
};

const RECENT = 20;

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const dayOf = (t: number) => todayKey(new Date(t * 1000));

export function skillReports(s: SaveState): SkillReport[] {
  const by = new Map<string, SaveState["log"]>();
  for (const e of s.log) {
    if (!SKILLS[e.s]) continue;
    const list = by.get(e.s) ?? [];
    list.push(e);
    by.set(e.s, list);
  }
  const out: SkillReport[] = [];
  for (const [id, list] of by) {
    const recent = list.slice(-RECENT);
    const before = list.slice(-2 * RECENT, -RECENT);
    const acc = recent.filter((e) => e.ok).length / recent.length;
    const prev = before.length >= 5 ? before.filter((e) => e.ok).length / before.length : null;
    const skill = getSkill(id);
    const status = recent.length >= 8 && acc >= 0.85 ? "stark" : recent.length >= 5 && acc < 0.6 ? "hakt" : "übt";
    out.push({
      id,
      title: skill.title,
      world: skill.world,
      count: list.length,
      acc,
      trend: prev === null ? null : acc - prev,
      seconds: Math.round(median(recent.map((e) => e.ms)) / 100) / 10,
      level: recent.reduce((a, e) => a + e.l, 0) / recent.length,
      lastDay: dayOf(list[list.length - 1].t),
      status,
    });
  }
  const order = new Map(WORLDS.map((w, i) => [w.id as string, i]));
  return out.sort((a, b) => (order.get(a.world) ?? 99) - (order.get(b.world) ?? 99));
}

/** Übezeit und Aufgaben pro Tag, die letzten `days` Tage (ältester zuerst). */
export function dailyActivity(s: SaveState, days = 14): { day: string; tasks: number; minutes: number }[] {
  const map = new Map<string, { tasks: number; ms: number }>();
  for (const e of s.log) {
    const d = dayOf(e.t);
    const cur = map.get(d) ?? { tasks: 0, ms: 0 };
    cur.tasks++;
    // Lange Pausen zählen nicht als Übezeit.
    cur.ms += Math.min(e.ms, 90000);
    map.set(d, cur);
  }
  const out: { day: string; tasks: number; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    const v = map.get(key);
    out.push({ day: key, tasks: v?.tasks ?? 0, minutes: v ? Math.round(v.ms / 60000) : 0 });
  }
  return out;
}

export function overview(s: SaveState): { answers: number; acc: number | null; since: string | null; activeDays: number } {
  const last = s.log.slice(-100);
  return {
    answers: s.log.length,
    acc: last.length ? last.filter((e) => e.ok).length / last.length : null,
    since: s.log.length ? dayOf(s.log[0].t) : null,
    activeDays: new Set(s.log.map((e) => dayOf(e.t))).size,
  };
}

/** Konkrete Beispiele aus der Übungskiste (was zuletzt schiefging) für eine Kompetenz. */
export function mistakesFor(s: SaveState, skillId: string, max = 3): string[] {
  return s.practice
    .filter((p) => p.task.skillId === skillId)
    .slice(-max)
    .map((p) => {
      const t = p.task;
      const term = "term" in t && t.term ? t.term : "";
      const answer = t.format === "choice" || t.format === "input" ? ` (richtig: ${t.answer})` : "";
      return `${t.question}${term ? ` ${term}` : ""}${answer}`;
    });
}
