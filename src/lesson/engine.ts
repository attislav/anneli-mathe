// Ablauf einer Lektion — ohne React, damit es testbar bleibt.
//
// Die nächste Aufgabe wird erst erzeugt, wenn sie dran ist: so fließt das
// Ergebnis der letzten Aufgabe sofort in die Schwierigkeit der nächsten ein.

import { levelFor, pickWeakSkill, START_MASTERY, updateMastery, type Tier } from "@/game/adaptive";
import { getSkill } from "@/game/skills";
import type { Format, Task } from "@/game/types";
import type { PathNode } from "@/game/worlds";
import { pick, uid } from "@/game/random";
import { fmtLength } from "@/game/skillsWerkstatt";

export const BOSS_HP = 7;

export function taskCount(node: PathNode): number {
  if (node.practice) return node.practice.length;
  if (node.kind === "trick") return 5;
  if (node.kind === "review") return 8;
  if (node.kind === "boss") return BOSS_HP;
  return 7;
}

export type Run = {
  node: PathNode;
  tier: Tier;
  mastery: Record<string, number>;
  /** Schwung innerhalb der Lektion: −2 … +1 Stufe. Bei Fehlern geht es schnell leichter. */
  bias: number;
  rightStreak: number;
  wrongStreak: number;
  formats: Format[];
  done: number;
  firstTry: number;
  coins: number;
  bossHp: number;
  bestStreak: number;
  /** Schnell falsch getippt (geraten statt gerechnet). Zu viele → keine Belohnung. */
  guesses: number;
};

/** Ab so vielen geratenen Antworten gibt es keine Sterne und keine Belohnung. */
export const MAX_GUESSES = 3;
/** Falsche Antwort schneller als das (ms) gilt als geraten. */
export const GUESS_MS = 2500;

/** `easier`: nach einer nicht geschafften Runde startet die nächste eine Stufe leichter. */
export function startRun(node: PathNode, tier: Tier, mastery: Record<string, number>, easier = false): Run {
  const m: Record<string, number> = {};
  for (const s of node.skills) m[s] = mastery[s] ?? START_MASTERY;
  return { node, tier, mastery: m, bias: easier ? -1 : 0, rightStreak: 0, wrongStreak: 0, formats: [], done: 0, firstTry: 0, coins: 0, bossHp: BOSS_HP, bestStreak: 0, guesses: 0 };
}

/** Gleiche Strategie mit neuen Zahlen, diesmal ohne Material. */
export function transferTask(previous: Task): Task | undefined {
  const base = { id: uid(), skillId: previous.skillId, level: previous.level, format: "input" as const };
  if (previous.format === "length-strips") {
    const target = previous.target;
    const step = previous.level <= 2 ? 1 : 5;
    const candidates = Array.from({ length: Math.floor((target - 1) / step) }, (_, i) => (i + 1) * step);
    const start = pick(candidates.filter(n => !previous.lengths.includes(n)));
    const answer = target - start;
    return { ...base, question: `Ein Band soll ${fmtLength(target)} lang sein. Du hast schon ${start} cm. Wie viele Zentimeter fehlen?`,
      term: `${start} + ? = ${target}`, answer,
      hint: `${target === 100 ? "Ein Meter sind 100 cm. " : ""}Zähle von ${start} cm weiter bis ${target} cm.`,
      solution: `${start} cm + ${answer} cm = ${target} cm${target === 100 ? " = 1 m" : ""}.` };
  }
  if (previous.format === "turn-array") {
    const groups = previous.cols;
    const each = pick([2, 3, 4, 5, 6].filter(n => n !== previous.rows));
    const total = groups * each;
    return { ...base, question: `${total} Punkte in ${groups} gleich großen Gruppen. Wie viele je Gruppe?`,
      term: `${total} : ${groups} = ?`, answer: each, hint: `Welche Zahl ergibt mal ${groups} genau ${total}?`,
      solution: `${groups} · ${each} = ${total}. Also ${total} : ${groups} = ${each}.` };
  }
  if (previous.format !== "ten-jump" && previous.format !== "exchange") return;
  const delta = previous.format === "ten-jump" ? previous.delta : -previous.take;
  const ones = previous.start % 10;
  const crossing = ones + delta < 0 || ones + delta >= 10;
  const starts = Array.from({ length: 80 }, (_, i) => 10 + i).filter(start => {
    const unit = start % 10;
    const end = unit + delta;
    if (start === previous.start) return false;
    return crossing ? unit > 0 && (end < 0 || end > 10) : end >= 0 && end < 10;
  });
  const different = starts.filter(start => start % 10 !== ones);
  const a = pick(different.length ? different : starts);
  const answer = a + delta;
  const sign = delta < 0 ? "−" : "+";
  const term = `${a} ${sign} ${Math.abs(delta)}`;
  const ten = delta < 0 ? a - a % 10 : a + 10 - a % 10;
  const rest = Math.abs(answer - ten);
  return { ...base, question: "Rechne jetzt im Kopf.", term: `${term} = ?`, answer,
    hint: crossing ? `Rechne zuerst von ${a} bis ${ten}. Wie viele Schritte fehlen dann?` : `Von ${a % 10} Einern kannst du ${-delta} wegnehmen.`,
    solution: crossing ? `${a} ${sign} ${Math.abs(a - ten)} = ${ten}. Dann ${ten} ${sign} ${rest} = ${answer}.` : `${term} = ${answer}.` };
}

export function nextTask(run: Run, solvedTask?: Task): Task {
  const fixed = run.node.practice?.[run.done];
  if (fixed) return { ...fixed, id: uid() } as Task;
  if (solvedTask && (run.node.kind === "lesson" || run.node.kind === "trick")) {
    const transfer = transferTask(solvedTask);
    if (transfer) return transfer;
  }
  const skillId = run.node.skills.length === 1 ? run.node.skills[0] : pickWeakSkill(run.node.skills, run.mastery);
  // Zweite Runde (`boost`): eine Stufe schwerer, aber höchstens Meister.
  const tier = Math.min(2, run.tier + (run.node.boost ?? 0)) as Tier;
  const level = levelFor(run.mastery[skillId], tier, run.bias);
  const [a, b] = run.formats.slice(-2);
  // Zweimal dasselbe Format hintereinander → jetzt bitte etwas anderes.
  const avoid = a && a === b ? [a] : [];
  const draft = getSkill(skillId).gen({ level, avoid });
  return { ...draft, id: uid(), skillId, level } as Task;
}

export type AnswerResult = { run: Run; coinsGained: number; combo: number | null };

/** Erste Antwort auf eine Aufgabe. Spätere Versuche zählen nicht fürs Können. */
export function firstAnswer(run: Run, task: Task, correct: boolean): AnswerResult {
  const mastery = { ...run.mastery, [task.skillId]: updateMastery(run.mastery[task.skillId], correct) };
  const formats = [...run.formats, task.format];
  if (!correct) {
    const wrongStreak = run.wrongStreak + 1;
    const bias = wrongStreak >= 2 ? Math.max(-2, run.bias - 1) : run.bias;
    return { run: { ...run, mastery, formats, rightStreak: 0, wrongStreak: wrongStreak >= 2 ? 0 : wrongStreak, bias }, coinsGained: 0, combo: null };
  }
  const rightStreak = run.rightStreak + 1;
  const bias = rightStreak % 3 === 0 ? Math.min(1, run.bias + 1) : run.bias;
  const combo = rightStreak >= 3 && rightStreak % 2 === 1 ? rightStreak : null;
  // Bewusst sparsam: Der Fokus soll aufs Rechnen, nicht aufs Münzen-Sammeln.
  const coinsGained = 2 + (combo ? 2 : 0);
  return {
    run: { ...run, mastery, formats, rightStreak, wrongStreak: 0, bias, firstTry: run.firstTry + 1, coins: run.coins + coinsGained, bestStreak: Math.max(run.bestStreak, rightStreak) },
    coinsGained,
    combo,
  };
}

/** Richtig im zweiten Versuch: eine Münze, aber kein Können-Plus. */
export function lateRight(run: Run): AnswerResult {
  return { run: { ...run, coins: run.coins + 1 }, coinsGained: 1, combo: null };
}

/** Falsche Antwort in Windeseile → zählt als geraten. */
export function noteGuess(run: Run): Run {
  return { ...run, guesses: run.guesses + 1 };
}

/** Geschafft = genug gleich richtig UND nicht durchgeraten. */
export function passedRun(run: Run, stars: number): boolean {
  return stars > 0 && run.guesses < MAX_GUESSES;
}

/** Aufgabe abgeschlossen (egal wie) — zählt und trifft ggf. den Boss. */
export function completeTask(run: Run, solved: boolean): Run {
  const bossHp = run.node.kind === "boss" && solved ? run.bossHp - 1 : run.bossHp;
  return { ...run, done: run.done + 1, bossHp };
}

export function isFinished(run: Run): boolean {
  if (run.node.kind === "boss") return run.bossHp <= 0;
  return run.done >= taskCount(run.node);
}
