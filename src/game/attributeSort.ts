import { pick, shuffle } from "./random";
import type { AttributeCard, AttributeTask, Level } from "./types";

type Board=Pick<AttributeTask,"cards"|"shape"|"pattern"|"countBy">;
export const patterns={plain:"ohne Muster",dots:"mit Punkten",stripes:"mit Streifen"};
const shapes=["Kreis","Quadrat","Dreieck"] as const;
export const cardLabel=(c:AttributeCard)=>c.shape+" "+patterns[c.pattern];
// The two bits encode the two independent questions about a single card.
export const slotFor=(board:Board,c:AttributeCard)=>Number(c.shape===board.shape)*2+Number(c.pattern===board.pattern);
export function slotLabels(board:Board){
  const a=board.shape, b=patterns[board.pattern];
  return ["Keines von beiden","Nur "+b,"Nur "+a,"Beides: "+a+" "+b];
}
export function countedSlots(board:Board){return board.countBy==="shape"?[2,3]:[1,3];}
export function sortedAnswer(board:Board) {
  return board.cards.filter(c=>countedSlots(board).includes(slotFor(board,c))).length;
}
export function countQuestion(board:Board) {
  return board.countBy==="shape"?"Wie viele Karten haben die Form "+board.shape+"?":
    board.pattern==="dots"?"Wie viele Karten haben Punkte?":"Wie viele Karten haben Streifen?";
}
export function placementIssue(board:Board,places:Record<number,number>) {
  for(const card of board.cards){
    const slot=places[card.id];
    if(slot===undefined)return {card:card.id,hint:"Lege auch Karte "+card.id+" in ein Feld."};
    const right=slotFor(board,card);
    if(slot!==right){
      const compare=(slot&2)!==(right&2)?"Hat die Karte die Form "+board.shape+"?":
        card.pattern==="plain"?"Ist die Karte ohne Muster?":board.pattern==="dots"?"Hat die Karte Punkte?":"Hat die Karte Streifen?";
      return {card:card.id,hint:"Schau noch einmal auf Karte "+card.id+". "+compare};
    }
  }
  return null;
}
export function countingHint(board:Board,count:number) {
  return count===sortedAnswer(board)?null:"Zähle die Karten in beiden passenden Feldern. Kann ein Feld auch leer sein?";
}
const collections=[
  [[0,1,2,3],[0,2,2,3],[0,1,1,3]],
  [[0,1,2,2,3],[0,0,1,2,3],[1,2,2,3,3]],
  [[0,0,1,1,2,3],[0,1,2,2,3,3],[0,0,0,1,2,3]],
  [[0,1,1,2,2,3,3],[0,0,1,1,1,2,2],[0,0,2,2,2,3,3]],
  [[0,0,1,1,2,3,3,3],[0,1,1,1,2,2,2,3],[0,0,0,1,1,1,1,1],[0,0,0,2,2,2,2,2]],
];
export function attributeSort(level:Level):Omit<AttributeTask,"id"|"skillId"|"level"> {
  const shape=pick(shapes), pattern=pick(["dots","stripes"] as const);
  const otherShapes=shuffle(shapes.filter(s=>s!==shape));
  const otherPatterns=level<3?["plain" as const]:["plain" as const,pattern==="dots"?"stripes" as const:"dots" as const];
  const cards=shuffle(pick(collections[level-1])).map((slot,i)=>({id:i+1,
    shape:slot&2?shape:level<3?otherShapes[0]:pick(otherShapes),pattern:slot&1?pattern:pick(otherPatterns)}));
  const countBy=pick(["shape","pattern"] as const);
  const board={shape,pattern,countBy,cards};
  const [a,b]=countedSlots(board).map(n=>cards.filter(c=>slotFor(board,c)===n).length);
  return {...board,format:"attribute-sort",question:"Welche Eigenschaften passen? Sortiere die Karten.",
    hint:"Prüfe jede Karte zweimal: zuerst die Form, dann das Muster.",
    solution:"In den beiden passenden Feldern sind "+a+" und "+b+" Karten. Zusammen sind das "+(a+b)+"."};
}
