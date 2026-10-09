// Ablauf einer Lektion — ohne React, damit es testbar bleibt.
//
// Die nächste Aufgabe wird erst erzeugt, wenn sie dran ist: so fließt das
// Ergebnis der letzten Aufgabe sofort in die Schwierigkeit der nächsten ein.

import { levelFor, pickWeakSkill, START_MASTERY, updateMastery, type Tier } from "@/game/adaptive";
import { getSkill } from "@/game/skills";
import type { Format, Task } from "@/game/types";
import type { PathNode } from "@/game/worlds";
import { uid } from "@/game/random";

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
};

/** `easier`: nach einer nicht geschafften Runde startet die nächste eine Stufe leichter. */
export function startRun(node: PathNode, tier: Tier, mastery: Record<string, number>, easier = false): Run {
  const m: Record<string, number> = {};
  for (const s of node.skills) m[s] = mastery[s] ?? START_MASTERY;
  return { node, tier, mastery: m, bias: easier ? -1 : 0, rightStreak: 0, wrongStreak: 0, formats: [], done: 0, firstTry: 0, coins: 0, bossHp: BOSS_HP, bestStreak: 0 };
}

export function nextTask(run: Run): Task {
  const fixed = run.node.practice?.[run.done];
  if (fixed) return { ...fixed, id: uid() } as Task;
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
  const coinsGained = 5 + (combo ? 5 : 0);
  return {
    run: { ...run, mastery, formats, rightStreak, wrongStreak: 0, bias, firstTry: run.firstTry + 1, coins: run.coins + coinsGained, bestStreak: Math.max(run.bestStreak, rightStreak) },
    coinsGained,
    combo,
  };
}

/** Richtig im zweiten Versuch: ein bisschen Münzen, aber kein Können-Plus. */
export function lateRight(run: Run): AnswerResult {
  return { run: { ...run, coins: run.coins + 2 }, coinsGained: 2, combo: null };
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
