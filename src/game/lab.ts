import { updateMastery } from "./adaptive";
import { baskets, calendar, cubeModel, machine } from "./discovery";
import { numberPairs } from "./numberPuzzles";
import { uid } from "./random";
import { getSkill } from "./skills";
import { activeProfileId, LOG_MAX, masteryOf, readSave, update } from "./state";
import type { Level, Task, TaskDraft } from "./types";

export const LAB_COUNT = 5;
type Topic = { title: string; prompt: string; skillId: string; generate: (level: Level) => TaskDraft };
export const LAB_TOPICS = {
  machine: { title: "Rechenmaschine", prompt: "Finde die geheime Rechenregel.", skillId: "reihen", generate: machine },
  cubes: { title: "Würfelbau", prompt: "Baue nach zwei Ansichten.", skillId: "koerper", generate: cubeModel },
  shopping: { title: "Einkaufskörbe", prompt: "Packe passend zum Geldbetrag.", skillId: "einkaufen", generate: baskets },
  calendar: { title: "Kalender", prompt: "Springe von Tag zu Tag.", skillId: "kalender", generate: calendar },
  pairs: { title: "Zahlenpaare", prompt: "Welche Karten gehören zusammen?", skillId: "freunde10", generate: (level) => numberPairs(level >= 4 ? 20 : 10, "+") },
  route: { title: "Rasterwege", prompt: "Folge den Pfeilen auf der Karte.", skillId: "rasterwege", generate: (level) => getSkill("rasterwege").gen({ level, avoid: [] }) },
} satisfies Record<string, Topic>;

export type LabTopic = keyof typeof LAB_TOPICS;
function makeTask(topic: LabTopic): Task {
  const { skillId, generate } = LAB_TOPICS[topic];
  const level = Math.min(5, Math.max(1, Math.round(masteryOf(readSave(), skillId)))) as Level;
  return { ...generate(level), skillId, level, id: uid() };
}

type LabState = {
  task: Task; number: number; status: "ask" | "wrong" | "right" | "reveal" | "done";
  retry: boolean; firstRight: number; hint?: string;
};

export class LabRound {
  readonly id = uid();
  state: LabState;
  private shownAt = Date.now();

  constructor(readonly topic: LabTopic, private readonly owner: string) {
    this.state = { task: makeTask(topic), number: 1, status: "ask", retry: false, firstRight: 0 };
  }

  answer(taskId: string, correct: boolean, hint?: string): LabState {
    const { task, status, retry, firstRight } = this.state;
    if (this.owner !== activeProfileId() || task.id !== taskId || status !== "ask") return this.state;
    this.state = { ...this.state, status: correct ? "right" : retry ? "reveal" : "wrong",
      firstRight: firstRight + Number(!retry && correct), hint };
    if (!retry) {
      const now = Date.now();
      const entry = { t: Math.round(now / 1000), s: task.skillId, l: task.level,
        ok: correct ? 1 as const : 0 as const, ms: Math.max(0, Math.min(600000, now - this.shownAt)) };
      update(save => ({ ...save, log: [...save.log, entry].slice(-LOG_MAX),
        mastery: { ...save.mastery, [task.skillId]: updateMastery(masteryOf(save, task.skillId), correct) } }));
    }
    return this.state;
  }

  advance(taskId: string): LabState {
    const { number, task, status } = this.state;
    if (this.owner !== activeProfileId() || task.id !== taskId || status === "ask" || status === "done") return this.state;
    if (status === "wrong") {
      this.state = { ...this.state, status: "ask", retry: true };
    } else if (number === LAB_COUNT) {
      this.state = { ...this.state, status: "done" };
    } else {
      this.state = { ...this.state, task: makeTask(this.topic), number: number + 1, retry: false, status: "ask", hint: undefined };
      this.shownAt = Date.now();
    }
    return this.state;
  }
}
