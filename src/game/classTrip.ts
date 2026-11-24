import { busTime } from "./busTable";
import { LabSession } from "./lab";
import { fmtMoney } from "./money";
import { chance, pick, randInt, shuffle, uid } from "./random";
import type { ChoiceTask, InputTask, SnackTask } from "./types";

type Bus = { name: string; departure: number; arrival: number };
export function latestOnTime(buses: Bus[], appointment: number): Bus {
  return buses.filter(bus => bus.arrival <= appointment).sort((a, b) => b.departure - a.departure)[0];
}

export function snackPairFits(task: Pick<SnackTask, "snacks" | "budget">, selected: number[]): boolean {
  return selected.length === 2 && selected[0] !== selected[1] && selected.every(i => Number.isInteger(i) && i >= 0 && i < task.snacks.length)
    && selected.reduce((sum, i) => sum + task.snacks[i].price, 0) === task.budget;
}

export function createTrip() {
  const appointment = randInt(9, 13) * 60 + pick([0, 10, 15, 30, 45]);
  const wait = pick([0, 5, 10, 15, 20, 25]);
  const arrival = appointment - wait;
  const duration = pick([15, 20, 25, 30]);
  const otherArrival = chance(0.5) ? arrival - pick([10, 15, 20]) : appointment + pick([5, 10, 15]);
  const timetable = shuffle([arrival, otherArrival]).map((time, i) =>
    ({ name: `Linie ${i === 0 ? 4 : 8}`, departure: time - duration, arrival: time }));
  const chosen = latestOnTime(timetable, appointment);
  const names = shuffle(["Apfel", "Brezel", "Birne", "Müsliriegel", "Joghurt"]).slice(0, 3);
  const prices = shuffle([15, 20, 25, 30, 35, 40, 45, 50]).slice(0, 3);
  const snacks = names.map((name, i) => ({ name, price: prices[i] }));
  const pair = shuffle([0, 1, 2]).slice(0, 2);
  const budget = prices[pair[0]] + prices[pair[1]];
  const busTask: ChoiceTask = { id: uid(), skillId: "uhrLesen", level: 3, format: "choice",
    question: "Mit welchem Bus könnt ihr am spätesten losfahren und trotzdem pünktlich ankommen?",
    options: timetable.map(bus => bus.name), answer: chosen.name,
    hint: `Vergleiche beide Ankunftszeiten mit ${busTime(appointment)} Uhr. Sind beide pünktlich, wähle die spätere Abfahrt.`,
    solution: `${chosen.name} fährt um ${busTime(chosen.departure)} Uhr los und kommt um ${busTime(arrival)} Uhr pünktlich an.` };
  const fullHour = arrival - arrival % 60 + 60;
  const waitTask: InputTask = { id: uid(), skillId: "zeitspanne", level: 3, format: "input",
    question: "Wie viele Minuten wartet ihr am Museum bis zur Führung?", term: "? Minuten", answer: wait,
    hint: wait === 0 ? "Vergleiche Ankunft und Beginn. Vergeht dazwischen überhaupt Zeit?"
      : fullHour <= appointment ? `Zähle zuerst von ${busTime(arrival)} bis ${busTime(fullHour)} Uhr, dann bis zum Beginn.`
      : `Zähle von ${busTime(arrival)} bis ${busTime(appointment)} Uhr in Fünferschritten.`,
    solution: `Von ${busTime(arrival)} bis ${busTime(appointment)} Uhr sind es ${wait} Minuten.` };
  const snackTask: SnackTask = { id: uid(), skillId: "einkaufen", level: 2, format: "snack-pair", snacks, budget,
    question: `Welche zwei verschiedenen Snacks kosten zusammen genau ${fmtMoney(budget)}?`,
    hint: "Wähle einen Snack. Wie viel Geld fehlt von seinem Preis bis zum gesuchten Betrag?",
    solution: `${names[pair[0]]} und ${names[pair[1]]}: ${fmtMoney(prices[pair[0]])} + ${fmtMoney(prices[pair[1]])} = ${fmtMoney(budget)}.` };
  return { appointment, timetable, chosen, wait, snacks: pair.map(i => names[i]), budget,
    tasks: [busTask, waitTask, snackTask] as const };
}

export class TripRound extends LabSession {
  constructor(owner: string, readonly plan = createTrip()) {
    super(owner, plan.tasks.length, number => plan.tasks[number - 1]);
  }
}
