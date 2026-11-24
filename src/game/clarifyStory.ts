import { pick, randInt, shuffle } from "./random";
import type { ClarifyTask, Level } from "./types";

export const scenarios = {
  ride: { goal: "Schau auf die Sitzgruppe vorne im Bus. Wie viele Plätze sind dort noch frei?", unit: "Plätze", op: "−",
    known: "Plätze in dieser Sitzgruppe", missing: ["Wie viele dieser Plätze sind besetzt?", "Besetzte Plätze"],
    extras: [["Wie lange dauert die Fahrt?", "Fahrzeit", "Minuten"], ["Wie viele Haltestellen liegen auf der Strecke?", "Haltestellen unterwegs", "Haltestellen"]] },
  fruit: { goal: "Du kaufst im Kaufladen einen Apfel und eine Birne mit Spielgeld. Wie viel musst du zusammen bezahlen?", unit: "Cent", op: "+",
    known: "Preis für den Apfel", missing: ["Was kostet die Birne?", "Preis für die Birne"],
    extras: [["Was kostet eine Banane?", "Preis für eine Banane", "Cent"], ["Wie viele Körbe stehen im Kaufladen?", "Einkaufskörbe", "Körbe"]] },
  ribbon: { goal: "Du schneidest ein Stück von einem Band ab. Wie lang ist das Band danach?", unit: "cm", op: "−",
    known: "Länge vor dem Schneiden", missing: ["Wie lang ist das abgeschnittene Stück?", "Abgeschnittene Länge"],
    extras: [["Wie lang ist das Lineal?", "Länge des Lineals", "cm"], ["Wie viele Scheren liegen auf dem Tisch?", "Scheren auf dem Tisch", "Scheren"]] },
  walk: { goal: "Du gehst zur Schule und gleich weiter zum Sportplatz. Wie viele Minuten gehst du insgesamt?", unit: "Minuten", op: "+",
    known: "Gehzeit bis zur Schule", missing: ["Wie lange gehst du von der Schule zum Sportplatz?", "Gehzeit von der Schule zum Sportplatz"],
    extras: [["Wie lange dauert der Sport?", "Dauer der Sportstunde", "Minuten"], ["Wie viele Kinder sind beim Sport?", "Kinder beim Sport", "Kinder"]] },
} as const;
export type Scenario = keyof typeof scenarios;
const singular: Record<string,string> = { Plätze: "Platz", Minuten: "Minute", Körbe: "Korb", Scheren: "Schere", Kinder: "Kind", Haltestellen: "Haltestelle" };
export const storyUnit = (unit: string, amount: number | string) => Number(amount) === 1 ? singular[unit] ?? unit : unit;
export const storyAmount = (value: number, unit: string) => `${value} ${storyUnit(unit,value)}`;
export function clarifyStory(level: Level, scene: Scenario = pick(Object.keys(scenarios) as Scenario[])): Omit<ClarifyTask, "id" | "skillId" | "level"> {
  const s = scenarios[scene], limit = [10,20,35,70,100][level-1];
  const wholeBus = scene === "ride" && level >= 3;
  const known = wholeBus ? "Sitzplätze im ganzen Bus" : s.known;
  const a = scene === "ride" ? pick([[2,4],[4,6,8],[24,28,32],[32,40,48],[40,48,50]][level-1]) :
    randInt(2,scene === "walk" ? Math.min(25,limit-1) : s.op === "+" ? limit-1 : limit);
  const b = s.op === "+" ? randInt(1, Math.min(limit-a, scene === "walk" ? 15 : limit)) : randInt(1,a);
  const facts = [
    { what: "", label: known, value: a, unit: s.unit },
    { what: s.missing[0], label: s.missing[1], value: b, unit: s.unit },
    ...shuffle<readonly [string,string,string]>(s.extras).slice(0,level <= 2 ? 1 : 2).map(([what,label,unit]) => {
      const value = ["Körbe","Scheren","Haltestellen"].includes(unit) ? randInt(2,4) : unit === "Kinder" ? randInt(8,24) :
        label === "Dauer der Sportstunde" ? pick([30,45,60]) : randInt(5,30);
      return { what,label,value,unit };
    }),
  ];
  const result = s.op === "+" ? a+b : a-b;
  return { format: "clarify-story", scene, facts, order: shuffle(facts.slice(1).map((_,i)=>i+1)), op: s.op,
    question: wholeBus ? "Der Bus fährt gleich ab. Wie viele Sitzplätze sind im ganzen Bus noch frei?" : s.goal,
    hint: "Welche Zahl kennst du schon? Welche zweite Angabe brauchst du für genau diese Frage?",
    solution: `${known}: ${storyAmount(a,s.unit)}. ${s.missing[1]}: ${storyAmount(b,s.unit)}. ${a} ${s.op} ${b} = ${storyAmount(result,s.unit)}.` };
}
export function checkStory(task: Pick<ClarifyTask, "facts" | "op">, opened: number[], selected: number[], op: string, result: string) {
  if (selected.length !== 2 || !selected.includes(0) || !selected.includes(1) || !opened.includes(1))
    return "Lies das Ziel noch einmal. Welche zwei Angaben brauchst du dafür wirklich?";
  if (op !== task.op) return "Überlege, ob du beide Mengen zusammenzählst oder einen Teil wegnimmst.";
  if (op === "−" && selected[0] !== 0) return "Beginne bei der ganzen Menge und ziehe den Teil ab.";
  const [a,b] = task.facts, expected = op === "+" ? a.value+b.value : a.value-b.value;
  if (!/^\d+$/.test(result) || Number(result) !== expected) return "Deine Angaben und das Zeichen passen. Rechne noch einmal mit diesen beiden Zahlen.";
  return null;
}
