import { updateMastery } from "./adaptive";
import { baskets, calendar, cubeModel, machine } from "./discovery";
import { numberPairs } from "./numberPuzzles";
import { hundredWindow } from "./hundredWindow";
import { busTable } from "./busTable";
import { classSurvey, writeQuestion } from "./skillsDetektiv";
import { shopList } from "./shopList";
import { numberDetective } from "./numberDetective";
import { chocolate } from "./chocolate";
import { morningPlan } from "./morningPlan";
import { parityClaim } from "./parityClaim";
import { wayTable } from "./wayTable";
import { twoWays } from "./twoWays";
import { siteMap } from "./siteMap";
import { juice } from "./juice";
import { tower } from "./tower";
import { factFamily } from "./factFamily";
import { clarifyStory } from "./clarifyStory";
import { tileFloor } from "./tileFloor";
import { tableView } from "./tableView";
import { estimateRope } from "./estimateRope";
import { splitArray } from "./splitArray";
import { sumPacket } from "./sumPacket";
import { uid } from "./random";
import type { LabTopic } from "./schoolSelection";
export type { LabTopic } from "./schoolSelection";
import { getSkill } from "./skills";
import { activeProfileId, LOG_MAX, masteryOf, readSave, update } from "./state";
import type { Level, Task, TaskDraft } from "./types";

export const LAB_COUNT = 5;
type Topic = { title: string; prompt: string; skillId: string; generate: (level: Level) => TaskDraft };
export const LAB_TOPICS = {
  questions: { title: "Fragenwerkstatt", prompt: "Baue deine Frage und löse sie.", skillId: "sachaufgaben", generate: writeQuestion },
  split: { title: "Mal-Feld zerlegen", prompt: "Teile ein großes Punktefeld in zwei kleine.", skillId: "malZerlegen", generate: splitArray },
  rope: { title: "Schätzlabor", prompt: "Schätze eine Schnur und miss nach.", skillId: "schaetzungPruefen", generate: estimateRope },
  viewpoint: { title: "Wer sieht was?", prompt: "Schau von verschiedenen Seiten auf den Tisch.", skillId: "standpunkte", generate: tableView },
  packets: { title: "Päckchen erforschen", prompt: "Verändere Zahlen und sage die Wirkung voraus.", skillId: "rechenpaeckchen", generate: sumPacket },
  tiles: { title: "Fliesenatelier", prompt: "Drehe die Steine und fülle die Fläche.", skillId: "flaechenLegen", generate: tileFloor },
  survey: { title: "Klassenumfrage", prompt: "Sortiere Stimmen und lies die Strichliste.", skillId: "strichliste", generate: classSurvey },
  bus: { title: "Busfahrplan", prompt: "Lies ab, wie lange du fährst.", skillId: "zeitspanne", generate: busTable },
  window: { title: "Zahlenfenster", prompt: "Ergänze die Hundertertafel.", skillId: "nachbarn", generate: hundredWindow },
  detective: { title: "Zahlendetektiv", prompt: "Nutze Hinweise und begründe deinen Fund.", skillId: "zahlHinweise", generate: numberDetective },
  chocolate: { title: "Gerecht geteilt", prompt: "Teile Schokolade in Hälften und Viertel.", skillId: "anteile", generate: chocolate },
  morning: { title: "Plane deinen Vormittag", prompt: "Ordne Tätigkeiten um einen festen Termin an.", skillId: "zeitPlanen", generate: morningPlan },
  claims: { title: "Stimmt das immer?", prompt: "Prüfe Zahlenaussagen mit Plättchenpaaren.", skillId: "zahlAussagen", generate: parityClaim },
  ways: { title: "Wege-Tabelle", prompt: "Finde alle Wege über die Bibliothek zum Park.", skillId: "kombinatorik", generate: wayTable },
  methods: { title: "Zwei Rechenwege", prompt: "Rechne schrittweise oder mit einer runden Hilfsaufgabe.", skillId: "rechenwege", generate: twoWays },
  map: { title: "Lageplan lesen", prompt: "Finde Orte mit Legende und Koordinaten.", skillId: "lageplan", generate: siteMap },
  juice: { title: "Saftstation", prompt: "Fülle ganze und halbe Liter ab und gieße den Saft um.", skillId: "fuellmengen", generate: juice },
  tower: { title: "Aussichtsturm umbauen", prompt: "Baue nach Auftrag und lege die Seitenansicht.", skillId: "umbauplan", generate: tower },
  family: { title: "Rechenfamilien", prompt: "Baue aus zwei Teilen und einem Ganzen Plus- und Minusrechnungen.", skillId: "rechenfamilien", generate: factFamily },
  clarify: { title: "Was muss ich noch wissen?", prompt: "Stelle Rückfragen und löse die Sachaufgabe.", skillId: "sachfragenKlaeren", generate: clarifyStory },
  machine: { title: "Rechenmaschine", prompt: "Finde die geheime Rechenregel.", skillId: "reihen", generate: machine },
  cubes: { title: "Würfelbau", prompt: "Baue nach zwei Ansichten.", skillId: "koerper", generate: cubeModel },
  shopping: { title: "Einkaufskörbe", prompt: "Packe passend zum Geldbetrag.", skillId: "einkaufen", generate: baskets },
  shops: { title: "Einkaufszettel vergleichen", prompt: "Vergleiche die Preise für deinen ganzen Zettel.", skillId: "einkaufen", generate: shopList },
  calendar: { title: "Kalender", prompt: "Springe von Tag zu Tag.", skillId: "kalender", generate: calendar },
  pairs: { title: "Zahlenpaare", prompt: "Welche Karten gehören zusammen?", skillId: "freunde10", generate: (level) => numberPairs(level >= 4 ? 20 : 10, "+") },
  route: { title: "Rasterwege", prompt: "Folge den Pfeilen auf der Karte.", skillId: "rasterwege", generate: (level) => getSkill("rasterwege").gen({ level, avoid: [] }) },
} satisfies Record<LabTopic, Topic>;

export function makeLabTask(topic: LabTopic): Task {
  const { skillId, generate } = LAB_TOPICS[topic];
  const level = Math.min(5, Math.max(1, Math.round(masteryOf(readSave(), skillId)))) as Level;
  return { ...generate(level), skillId, level, id: uid() };
}

type LabState = {
  task: Task; number: number; status: "ask" | "wrong" | "right" | "reveal" | "done";
  retry: boolean; firstRight: number; hint?: string;
};

export class LabSession {
  readonly id = uid();
  state: LabState;
  private shownAt = Date.now();

  constructor(private readonly owner: string, readonly count: number, private readonly taskAt: (number: number) => Task) {
    this.state = { task: taskAt(1), number: 1, status: "ask", retry: false, firstRight: 0 };
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
    } else if (number === this.count) {
      this.state = { ...this.state, status: "done" };
    } else {
      this.state = { ...this.state, task: this.taskAt(number + 1), number: number + 1, retry: false, status: "ask", hint: undefined };
      this.shownAt = Date.now();
    }
    return this.state;
  }
}

export class LabRound extends LabSession {
  constructor(readonly topic: LabTopic, owner: string) {
    super(owner, LAB_COUNT, () => makeLabTask(topic));
  }
}
