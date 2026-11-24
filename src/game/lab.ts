import { stairProgram } from "./stairProgram";
import { fairWheel } from "./fairWheel";
import { libraryDuty } from "./libraryDuty";
import { coveredCounters } from "./coveredCounters";
import { boxOrder } from "./boxOrder";
import { rollCube } from "./rollCube";
import { dotWays } from "./dotWays";
import { portionCompare } from "./portionCompare";
import { growingFigure } from "./growingFigure";
import { patternRibbon } from "./patternRibbon";
import { attributeSort } from "./attributeSort";
import { updateMastery } from "./adaptive";
import { baskets, calendar, cubeModel, machine } from "./discovery";
import { numberPairs } from "./numberPuzzles";
import { hundredWindow } from "./hundredWindow";
import { busTable } from "./busTable";
import { classSurvey, writeQuestion } from "./skillsDetektiv";
import { receipt } from "./receipt";
import { shopList } from "./shopList";
import { numberDetective } from "./numberDetective";
import { chocolate } from "./chocolate";
import { sharedTime } from "./sharedTime";
import { morningPlan } from "./morningPlan";
import { parityClaim } from "./parityClaim";
import { wayTable } from "./wayTable";
import { twoWays } from "./twoWays";
import { siteMap } from "./siteMap";
import { juice } from "./juice";
import { tower } from "./tower";
import { factFamily } from "./factFamily";
import { clarifyStory } from "./clarifyStory";
import { remainders } from "./remainders";
import { balance } from "./balance";
import { weekly } from "./weekly";
import { symbolCode } from "./symbolCode";
import { freshLabMaterial, materialHash } from "./freshLabMaterial";
import { targetSteps } from "./targetSteps";
import { geoBoard } from "./geoBoard";
import { storyStrips } from "./storyStrips";
import { lineEstimate } from "./lineEstimate";
import { foldLines } from "./foldLines";
import { drawBag } from "./drawBag";
import { digitSwap } from "./digitSwap";
import { parcelMass } from "./parcelMass";
import { equalFence } from "./equalFence";
import { gardenFence } from "./gardenFence";
import { wheelOrders } from "./wheelOrders";
import { repack } from "./repack";
import { groupRecipe } from "./groupRecipe";
import { openVotes } from "./openVotes";
import { pictogram } from "./pictogram";
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
  sharedTime: { title: "Wann haben wir beide Zeit?", prompt: "Vergleiche zwei Pläne und vereinbare einen Lesetermin.", skillId: "gemeinsameZeit", generate: sharedTime },
  morning: { title: "Plane deinen Vormittag", prompt: "Ordne Tätigkeiten um einen festen Termin an.", skillId: "zeitPlanen", generate: morningPlan },
  claims: { title: "Stimmt das immer?", prompt: "Prüfe Zahlenaussagen mit Plättchenpaaren.", skillId: "zahlAussagen", generate: parityClaim },
  ways: { title: "Wege-Tabelle", prompt: "Finde alle Wege über die Bibliothek zum Park.", skillId: "kombinatorik", generate: wayTable },
  methods: { title: "Zwei Rechenwege", prompt: "Rechne schrittweise oder mit einer runden Hilfsaufgabe.", skillId: "rechenwege", generate: twoWays },
  map: { title: "Lageplan lesen", prompt: "Finde Orte mit Legende und Koordinaten.", skillId: "lageplan", generate: siteMap },
  juice: { title: "Saftstation", prompt: "Fülle ganze und halbe Liter ab und gieße den Saft um.", skillId: "fuellmengen", generate: juice },
  tower: { title: "Aussichtsturm umbauen", prompt: "Baue nach Auftrag und lege die Seitenansicht.", skillId: "umbauplan", generate: tower },
  family: { title: "Rechenfamilien", prompt: "Baue aus zwei Teilen und einem Ganzen Plus- und Minusrechnungen.", skillId: "rechenfamilien", generate: factFamily },
  clarify: { title: "Was muss ich noch wissen?", prompt: "Stelle Rückfragen und löse die Sachaufgabe.", skillId: "sachfragenKlaeren", generate: clarifyStory },
  rest: { title: "Was machen wir mit dem Rest?", prompt: "Bilde Gruppen und entscheide, wie der Rest zählt.", skillId: "restDeuten", generate: remainders },
  balance: { title: "Rechenwaage", prompt: "Gleiche Zahlenwerte aus und ändere beide Seiten.", skillId: "gleichheit", generate: balance },
  weekly: { title: "Wochenkalender", prompt: "Trage echte Termine trotz Ausfall und Verschiebung ein.", skillId: "wochenTermine", generate: weekly },
  code: { title: "Zeichencode", prompt: "Entschlüssle zwei Zeichen und rechne mit ihren Werten.", skillId: "zeichencodes", generate: symbolCode },
  stairs: { title:"Befehlswerkstatt: Eine Treppe in kurzen Befehlen", prompt:"Programmiere die Treppe und sage ihr nächstes Ziel voraus.", skillId:"schleifen", generate:stairProgram },
  wheelChance: { title:"Zwei gleich gute Chancen", prompt:"Baue ein faires Rad und vergleiche Sternchancen.", skillId:"faireChancen", generate:fairWheel },
  library: { title:"Dienst in der Klassenbücherei", prompt:"Buche Bücher um und finde den fehlenden Beleg.", skillId:"bestandBuchen", generate:libraryDuty },
  covered: { title:"Reichen unsere Plättchen?", prompt:"Bestimme die kleinste und größte mögliche Menge.", skillId:"mengengrenzen", generate:coveredCounters },
  boxes: { title:"Welche Kiste ist leichter?", prompt:"Wiege Kisten und begründe ihre Reihenfolge.", skillId:"gewichteOrdnen", generate:boxOrder },
  rollCube: { title:"Würfel kippen", prompt:"Verfolge den Stern und bestimme seine Endlage.", skillId:"wuerfelKippen", generate:rollCube },
  dotWays: { title:"Wie hast du die Punkte gesehen?", prompt:"Zeige zwei verschiedene Zerlegungen derselben Punktmenge.", skillId:"punktZerlegen", generate:dotWays },
  portions: { title:"Ist eine Hälfte immer gleich groß?", prompt:"Markiere Anteile auf zwei Tafeln und vergleiche sie.", skillId:"anteileVergleichen", generate:portionCompare },
  growth: { title:"Wie wächst die Figur?", prompt:"Baue die nächste Figur und berechne eine spätere.", skillId:"figurenWachstum", generate:growingFigure },
  ribbon: { title:"Musterband erfinden", prompt:"Lege ein Band und finde seinen kürzesten Baustein.", skillId:"musterbausteine", generate:patternRibbon },
  receipt: { title:"Stimmt der Kassenbon?", prompt:"Vergleiche Warenkorb, Preisschilder und Kassenbon.", skillId:"kassenbon", generate:receipt },
  attributes: { title:"Welche Eigenschaften passen?", prompt:"Sortiere Karten nach Form und Muster und zähle über zwei Felder.", skillId:"merkmaleSortieren", generate:attributeSort },
  targetSteps: { title: "Zielzahl in zwei Schritten", prompt: "Lege drei Karten und finde deinen Weg zur Zielzahl.", skillId: "zielzahlWege", generate: targetSteps },
  pegs: { title: "Geobrett", prompt: "Spanne ein Rechteck und ein Quadrat mit passenden Seitenlängen.", skillId: "figurenSpannen", generate: geoBoard },
  strips: { title: "Eine Geschichte mit Streifen legen", prompt: "Lege die Angaben in einen Streifenplan und baue eine passende Rechnung.", skillId: "sachaufgaben", generate: storyStrips },
  estimateLine: { title: "Wo ungefähr liegt die Zahl?", prompt: "Schätze die Lage auf dem Zahlenstrahl und vergleiche die Abstände.", skillId: "zahlenstrahl", generate: lineEstimate },
  folds: { title: "Faltwerkstatt", prompt: "Vermute Faltlinien und prüfe die Kästchen im Spiegelbild.", skillId: "spiegeln", generate: foldLines },
  bag: { title: "Was kannst du ziehen?", prompt: "Untersuche den Beutel und vergleiche deine Ziehspur.", skillId: "zufallBeutel", generate: drawBag },
  swap: { title: "Zifferntausch", prompt: "Tausche zwei Karten und untersuche ihre Stellenwerte.", skillId: "zehnerEiner", generate: digitSwap },
  parcels: { title: "Was wiegt das Päckchen?", prompt: "Wiege ein Päckchen und prüfe die Versandgrenze.", skillId: "paeckchenWiegen", generate: parcelMass },
  equalFence: { title: "Gleicher Zaun, wie viel Platz?", prompt: "Baue verschiedene Rechtecke mit demselben Zaun und vergleiche ihren Platz.", skillId: "beetflaechen", generate: equalFence },
  fence: { title: "Zaun ums Beet", prompt: "Lege Zaunstücke und vergleiche zwei Beete.", skillId: "zaunlaengen", generate: gardenFence },
  wheels: { title: "Räderwerkstatt", prompt: "Finde alle passenden Fahrrad- und Dreiradbestellungen.", skillId: "kombinatorik", generate: wheelOrders },
  repack: { title: "Anders gepackt, gleich viele", prompt: "Teile gleich volle Schachteln oder packe sie paarweise zusammen.", skillId: "gleichUmpacken", generate: repack },
  recipe: { title: "Rezept für unsere Tischgruppe", prompt: "Plane die Portionen und ergänze den Vorrat.", skillId: "gruppenrezepte", generate: groupRecipe },
  openVotes: { title: "Was wissen wir über die ganze Klasse?", prompt: "Verteile offene Stimmen und belege, welche Ergebnisse möglich oder sicher sind.", skillId: "offeneStimmen", generate: openVotes },
  pictures: { title: "Bilddiagramm entschlüsseln", prompt: "Lies die Legende, lege Kreise und vergleiche Stimmen.", skillId: "bilddiagramme", generate: pictogram },
  machine: { title: "Rechenmaschine", prompt: "Finde die geheime Rechenregel.", skillId: "reihen", generate: machine },
  cubes: { title: "Würfelbau", prompt: "Baue nach zwei Ansichten.", skillId: "koerper", generate: cubeModel },
  shopping: { title: "Einkaufskörbe", prompt: "Packe passend zum Geldbetrag.", skillId: "einkaufen", generate: baskets },
  shops: { title: "Einkaufszettel vergleichen", prompt: "Vergleiche die Preise für deinen ganzen Zettel.", skillId: "einkaufen", generate: shopList },
  calendar: { title: "Kalender", prompt: "Springe von Tag zu Tag.", skillId: "kalender", generate: calendar },
  pairs: { title: "Zahlenpaare", prompt: "Welche Karten gehören zusammen?", skillId: "freunde10", generate: (level) => numberPairs(level >= 4 ? 20 : 10, "+") },
  route: { title: "Rasterwege", prompt: "Folge den Pfeilen auf der Karte.", skillId: "rasterwege", generate: (level) => getSkill("rasterwege").gen({ level, avoid: [] }) },
} satisfies Record<LabTopic, Topic>;

export function makeLabTask(topic: LabTopic, requestedLevel?:Level, generateOverride?:Topic["generate"]): Task {
  const { skillId, generate } = LAB_TOPICS[topic];
  const level = requestedLevel ?? Math.min(5, Math.max(1, Math.round(masteryOf(readSave(), skillId)))) as Level;
  return { ...(generateOverride??generate)(level), skillId, level, id: uid() };
}

type LabState = {
  task: Task; number: number; status: "ask" | "wrong" | "right" | "reveal" | "done";
  retry: boolean; firstRight: number; hint?: string;
};

export class LabSession {
  readonly id = uid();
  state: LabState;
  private shownAt = Date.now();

  constructor(protected readonly owner: string, readonly count: number, private readonly taskAt: (number: number) => Task) {
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
  remember(taskId:string) {
    const {task,status}=this.state;
    if(this.owner!==activeProfileId() || taskId!==task.id || (status!=="right" && status!=="reveal"))return false;
    const note={topic:this.topic,level:task.level,source:materialHash(task)};
    update(save=>({...save,labNotes:[...save.labNotes.filter(n=>n.topic!==this.topic),note]}));
    return true;
  }
  constructor(readonly topic: LabTopic, owner: string, readonly size:1|5=LAB_COUNT, previous?:number) {
    const usedBeds: import("./equalFence").BedInvestigation[]=[];
    const usedPacks: import("./repack").Packing[]=[];
    const usedVotes: import("./openVotes").VoteSituation[]=[];
    super(owner, size, () => {
      if(size===1 && previous!==undefined) return freshLabMaterial(()=>makeLabTask(topic),previous);
      if(size===5 && topic==="openVotes") return makeLabTask(topic,undefined,level=>{
        const job=openVotes(level,usedVotes);
        usedVotes.push(job);
        return job;
      });
      if(size===5 && topic==="repack") return makeLabTask(topic,undefined,level=>{
        const job=repack(level,usedPacks);
        usedPacks.push(job.first);
        return job;
      });
      if(size===5 && topic==="equalFence") return makeLabTask(topic,undefined,level=>{
        const job=equalFence(level,usedBeds);
        usedBeds.push(job);
        return job;
      });
      return makeLabTask(topic);
    });
  }
  replay() {
    return new LabRound(this.topic,this.owner,this.size,this.size===1?materialHash(this.state.task):undefined);
  }
}
