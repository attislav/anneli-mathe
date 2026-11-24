import { pick, randInt, shuffle } from "./random";
import type { Level, ReceiptRow, ReceiptTask } from "./types";

export const stock=[
  ["Stift","Stifte","✏️"],["Heft","Hefte","📓"],["Lineal","Lineale","📏"],
  ["Umschlag","Umschläge","✉️"],["Klammer","Klammern","📎"],["Pinsel","Pinsel","🖌️"],
] as const;
export const article=(id:number,quantity=1)=>stock[id][quantity===1?0:1];
export const lineValue=(row:ReceiptRow)=>row.quantity*row.price;
export const receiptSum=(rows:ReceiptRow[])=>rows.reduce((sum,row)=>sum+lineValue(row),0);
export type ReceiptMark="correct"|{id:number;field:"price"|"quantity"};
type Board=Pick<ReceiptTask,"items"|"printed">;
export function receiptError(board:Board):ReceiptMark {
  for(const line of board.printed){
    const real=board.items.find(item=>item.id===line.id)!;
    if(real.quantity!==line.quantity)return {id:line.id,field:"quantity"};
    if(real.price!==line.price)return {id:line.id,field:"price"};
  }
  return "correct";
}
export function receiptHint(board:Board,mark:ReceiptMark,correction:number|null) {
  const error=receiptError(board);
  if(error==="correct")return mark==="correct"?null:"Vergleiche den markierten Wert noch einmal mit dem Warenkorb und dem Preisschild.";
  if(mark==="correct"||mark.id!==error.id)return "Gehe Artikel für Artikel durch. Stimmen die Anzahl im Korb und der Preis für ein Stück?";
  if(mark.field!==error.field)return "Der Artikel passt. Vergleiche die Anzahl und den Preis für ein Stück getrennt.";
  const real=board.items.find(row=>row.id===error.id)!;
  if(correction!==real[error.field])return error.field==="quantity"?"Zähle im Warenkorb noch einmal nach.":"Lies den Preis für ein Stück auf dem Schild.";
  return null;
}
export function receiptFinding(board:Board) {
  const error=receiptError(board);
  if(error==="correct")return "Der Bon stimmt.";
  const real=board.items.find(item=>item.id===error.id)!;
  return error.field==="price"?"Beim Artikel „"+article(error.id)+"“ gilt der Stückpreis "+real.price+" ct.":
    "Beim Artikel „"+article(error.id)+"“ ist die richtige Anzahl "+real.quantity+".";
}
export function receipt(level:Level):Omit<ReceiptTask,"id"|"level"|"skillId"> {
  const ids=shuffle(stock.map((_,i)=>i)).slice(0,level<=2?2:3);
  const pricePool=level<=2?[2,3,5]:level===3?[3,5,10]:[4,6,7,8,9,10];
  const items=ids.map(id=>({id,quantity:randInt(1,level<=2?2:3),price:pick(pricePool)}));
  const printed=shuffle(items).map(row=>({...row}));
  const field=pick(["correct","quantity","price"] as const);
  if(field!=="correct"){
    const line=pick(printed);
    const step=field==="price"&&level>=3?2:1;
    line[field]+=line[field]>step?pick([-step,step]):step;
  }
  const board={items,printed},total=receiptSum(items);
  return {...board,format:"receipt",question:"Stimmt der Kassenbon im Klassenladen?",
    hint:"Vergleiche beim selben Artikel zuerst die Anzahl, dann den Stückpreis.",
    solution:receiptFinding(board)+" Du zahlst "+items.map(lineValue).join(" + ")+" = "+total+" ct Spielgeld."};
}
