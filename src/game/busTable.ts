import { chance, pick, randInt, shuffle } from "./random";
import type { BusTask, Level } from "./types";

type Schedule = Pick<BusTask, "stops" | "trips" | "from" | "to" | "earliest">;
export const busTime = (minutes: number) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;

export function busJourney(task: Schedule) {
  const column = task.trips.findIndex(trip => trip[task.from] >= task.earliest);
  const departure = task.trips[column][task.from], arrival = task.trips[column][task.to];
  return { column, departure, arrival, duration: arrival - departure };
}

export function checkBus(task: Schedule, startColumn: number, endColumn: number, minutes: string) {
  const { column, departure, arrival, duration } = busJourney(task);
  if (startColumn !== endColumn) return { correct: false, hint: "Du hast zwei verschiedene Fahrten gewählt. Bleibe von der Abfahrt bis zur Ankunft in derselben Spalte." };
  if (startColumn !== column) return { correct: false,
    hint: `Lies die Zeile „${task.stops[task.from]}“ von links nach rechts. Suche die erste Zeit ab ${busTime(task.earliest)} Uhr. Genau diese Uhrzeit zählt auch.` };
  if (!/^\d+$/.test(minutes) || Number(minutes) !== duration) {
    const fullHour = departure - departure % 60 + 60;
    const hint = arrival >= fullHour && departure % 60 !== 0
      ? `Von ${busTime(departure)} bis ${busTime(fullHour)} sind es ${fullHour - departure} Minuten. Zähle dann weiter bis ${busTime(arrival)} Uhr.`
      : `Starte bei ${busTime(departure)} Uhr. Zähle in Fünferschritten bis ${busTime(arrival)} Uhr.`;
    return { correct: false, hint };
  }
  return { correct: true };
}

export function busTable(level: Level): Omit<BusTask, "id" | "skillId" | "level"> {
  const stops = shuffle(["Schule", "Markt", "Bahnhof", "Park", "Schwimmbad"]).slice(0, level === 1 ? 2 : level === 2 ? 3 : 4);
  const from = randInt(0, stops.length - 2), to = randInt(from + 1, stops.length - 1);
  const count = level <= 2 ? 1 : 3;
  const chosen = randInt(0, count - 1);
  const routes = Array.from({ length: count }, () => {
    const offsets = [0];
    for (let i = 1; i < stops.length; i++) {
      const leg = level <= 2 ? pick([15, 30]) : randInt(level >= 4 ? 2 : 1, 4) * 5;
      offsets.push(offsets[i - 1] + leg);
    }
    return offsets;
  });
  const durationChosen = routes[chosen][to] - routes[chosen][from];
  const starts = level <= 2 ? [0, 15, 30, 45] : Array.from({ length: 12 }, (_, i) => i * 5);
  const frequentHourChange = level >= 4 && chance(0.8);
  const target = randInt(8, 16) * 60 + pick(frequentHourChange ? starts.filter(m => m + durationChosen > 60) : starts);
  const trips = routes.map((offsets, column) => offsets.map(offset => target + (column - chosen) * 45 + offset - offsets[from]));
  const earliest = target - (count === 1 ? 0 : pick([0, 5, 10]));
  const task = { stops, trips, from, to, earliest };
  const { column, departure, arrival, duration } = busJourney(task);
  return { format: "bus-table", ...task,
    question: `Du fährst von ${stops[from]} nach ${stops[to]}. Nimm die erste Fahrt ab ${busTime(earliest)} Uhr.`,
    hint: `Suche in der Zeile „${stops[from]}“ die erste Abfahrt ab ${busTime(earliest)} Uhr. Lies in derselben Spalte bei „${stops[to]}“ weiter.`,
    solution: `Fahrt ${column + 1}: Von ${stops[from]} um ${busTime(departure)} Uhr bis ${stops[to]} um ${busTime(arrival)} Uhr sind es ${duration} Minuten.` };
}
