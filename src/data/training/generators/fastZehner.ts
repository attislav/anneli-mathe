// Modul 7: Der Fast-Zehner-Trick (Hilfszahlen 9, 8, 19, 11, 21 …).
//
// Trick: statt +9 rechnet man +10 und nimmt 1 zurück. Statt −9 rechnet man
// −10 und gibt 1 zurück. Das ist die erste echte „Rechenstrategie" —
// kein Auswendiglernen, sondern geschicktes Umformen.

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

/** Hilfszahlen und ihre glatte Nachbarzahl: 9 → 10 (−1), 8 → 10 (−2) usw. */
type Helper = { value: number; round: number; diff: number };

const HELPERS_EASY: Helper[] = [
  { value: 9, round: 10, diff: 1 },
  { value: 11, round: 10, diff: -1 },
];
const HELPERS_NORMAL: Helper[] = [
  ...HELPERS_EASY,
  { value: 8, round: 10, diff: 2 },
  { value: 19, round: 20, diff: 1 },
];
const HELPERS_HARD: Helper[] = [
  ...HELPERS_NORMAL,
  { value: 21, round: 20, diff: -1 },
  { value: 29, round: 30, diff: 1 },
  { value: 18, round: 20, diff: 2 },
];

export function generateFastZehner(level: Level = "normal"): TrainingTask {
  const helpers = level === "easy" ? HELPERS_EASY : level === "hard" ? HELPERS_HARD : HELPERS_NORMAL;
  const helper = pickOne(helpers);
  const isPlus = Math.random() < 0.5;

  if (isPlus) {
    const a = randInt(11, 99 - helper.value);
    const viaRound = a + helper.round;
    const result = a + helper.value;
    return make(`${a} + ${helper.value}`, result, level, {
      hint:
        helper.diff > 0
          ? `${helper.value} ist fast ${helper.round}. Rechne ${a} + ${helper.round} = ${viaRound} und nimm dann ${helper.diff} weg.`
          : `${helper.value} ist ${-helper.diff} mehr als ${helper.round}. Rechne ${a} + ${helper.round} = ${viaRound} und leg ${-helper.diff} dazu.`,
      solution:
        helper.diff > 0
          ? `${a} + ${helper.round} = ${viaRound}, dann ${viaRound} − ${helper.diff} = ${result}.`
          : `${a} + ${helper.round} = ${viaRound}, dann ${viaRound} + ${-helper.diff} = ${result}.`,
    });
  }

  const a = randInt(helper.value + 2, 99);
  const viaRound = a - helper.round;
  const result = a - helper.value;
  return make(`${a} − ${helper.value}`, result, level, {
    hint:
      helper.diff > 0
        ? `${helper.value} ist fast ${helper.round}. Rechne ${a} − ${helper.round} = ${viaRound} und gib ${helper.diff} wieder zurück.`
        : `${helper.value} ist ${-helper.diff} mehr als ${helper.round}. Rechne ${a} − ${helper.round} = ${viaRound} und nimm noch ${-helper.diff} weg.`,
    solution:
      helper.diff > 0
        ? `${a} − ${helper.round} = ${viaRound}, dann ${viaRound} + ${helper.diff} = ${result}.`
        : `${a} − ${helper.round} = ${viaRound}, dann ${viaRound} − ${-helper.diff} = ${result}.`,
  });
}

function make(
  prompt: string,
  correctAnswer: number,
  level: Level,
  texts: { hint: string; solution: string }
): TrainingTask {
  return {
    id: taskId("fz"),
    moduleId: "fast-zehner",
    prompt,
    correctAnswer,
    level,
    ...texts,
  };
}
