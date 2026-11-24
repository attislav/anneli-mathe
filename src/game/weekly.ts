import { pick,randInt,shuffle } from "./random";
import type { Level,WeeklyTask } from "./types";

const dayMs = 86400000;
export const utcDay = (year:number,month:number,date:number) => Date.UTC(year,month-1,date)/dayMs;
export const weekNames = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const weekday = (day:number) => (new Date(day*dayMs).getUTCDay()+6)%7;
export const mondayOf = (day:number) => day-weekday(day);
const dayFormat = new Intl.DateTimeFormat("de-DE",{ weekday:"short",day:"numeric",month:"numeric",year:"numeric",timeZone:"UTC" });
export const dateLabel = (day:number) => dayFormat.format(new Date(day*dayMs));
type Schedule = Pick<WeeklyTask,"start"|"weeks"|"weekdays"|"cancel"|"move">;
export function calendarDays(p: Pick<Schedule,"start"|"weeks">) {
  return Array.from({length:p.weeks*7},(_,i)=>p.start+i);
}
export function actualDays(p: Schedule) {
  return calendarDays(p).filter(day => day===p.move?.to || (p.weekdays.includes(weekday(day)) && day!==p.cancel && day!==p.move?.from));
}
export function calendarAnswer(p: Schedule & Pick<WeeklyTask,"query"|"anchor">) {
  const dates=actualDays(p);
  if(p.query==="count") return String(dates.length);
  const next=dates.find(day=>p.query==="from"?day>=p.anchor:day>p.anchor);
  return next===undefined ? "none" : String(next);
}
export function checkWeekly(p: WeeklyTask,selected:number[],answer:string) {
  const correct=actualDays(p);
  if (p.cancel!==null && selected.includes(p.cancel)) return "Prüfe den Ausfall. An diesem Tag findet das Angebot nicht statt.";
  if (p.move && (selected.includes(p.move.from) || !selected.includes(p.move.to))) return "Prüfe die Verschiebung. Der neue Termin ersetzt den alten.";
  if (selected.length!==correct.length || !correct.every(day=>selected.includes(day))) return "Gehe Woche für Woche durch. Markiere genau die Tage, an denen das Angebot stattfindet.";
  if (answer!==calendarAnswer(p)) return p.query==="count"?"Deine Termine passen. Zähle noch einmal alle markierten Tage." :
    p.query==="from"?"Suche den ersten Termin ab dem genannten Tag. Dieser Tag zählt mit." : "Beginne am Tag nach dem genannten Datum. Welcher Termin kommt zuerst?";
  return null;
}
export function weekly(level:Level): Omit<WeeklyTask,"id"|"skillId"|"level"> {
  const seed = pick([utcDay(2024,2,29),utcDay(2026,10,25),utcDay(2026,12,31),utcDay(2027,3,1),utcDay(2027,9,15)]);
  const start=mondayOf(seed)-pick([0,7]), weeks=level<=2?2:3;
  const activity=pick(["die Vorlesestunde","das Kinderturnen","die offene Malwerkstatt","das Tischtennistraining"]);
  const weekdays=shuffle([0,1,2,3,4,5]).slice(0,level<=2?1:2).sort((a,b)=>a-b);
  const days=calendarDays({start,weeks}), regular=days.filter(d=>weekdays.includes(weekday(d)));
  const shuffled=shuffle(regular);
  const cancel=(level>=2 && level<=3 && pick([true,false])) || level>=4 ? shuffled[0] : null;
  const from=cancel===null?shuffled[0]:shuffled[1];
  const nearby=days.filter(d=>!regular.includes(d) && Math.abs(from-d)<=3);
  const move=level>=4 || (level>=2 && cancel===null) ? {from,to:pick(nearby)} : null;
  const p={start,weeks,weekdays,cancel,move};
  const dates=actualDays(p), anchor=pick([pick(dates),randInt(start,start+weeks*7-1)]);
  const query=level===1?pick(["count","from"] as const):pick(["count","from","after"] as const);
  const answer=calendarAnswer({...p,query,anchor});
  const follow=query==="count"?(dates.length===1?"Es findet genau ein Termin statt.":`Es finden ${answer} Termine statt.`) :
    answer==="none"?"Im gezeigten Zeitraum folgt kein passender Termin." : `Gesuchter Termin: ${dateLabel(Number(answer))}.`;
  return {...p,activity,query,anchor,format:"weekly",question:`An welchen Tagen findet ${activity} wirklich statt?`,
    hint:level===1?"Suche in jeder Woche den genannten Wochentag.":"Suche zuerst die regelmäßigen Wochentage. Prüfe dann die Änderungen.",
    solution:`${dates.length===1?"Der tatsächliche Termin ist":"Die tatsächlichen Termine sind"} ${dates.map(dateLabel).join(" · ")}. ${follow}`};
}
