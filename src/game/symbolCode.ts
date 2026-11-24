import { pick, randInt } from "./random";
import type { CodeTask, Level } from "./types";

type PairText = readonly string[];
export function codeClue(t: Pick<CodeTask,"clue"|"sun"|"moon"|"focus">) {
  const first=t.focus==="sun", name=first?"Sonne":"Mond", value=first?t.sun:t.moon;
  if(t.clue==="given") return `${name} = ${value}`;
  if(t.clue==="double") return `${name} + ${name} = ${value*2}`;
  const gap=Math.abs(t.sun-t.moon);
  if(gap===0) return "Sonne und Mond haben denselben Wert.";
  return `${t.sun>t.moon?"Sonne":"Mond"} ist um ${gap} größer als ${t.sun>t.moon?"Mond":"Sonne"}.`;
}
export function witnessHint(total:number,first:PairText,second:PairText) {
  for (const pair of [first,second]) {
    if (pair.length!==2 || pair.some(v=>!/^\d$/.test(v))) return "Trage für jedes Zeichen eine Ziffer von 0 bis 9 ein.";
    if (Number(pair[0])+Number(pair[1])!==total) return `Prüfe beide Vorschläge. Sonne und Mond sollen zusammen ${total} ergeben.`;
  }
  if(first[0]===second[0] && first[1]===second[1]) return "Das ist zweimal derselbe Vorschlag. Ändere den Wert der Sonne und passe den Mond an.";
  return null;
}
export function codeExpression(t:Pick<CodeTask,"sun"|"moon"|"repeat">) {
  return t.repeat==="sun"
    ? { text:"Sonne + Sonne + Mond", result:2*t.sun+t.moon }
    : { text:"Mond + Mond + Sonne", result:2*t.moon+t.sun };
}
export function codeHint(t:CodeTask, pair:PairText, result:string) {
  if(pair.length!==2 || pair.some(v=>!/^\d$/.test(v))) return "Jedes Zeichen steht für genau eine Ziffer von 0 bis 9.";
  if(Number(pair[0])+Number(pair[1])!==t.sun+t.moon) return "Prüfe den ersten Hinweis. Addiere Sonne und Mond.";
  if(Number(pair[0])!==t.sun || Number(pair[1])!==t.moon) return "Deine Summe passt. Prüfe nun, ob dein Paar auch den zweiten Hinweis erfüllt.";
  return /^\d+$/.test(result) && Number(result)===codeExpression(t).result ? null : "Setze deine Ziffern in die neue Rechnung ein. Welches Zeichen kommt zweimal vor?";
}
export function symbolCode(level:Level):Omit<CodeTask,"level"|"skillId"|"id"> {
  const explore=level>=4, max=level<=2?5:9;
  const total=randInt(explore?1:0,explore?17:max*2);
  const sun=randInt(Math.max(0,total-max),Math.min(total,max)), moon=total-sun;
  const clue=level===1?"given":level<=3?"double":pick(["double","gap"] as const);
  const focus=pick(["sun","moon"] as const), repeat=pick(["sun","moon"] as const);
  const data={sun,moon,clue,focus,repeat,explore} as const;
  const expr=codeExpression(data);
  return {...data,format:"symbol-code",question:"Welche Zahlen stecken hinter Sonne und Mond?",
    hint:explore?"Suche zwei Zahlenpaare mit derselben Summe.":"Prüfe beide Hinweise. Ein Zeichen hat in jeder Zeile denselben Wert.",
    solution:`Sonne = ${sun}, Mond = ${moon}. ${expr.text} ergibt ${expr.result}.`};
}
