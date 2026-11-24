// Grundtypen der Spiel-Engine.
//
// Eine Aufgabe (`Task`) ist reine Daten: Zahlen, Lösung, Tipp, Rechenweg
// und das FORMAT, in dem sie gestellt wird. Welche Komponente sie rendert,
// entscheidet allein `format` — die Generatoren wissen nichts von React.

/** Schwierigkeit 1 (sehr leicht) bis 5 (Meister). */
export type Level = 1 | 2 | 3 | 4 | 5;

export type Format = Task["format"];
export type DrawRouteTask = TaskBase & { format:"draw-route"; start:number; goal:number; via:boolean; closed:number[]; example:number[] };
export type RouteTurnTask = TaskBase & { format:"route-turn"; route:number[] };
export type VoteChartTask = TaskBase & { format: "vote-chart"; names:string[]; amounts:number[] };
export type DecisionTask = TaskBase & { format: "vote-change"; names:string[]; icons:DataIcon[]; votes:number[]; ticket:number };
export type CodeTask = TaskBase & { format: "symbol-code"; sun:number; moon:number; clue:"given"|"double"|"gap"; focus:"sun"|"moon"; repeat:"sun"|"moon"; explore:boolean };
export type MarbleTask = TaskBase & { format:"marble-test" };
export type ReadingTask = TaskBase & { format:"reading-corner" };
export type LibraryTask = TaskBase & { format:"library-duty"; initial:import("./libraryDuty").Stock; bookings:import("./libraryDuty").Booking[]; afterMissing:import("./libraryDuty").Stock; reasonOrder:number[] };
export type CounterBowl = { tens:number; units:number };
export type CounterTask = TaskBase & { format:"covered-counters"; bowls:CounterBowl[]; needed:number };
export type BoxOrderTask = TaskBase & { format:"box-order"; order:import("./boxOrder").Box[]; observations:import("./boxOrder").Observation[] };
export type RollCubeTask = TaskBase & { format:"roll-cube"; practice:import("./rollCube").CubePath; transfer:import("./rollCube").CubePath };
export type DotWaysTask = TaskBase & { format:"dot-ways"; cols:number; dots:number[] };
export type PortionBoard = { rows:number; cols:number; parts:2|4 };
export type PortionTask = TaskBase & { format:"portion-compare"; boards:PortionBoard[] };
export type GrowthTask = TaskBase & { format:"growing-figure"; family:import("./growingFigure").Family; start:number; target:number };
export type RibbonTask = TaskBase & { format:"pattern-ribbon"; palette:number[]; min:number; max:number; offset:number };
export type ReceiptRow = { id:number; quantity:number; price:number };
export type ReceiptTask = TaskBase & { format:"receipt"; items:ReceiptRow[]; printed:ReceiptRow[] };
export type AttributeCard = { id:number; shape:"Kreis"|"Quadrat"|"Dreieck"; pattern:"plain"|"dots"|"stripes" };
export type AttributeTask = TaskBase & { format:"attribute-sort"; cards:AttributeCard[]; shape:AttributeCard["shape"]; pattern:"dots"|"stripes"; countBy:"shape"|"pattern" };
export type TargetStepsTask = TaskBase & { format:"target-steps"; cards:number[]; target:number; limit:number };
export type GeoBoardTask = TaskBase & { format:"geo-board"; width:number; height:number; side:number };
export type StripStoryTask = TaskBase & { format:"strip-story"; parts:[number,number]; names:string[]; unit:[string,string]; missing:import("./storyStrips").StoryRole; order:import("./storyStrips").StoryRole[] };
export type DivisionMeaningTask = TaskBase & { format:"division-meaning"; total:number; divisor:number; share:boolean };
export type LineEstimateTask = TaskBase & { format:"line-estimate"; low:number; high:number; target:number };
export type FoldTask = TaskBase & { format:"fold-lines"; size:number; filled:number[]; lines:import("./foldLines").FoldLine[] };
export type BagTask = TaskBase & { format:"draw-bag"; bag:import("./drawBag").BagMark[]; first:import("./drawBag").BagMark[]; next:import("./drawBag").BagMark[]; series:import("./drawBag").BagMark[]; reasons:import("./drawBag").ChanceClass[] };
export type SwapTask = TaskBase & { format:"digit-swap"; digits:number[]; min:number; max:number };
export type ParcelTask = TaskBase & { format:"parcel-mass"; mass:number; other:number };
export type FenceTask = TaskBase & { format: "garden-fence"; first:string[]; second:string[] };
export type WheelTask = TaskBase & { format: "wheel-orders"; wheels: number };
export type RecipeIngredient = { name: string; unit: "Stück" | "Esslöffel"; base: number; stock: number };
export type GroupRecipeTask = TaskBase & { format: "group-recipe"; title: string; children: number; ingredients: RecipeIngredient[] };
export type PictogramTask = TaskBase & { format: "pictogram"; names:string[]; title:string; keyValue:number; first:number; second:number };
export type WeeklyTask = TaskBase & { format: "weekly"; start: number; weeks: number; weekdays: number[]; activity: string;
  cancel: number | null; move: {from:number;to:number}|null; query: "count"|"from"|"after"; anchor: number };
export type BalanceTask = TaskBase & { format: "balance"; limit: number; stones: number[]; base: number[]; start: number[]; change: number };
export type RemainderTask = TaskBase & { format: "remainders"; scene: "lake" | "mountain" | "park"; total: number; size: number; reasons: ("all" | "full")[] };
export type ClarifyTask = TaskBase & { format: "clarify-story"; scene: string; facts: { what: string; label: string; value: number; unit: string }[]; order: number[]; op: "+" | "−" };
export type FamilyTask = TaskBase & { format: "fact-family"; parts: [number,number]; cards: number[] };
export type TowerTask = TaskBase & { format: "tower"; initial: number[]; changes: { cell: number; delta: -1 | 1 }[];
  reserve: number; side: "south" | "north" | "east" | "west" };
export type JuiceTask = TaskBase & { format: "juice"; target: number; capacity: number; source: "narrow" | "wide" };
export type MapPlace = "library" | "park" | "cafe" | "station" | "pool";
export type SiteMapTask = TaskBase & { format: "site-map"; size: number; cells: (MapPlace | null)[]; target: MapPlace; anchor: MapPlace | null;
  closed: [number, number] | null; mode: "coordinate" | "place" | "neighbor" };
export type TwoWaysTask = TaskBase & { format: "two-ways"; a: number; b: number; minus: boolean; roundFirst: boolean };
export type WayTableTask = TaskBase & { format: "way-table"; first: string[]; second: string[]; blocked: string | null; cards: string[] };
export type PairRule = "even" | "odd" | "mixed" | "any" | "one-even" | "one-odd";
export type ParityTask = TaskBase & { format: "parity-claim"; rule: PairRule; evenSum: boolean; limit: number };
export type MorningTask = TaskBase & { format: "morning-plan"; start: number; duration: number; step: number;
  fixed: number; activities: { name: string; duration: number }[]; follow: "end" | "pause"; target: number };
export type ChocolateTask = TaskBase & { format: "chocolate-share"; rows: number; cols: number; children: 2 | 4 };
export type NumberClue = { kind: "range"; lo: number; hi: number } | { kind: "ends"; digits: number[] } | { kind: "parity"; even: boolean };
export type DetectiveTask = TaskBase & { format: "number-detective"; numbers: number[]; clues: NumberClue[]; excluded: number };
export type ShopListTask = TaskBase & {
  format: "shop-list";
  goods: string[];
  stores: { name: string; prices: (number | null)[] }[];
};
export type WriteQuestionTask = TaskBase & { format: "write-question"; scene: "fruit" | "pets"; groups: DataRow[]; preset?: { a: number; b: number; kind: "sum" | "difference" } };
export type SplitAxis = "rows" | "cols";
export type SplitTask = TaskBase & { format: "split-array"; rows: number; cols: number; axis: SplitAxis | "either"; presetLine?: number };
export type RopeTask = TaskBase & { format: "estimate-rope"; length: number; unit: 1 | 2; extent: number };
export type TableSide = "unten" | "oben" | "links" | "rechts";
export type TableItem = "Tasse" | "Buch" | "Schlüssel" | "Apfel" | "Stift" | "Uhr";
export type ViewpointTask = TaskBase & { format: "table-view"; items: TableItem[]; side: TableSide; reverse: boolean };
export type PacketTask = TaskBase & { format: "sum-packet"; before: [number, number]; changes: [number, number]; exact: boolean };
export type TileTask = TaskBase & { format: "tile-floor"; width: number; height: number; example: number[][] };
export type TilePlacement = { piece: number; anchor: number; turns: number };
export type SnackTask = TaskBase & { format: "snack-pair"; snacks: { name: string; price: number }[]; budget: number };
export type SurveyTask = TaskBase & { format: "class-survey"; categories: Omit<DataRow, "value">[]; votes: number[]; target: number; compare: number | null; followUp: string };
export type BusTask = TaskBase & { format: "bus-table"; stops: string[]; trips: number[][]; from: number; to: number; earliest: number };
export type HundredWindowTask = TaskBase & { format: "hundred-window"; start: number; size: 2 | 3; gaps: number[] };
export type StripTask = TaskBase & { format: "length-strips"; lengths: number[]; target: number };
export type MachineTask = TaskBase & { format: "machine"; inputs: number[]; change: number; rules: number[]; probe: number; reverse: boolean };
export type CubeTask = TaskBase & { format: "cube-model"; footprint: boolean[]; front: number[] };
export type EstimateTask = TaskBase & { format: "plausible"; reasons: string[]; reason: string; calculation: string; answer: number; unit: string };
export type BasketTask = TaskBase & { format: "baskets"; prices: number[]; budget: number };
export type CalendarTask = TaskBase & { format: "calendar"; year: number; month: number; day: number; nights: number };
export type PairTask = TaskBase & { format: "number-pairs"; operation: "+" | "·"; target: number; cards: number[] };
export type RuleTask = TaskBase & { format: "sequence-rule"; numbers: number[]; missing: number; rule: string; options: string[] };
export type DigitBuildTask = TaskBase & { format: "digit-build"; digits: number[] };
export type GridRouteTask = TaskBase & { format: "grid-route"; size: number; stops: number[]; findStart: boolean };

type JumpTask = TaskBase & { format: "ten-jump"; start: number; delta: number };
type ExchangeTask = TaskBase & { format: "exchange"; start: number; take: number };
type ArrayTask = TaskBase & { format: "turn-array"; rows: number; cols: number };
export type TwoStepTask = TaskBase & {
  format: "two-step";
  intermediate: { question: string; choices: string[]; calculation: string; answer: number };
  calculation: string;
  answer: number;
  unit: string;
};

export type StoryMathTask = TaskBase & {
  format: "story-math";
  options: string[];
  calculation: string;
  answer: number;
  unit: string;
};

type TaskBase = {
  id: string;
  skillId: string;
  level: Level;
  /** Die Frage in Kinder-Sprache, z.B. „Wie viel ist das?". */
  question: string;
  /** Tipp nach dem ersten Fehlversuch — wendet den Trick auf GENAU diese Zahlen an. */
  hint: string;
  /** Rechenweg nach dem zweiten Fehlversuch. Kein „falsch", sondern „so geht's". */
  solution: string;
};

/** Bild über der Aufgabe — z. B. Münzen und Scheine zum Zählen (Werte in Cent). */
export type Visual = { kind: "money"; items: number[] } | { kind: "dots"; rows: number; cols: number } | { kind: "clock"; hour: number; minute: number }
  | { kind: "shapes"; items: ShapeItem[]; scatter?: boolean }
  | { kind: "solid"; solid: SolidId }
  /** Ein Gegenstand liegt am Lineal, von `from` bis `to` (cm). */
  | { kind: "ruler"; from: number; to: number; max: number; item: RulerItem }
  /** Strichliste: pro Zeile ein Ding und wie oft es gezählt wurde. */
  | { kind: "tally"; rows: DataRow[] }
  /** Säulendiagramm. `step`: Wert pro Kästchen. */
  | { kind: "bars"; rows: DataRow[]; step: number; max: number };

export type DataIcon = "apfel" | "banane" | "birne" | "kirsche" | "traube" | "hund" | "katze" | "hase" | "vogel" | "sonne" | "regen" | "wolke";
/** Eine Zeile Daten für Strichliste oder Diagramm. */
export type DataRow = { label: string; icon: DataIcon; value: number };

export type RulerItem = "stift" | "band" | "wurm" | "nagel";

export type ShapeId = "kreis" | "dreieck" | "quadrat" | "rechteck" | "fuenfeck" | "sechseck";
export type SolidId = "wuerfel" | "quader" | "kugel" | "zylinder" | "kegel" | "pyramide";
/** Eine Form mit Farbe (und Größe 1 = normal). */
export type ShapeItem = { shape: ShapeId; color: string; size?: number };

/** Antwort antippen. `term` ist die große Aufgabe, z.B. „38 + 7 = ?". */
export type ChoiceTask = TaskBase & {
  format: "choice";
  term?: string;
  visual?: Visual;
  options: string[];
  answer: string;
};

/** Zahl eintippen. `term` enthält genau ein „?" als Lücke. */
export type InputTask = TaskBase & {
  format: "input";
  term: string;
  visual?: Visual;
  answer: number;
};

/** Zahl mit Zehnerstangen und Einerwürfeln legen. */
export type TensOnesTask = TaskBase & {
  format: "tens-ones";
  target: number;
};

/** Auf dem Zahlenstrahl den richtigen Strich antippen. */
export type NumberLineTask = TaskBase & {
  format: "number-line";
  from: number;
  to: number;
  step: number;
  /** Welche Striche beschriftet sind. */
  labels: number[];
  target: number;
};

/** Zahlenmauer: Zeilen von OBEN nach unten, genau ein Feld ist `null`. */
export type WallTask = TaskBase & {
  format: "wall";
  rows: (number | null)[][];
  answer: number;
};

/** Größer, kleiner oder gleich? Seiten können Zahlen oder Terme sein. */
export type CompareTask = TaskBase & {
  format: "compare";
  left: string;
  right: string;
  answer: "<" | ">" | "=";
  /** Werte der Seiten, wenn sie keine Rechenterme sind (z. B. „2 € 5 ct"). */
  values?: [number, number];
};

/** Geldbetrag mit Münzen und Scheinen legen. Alles in Cent. */
export type MoneyBuildTask = TaskBase & {
  format: "money-build";
  target: number;
  purchase?: { price: number; paid: number };
  minimumCoins?: number;
  /** Welche Münzen/Scheine zur Auswahl stehen. */
  pieces: number[];
};

/** Gebäck gerecht auf Teller verteilen. Richtig: alles verteilt, überall gleich viel. */
export type ShareTask = TaskBase & {
  format: "share";
  withRemainder?: boolean;
  total: number;
  plates: number;
  item: Treat;
};

export type Treat = "keks" | "muffin" | "brezel";

/** Spiegeln im Gitter: links ist ein Muster, rechts soll das Spiegelbild hin. */
export type MirrorTask = TaskBase & {
  format: "mirror";
  axis?: "horizontal";
  rows: number;
  /** Spalten pro Hälfte. */
  half: number;
  /** Ausgemalte Kästchen der linken Hälfte als [Zeile, Spalte]. */
  cells: [number, number][];
  color: string;
};

/** Muster fortsetzen: Was kommt als Nächstes? `answer` ist der Index in `options`. */
export type PatternTask = TaskBase & {
  format: "pattern";
  items: ShapeItem[];
  options: ShapeItem[];
  answer: number;
};

/** Am Lineal eine Linie zeichnen: bis zum richtigen Strich tippen. */
export type RulerTask = TaskBase & {
  format: "ruler";
  start?: number;
  target: number;
  max: number;
};

/** Säulendiagramm zeichnen: Säulen auf die Werte aus der Strichliste ziehen. */
export type BarBuildTask = TaskBase & {
  format: "bar-build";
  initialHeights?: number[];
  rows: DataRow[];
  step: number;
  max: number;
};

/** Zeiger einer Uhr stellen. `step`: in welchen Minuten-Schritten der Minutenzeiger springt. */
export type ClockSetTask = TaskBase & {
  format: "clock-set";
  trip?: { startHour: number; startMinute: number; duration: number };
  hour: number;
  minute: number;
  step: 5 | 15 | 30 | 60;
};

export type Task = DrawRouteTask | RouteTurnTask | VoteChartTask | DecisionTask | CodeTask | MarbleTask | ReadingTask | LibraryTask | CounterTask | BoxOrderTask | RollCubeTask | DotWaysTask | PortionTask | GrowthTask | RibbonTask | ReceiptTask | AttributeTask | TargetStepsTask | GeoBoardTask | StripStoryTask | DivisionMeaningTask | LineEstimateTask | FoldTask | BagTask | SwapTask | ParcelTask | FenceTask | WheelTask | GroupRecipeTask | PictogramTask | WeeklyTask | BalanceTask | RemainderTask | ClarifyTask | FamilyTask | TowerTask | JuiceTask | SiteMapTask | TwoWaysTask | WayTableTask | ParityTask | MorningTask | ChocolateTask | DetectiveTask | ShopListTask | WriteQuestionTask | SplitTask | RopeTask | ViewpointTask | PacketTask | TileTask | SnackTask | SurveyTask | BusTask | HundredWindowTask | StripTask | MachineTask | CubeTask | EstimateTask | BasketTask | CalendarTask | GridRouteTask | DigitBuildTask | PairTask | RuleTask | TwoStepTask | StoryMathTask | JumpTask | ExchangeTask | ArrayTask | ChoiceTask | InputTask | TensOnesTask | WallTask | NumberLineTask | CompareTask | MoneyBuildTask | ShareTask | ClockSetTask | MirrorTask | PatternTask | RulerTask | BarBuildTask;

/** `Omit`, das über jede Variante einer Union einzeln läuft. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** Was ein Generator liefert — ID, Kompetenz und Stufe setzt die Engine. */
export type TaskDraft = DistributiveOmit<Task, "id" | "skillId" | "level">;
