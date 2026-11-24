import { pick, shuffle } from "./random";
import type { Level, PortionBoard, PortionTask } from "./types";

export const portionName=(b:PortionBoard)=>b.parts===2?"eine Hälfte":"ein Viertel";
export const portionSize=(b:PortionBoard)=>b.rows*b.cols/b.parts;
export const comparisons=["Mehr Kästchen von A","Gleich viele Kästchen","Mehr Kästchen von B"] as const;
export function comparePortions(boards:PortionBoard[]) {
  const [a,b]=boards.map(portionSize);
  return {a,b,winner:a===b?1:a>b?0:2,difference:Math.abs(a-b)};
}
export function validPortion(board:PortionBoard,cells:number[]) {
  return cells.length===portionSize(board) && new Set(cells).size===cells.length &&
    cells.every(n=>Number.isInteger(n) && n>=0 && n<board.rows*board.cols);
}
export function portionHint(boards:PortionBoard[],cells:number[][]) {
  const i=boards.findIndex((board,k)=>!validPortion(board,cells[k]));
  if(i===-1)return null;
  const board=boards[i];
  return "Schau auf Tafel "+(i===0?"A":"B")+". Teile alle Kästchen gedanklich in "+(board.parts===2?"zwei":"vier")+" gleich große Gruppen. Markiere so viele Kästchen wie in einer Gruppe.";
}
export function comparisonHint(boards:PortionBoard[],a:number,b:number,winner:number,difference:number) {
  const answer=comparePortions(boards);
  if(a!==answer.a || b!==answer.b)return "Zähle die markierten Kästchen auf jeder Tafel noch einmal.";
  if(winner!==answer.winner)return "Vergleiche die beiden Stückzahlen. Sind sie verschieden oder gleich?";
  if(difference!==answer.difference)return "Wie viele Kästchen liegen zwischen beiden Stückzahlen? Bei Gleichstand ist der Unterschied null.";
  return null;
}
const board=(rows:number,cols:number,parts:2|4):PortionBoard=>({rows,cols,parts});
const h=(r:number,c:number)=>board(r,c,2),v=(r:number,c:number)=>board(r,c,4);
const pairs=[
  [[h(2,2),h(2,3)],[h(1,4),h(2,2)],[h(2,3),h(2,4)]],
  [[h(2,4),h(2,5)],[h(1,6),h(2,3)],[h(2,4),h(3,4)]],
  [[h(2,2),v(2,4)],[h(2,3),v(2,4)],[h(2,2),v(3,4)]],
  [[h(2,3),v(3,4)],[h(2,4),v(3,4)],[h(2,3),v(4,4)]],
  [[h(2,4),v(4,4)],[v(3,4),v(4,4)],[v(3,4),v(2,6)],[h(2,5),v(4,4)]],
];
export function portionCompare(level:Level):Omit<PortionTask,"id"|"level"|"skillId">{
  const boards=shuffle(pick(pairs[level-1])),r=comparePortions(boards);
  return {format:"portion-compare",boards,question:"Du bekommst von Tafel A "+portionName(boards[0])+" und von Tafel B "+portionName(boards[1])+". Von welcher Tafel bekommst du mehr Schokolade? Oder sind es gleich viele Kästchen?",
    hint:"Die Kästchen beider Tafeln sind gleich groß. Wie viele gehören zum gesuchten Anteil?",
    solution:"Bei A sind es "+r.a+" Kästchen, bei B "+r.b+". "+(r.winner===1?"Du bekommst von beiden Tafeln gleich viel Schokolade.":"Von Tafel "+(r.winner===0?"A":"B")+" bekommst du mehr Schokolade.")+" Unterschied: "+r.difference+" Kästchen."};
}
