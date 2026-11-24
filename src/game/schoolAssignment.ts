import { LAB_TOPICS, LabSession, makeLabTask, type LabTopic } from "./lab";
import { shuffle } from "./random";
import { schoolTopics } from "./schoolSelection";
import { activeProfileId, isNodeOpen, update, type SaveState } from "./state";
import { WORLDS } from "./worlds";

export const SCHOOL_PATH = "/labor/schulauftrag/";

export function setSchoolTopics(owner: string, topics: LabTopic[]) {
  if (activeProfileId() === owner) update(save => ({ ...save, schoolTopics: schoolTopics(topics) }));
}

export function schoolOrder(topics: LabTopic[]): LabTopic[] {
  const first = shuffle(schoolTopics(topics));
  if (!first.length) throw new Error("Wähle zwei oder drei Themen.");
  const second = shuffle(first);
  if (second[0] === first.at(-1)) [second[0], second[1]] = [second[1], second[0]];
  return [...first, ...second];
}

export class SchoolRound extends LabSession {
  readonly order: LabTopic[];
  readonly results = new Map<LabTopic, number>();
  constructor(owner: string, topics: LabTopic[]) {
    const order = schoolOrder(topics);
    super(owner, order.length, n => makeLabTask(order[n - 1]));
    this.order = order;
  }
  override answer(id: string, correct: boolean, hint?: string) {
    const previous = this.state;
    const result = super.answer(id, correct, hint);
    if (result !== previous && !previous.retry) {
      const topic = this.order[previous.number - 1];
      this.results.set(topic, (this.results.get(topic) ?? 0) + Number(correct));
    }
    return result;
  }
}

export function schoolRecommendation(save: SaveState) {
  const topics = schoolTopics(save.schoolTopics);
  if (!topics.length) return null;
  const skills = topics.map(t => LAB_TOPICS[t].skillId);
  for (const world of WORLDS) {
    const node = world.nodes.find((n, i) => n.kind === "lesson" && n.skills.some(s => skills.includes(s)) && isNodeOpen(save, world, i));
    if (node) return { title: node.title, href: `/lektion/?n=${node.id}&t=0` };
  }
  return { title: "Im Labor starten", href: SCHOOL_PATH + "?start=1" };
}
