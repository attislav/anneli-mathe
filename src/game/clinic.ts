import { LabSession } from "./lab";
import { pick, uid } from "./random";
import type { InputTask } from "./types";

export const CLINIC_CASES = {
  plus: { title: "8 + 5: Wie komme ich über 10?", start: 8, distance: 5, ten: 10, sign: 1 },
  minus: { title: "32 − 7: Wie komme ich zurück zum Zehner?", start: 32, distance: 7, ten: 30, sign: -1 },
} as const;
export type ClinicCase = keyof typeof CLINIC_CASES;
export type ModelState = { phase: "ten" | "rest" | "done"; moved: number; hint: string };
export const initialModel: ModelState = { phase: "ten", moved: 0, hint: "" };

export function modelPicture(key: ClinicCase, state: ModelState) {
  const model = CLINIC_CASES[key];
  return { total: model.start + model.sign * state.moved, remaining: model.distance - state.moved };
}

export function moveCounter(key: ClinicCase, state: ModelState, step: 1 | -1): ModelState {
  if (state.phase === "done") return state;
  const model = CLINIC_CASES[key];
  const minimum = state.phase === "rest" ? Math.abs(model.start - model.ten) : 0;
  const moved = Math.min(model.distance, Math.max(minimum, state.moved + step));
  return { ...state, moved, hint: "" };
}

export function checkModel(key: ClinicCase, state: ModelState): ModelState {
  const model = CLINIC_CASES[key];
  const { total, remaining } = modelPicture(key, state);
  if (state.phase === "ten") return total === model.ten ? { ...state, phase: "rest", hint: "" } :
    { ...state, hint: `Du hast ${total} gelegt. Ändere die Plättchen, bis genau ${model.ten} da sind.` };
  if (state.phase === "rest" && remaining > 0) return { ...state, hint: `Noch übrig: ${remaining} Plättchen. ${key === "plus" ? "Lege den Rest dazu." : "Nimm den Rest weg."}` };
  return { ...state, phase: "done", hint: "" };
}

type Operands = { a: number; b: number };
export function clinicTransfer(key: ClinicCase, previous?: Operands) {
  const model = CLINIC_CASES[key];
  const candidates: Operands[] = [];
  for (let a = key === "plus" ? 2 : 21; a <= (key === "plus" ? 9 : 69); a++) {
    for (let b = 2; b <= 9; b++) {
      const crosses = key === "plus" ? a + b > 10 : a % 10 > 0 && a % 10 < b;
      if (crosses && a !== model.start && b !== model.distance && a !== previous?.a && b !== previous?.b) candidates.push({ a, b });
    }
  }
  const { a, b } = pick(candidates);
  const sign = key === "plus" ? "+" : "−";
  const answer = a + model.sign * b;
  const ten = key === "plus" ? 10 : a - a % 10;
  const first = Math.abs(ten - a);
  const task: InputTask = { id: uid(), skillId: key === "plus" ? "uebergang20" : "uebergang100", level: key === "plus" ? 2 : 3, format: "input",
    question: "Jetzt du! Rechne im Kopf.", term: `${a} ${sign} ${b} = ?`, answer,
    hint: `Rechne zuerst von ${a} bis ${ten}. Wie viel von ${b} bleibt für den zweiten Schritt?`,
    solution: `${a} ${sign} ${first} = ${ten}. Dann ${ten} ${sign} ${b - first} = ${answer}.` };
  return { a, b, task };
}

export class ClinicRound extends LabSession {
  constructor(owner: string, readonly topic: ClinicCase, readonly exercise = clinicTransfer(topic)) {
    super(owner, 1, () => exercise.task);
  }
}
