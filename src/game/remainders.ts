import { pick, randInt, shuffle } from "./random";
import type { Level, RemainderTask } from "./types";

export const restStories = {
  lake: { people: "Kinder wollen über den See fahren.", carrier: "Boot", carriers: "Boote", objects: "Buntstifte", bundle: "Stiftepackung", bundles: "Stiftepackungen" },
  mountain: { people: "Kinder wollen mit der Seilbahn fahren.", carrier: "Gondel", carriers: "Gondeln", objects: "Postkarten", bundle: "Kartenpäckchen", bundles: "Kartenpäckchen" },
  park: { people: "Kinder wollen mit der Parkbahn fahren.", carrier: "Wagen", carriers: "Wagen", objects: "Blumensamen", bundle: "Samentütchen", bundles: "Samentütchen" },
} as const;
export const restReasons = {
  all: "Jedes Kind braucht einen Platz. Auch ein teilweise besetztes Fahrzeug zählt.",
  full: "Nur vollständige Packungen zählen. Einzelne übrige Stücke bleiben draußen.",
};
export const singleTrip = "Alle Kinder fahren gleichzeitig. Jedes Fahrzeug fährt nur einmal.";
export function restValues({ total,size }: Pick<RemainderTask,"total" | "size">) {
  const full = Math.floor(total/size), rest = total%size;
  return { full,rest,rides: full+Number(rest>0) };
}
export function groupHint(p: Pick<RemainderTask,"total" | "size">, groups: number[][], answer: string) {
  const { full,rest } = restValues(p);
  const placed = groups.flat();
  if (groups.length !== full || groups.some(g => g.length !== p.size) || new Set(placed).size !== placed.length ||
      placed.some(n => !Number.isInteger(n) || n < 0 || n >= p.total)) return "Lege so viele volle Gruppen wie möglich. Jeder Punkt gehört höchstens zu einer Gruppe.";
  if (!/^\d+$/.test(answer) || Number(answer)!==rest) return "Zähle die einzelnen Punkte, die außerhalb der vollen Gruppen liegen.";
  return null;
}
export function restAnswer(p: Pick<RemainderTask,"total" | "size">, rides: string, bundles: string, whyRide: string, whyBundle: string) {
  const { full,rides: needed } = restValues(p);
  if (!/^\d+$/.test(rides) || Number(rides)!==needed || whyRide!=="all") return "Schau auf die Plätze. Kommen mit deiner Zahl an Fahrzeugen alle Kinder mit? Brauchst du wirklich jedes Fahrzeug?";
  if (!/^\d+$/.test(bundles) || Number(bundles)!==full || whyBundle!=="full") return "Prüfe jede Packung. Nur wenn sie ganz gefüllt ist, zählt sie.";
  return null;
}
export function remainders(level: Level): Omit<RemainderTask,"id"|"skillId"|"level"> {
  const scene = pick(Object.keys(restStories) as (keyof typeof restStories)[]), story = restStories[scene];
  const size = pick(level <= 2 ? [3,4] : [4,5,6]);
  const total = pick([randInt(2,size-1),size*randInt(1,level<=2 ? 2 : 4),size*randInt(1,level<=2 ? 2 : 3)+randInt(1,size-1)]);
  const {full,rest,rides} = restValues({total,size});
  return { format: "remainders", scene,total,size, reasons: shuffle(["all","full"] as const),
    question: `Was passiert beim Gruppieren von ${total} Dingen in ${size}er-Gruppen?`,
    hint: `Lege immer ${size} Punkte zusammen. Zähle am Ende die einzelnen Punkte.`,
    solution: `Volle Gruppen: ${full}. Rest: ${rest}. ${singleTrip} Benötigte ${story.carriers}: ${rides}. Vollständige ${story.bundles}: ${full}.` };
}
