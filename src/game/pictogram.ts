import { pick, randInt, shuffle } from "./random";
import type { Level, PictogramTask } from "./types";

export function votesLabel(n: number) { return n === 1 ? "1 Stimme" : n + " Stimmen"; }
export function diagramVotes(halves: number, key: number) { return halves * key / 2; }
export function pictureHint(p: PictogramTask, read: string, built: number) {
  if (!/^\d+$/.test(read) || Number(read) !== diagramVotes(p.first,p.keyValue))
    return `Lies die Legende: Ein ganzer Kreis steht für ${votesLabel(p.keyValue)}. Zähle die erste Reihe damit.`;
  if (built !== p.second) return `Prüfe deine Reihe. Jeder ganze Kreis zählt ${votesLabel(p.keyValue)}.${p.level>1 ? ` Ein halber zählt ${votesLabel(p.keyValue/2)}.` : ""}`;
  return null;
}
export function neededVotes(p: Pick<PictogramTask,"first"|"second"|"keyValue"|"names">) {
  return { name: p.names[p.first<=p.second ? 0 : 1], votes: diagramVotes(Math.abs(p.first-p.second),p.keyValue) };
}
export const tieQuestion = (name:string) => `Wie viele zusätzliche Stimmen sind für „${name}“ bis zum Gleichstand nötig? Das können auch null sein.`;
export function pictogram(level: Level): Omit<PictogramTask,"skillId"|"id"|"level"> {
  const [title, ...choices] = pick([
    ["Unser Ausflugsziel","Zoo","Wald","Park"], ["Unser Pausenspiel","Fangen","Seilspringen","Verstecken"],
    ["Obst fürs Klassenfrühstück","Äpfel","Bananen","Birnen"],
  ]);
  const names=shuffle(choices).slice(0,2), keyValue = level>=4 ? 4 : 2;
  const first=level===1 ? randInt(1,4)*2 : randInt(0,level>=4?10:9);
  const second=pick([first,level===1?randInt(1,4)*2:randInt(0,10),level===1?randInt(1,4)*2:randInt(1,9)]);
  const p={names,keyValue,first,second}, needed=neededVotes(p);
  return {...p,title,format:"pictogram", question:"Was verraten die Bilder über die Abstimmung?",
    hint:"Schau zuerst in die Legende. Wie viele Stimmen zählt ein ganzer Kreis?",
    solution:`${names[0]}: ${votesLabel(diagramVotes(first,keyValue))}. ${names[1]}: ${votesLabel(diagramVotes(second,keyValue))}. ${needed.votes===0?"Beide Reihen haben schon gleich viele Stimmen.":`Für „${needed.name}“ ${needed.votes===1?"fehlt":"fehlen"} ${votesLabel(needed.votes)} bis zum Gleichstand.`}` };
}
