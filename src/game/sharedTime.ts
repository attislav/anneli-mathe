import { busTime } from "./busTable";
import { pick } from "./random";
import type { Level, SharedTimeTask } from "./types";

export type Appointment = { name: string; start: number; length: number };
export type SharedSchedule = {
  start: number; slots: number; duration: number; plans: [Appointment[], Appointment[]];
  movedPerson: 0 | 1; movedStart: number;
};
export const names = ["Mila", "Ben"] as const;
export function appointments(plan: SharedSchedule, person: 0 | 1, changed: boolean) {
  return plan.plans[person].map((event, index) => changed && person === plan.movedPerson && index === 0
    ? { ...event, start: plan.movedStart } : event);
}
export function eventAt(events: Appointment[], quarter: number) {
  return events.find(event => quarter >= event.start && quarter < event.start + event.length);
}
export function freeQuarters(plan: SharedSchedule, changed: boolean) {
  const first = appointments(plan, 0, changed), second = appointments(plan, 1, changed);
  return Array.from({ length: plan.slots }, (_, quarter) => quarter)
    .filter(quarter => !eventAt(first, quarter) && !eventAt(second, quarter));
}
export function validStarts(plan: SharedSchedule, changed: boolean) {
  const free = freeQuarters(plan, changed);
  return free.filter(start => Array.from({ length: plan.duration }, (_, offset) => start + offset)
    .every(quarter => free.includes(quarter)));
}
export function timeRange(plan: SharedSchedule, start: number, length: number) {
  return busTime(plan.start + start * 15) + "–" + busTime(plan.start + (start + length) * 15);
}
export function transferFits(plan: SharedSchedule, original: number, keep: boolean, replacement: number | null) {
  const starts = validStarts(plan, true);
  if (keep !== starts.includes(original)) return false;
  return keep || (replacement === null ? starts.length === 0 : starts.includes(replacement));
}

export function sharedTime(level: Level): Omit<SharedTimeTask, "id" | "skillId" | "level"> {
  const duration = level <= 2 ? 1 : level === 3 ? 2 : pick([2, 3]);
  const sparse = pick([true, false]);
  const slots = sparse ? duration + 3 : duration + 5;
  const movedPerson = pick([0, 1] as const);
  const moving = { name: pick(["Flöte", "Vorlesen"]), start: 0, length: 1 };
  const stationary = sparse
    ? [{ name: "Training", start: 0, length: 3 }]
    : [{ name: "Training", start: slots - 1, length: 1 }];
  // In the tight plan the changed quarter splits or shortens the sole reading window.
  const movedStart = sparse ? 3 : pick([1, 2, 3]);
  const movingPlan = [moving];
  if (!sparse && level >= 4) movingPlan.push({name:"Einkauf",start:slots - 2,length:1});
  const plans: SharedSchedule["plans"] = movedPerson === 0 ? [movingPlan, stationary] : [stationary, movingPlan];
  // Mirroring the complete timetable preserves feasibility and moves the gap to the other side.
  const mirror = pick([true, false]);
  if (mirror) for (const events of plans) for (const event of events) event.start = slots - event.start - event.length;
  return { format: "shared-time", start: pick([810, 840, 885, 915]), slots, duration, plans, movedPerson,
    movedStart: mirror ? slots - movedStart - moving.length : movedStart,
    question: "Wann haben Mila und Ben beide Zeit zum Lesen?",
    hint: "Lies jede Zeile quer. Für das Lesen müssen beide Kinder alle Viertelstunden am Stück frei haben.",
    solution: "Vergleiche den ersten Lesetermin mit den freien Zeiten im neuen Plan." };
}
