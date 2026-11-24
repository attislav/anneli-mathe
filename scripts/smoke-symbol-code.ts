import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { codeClue, codeExpression, codeHint, symbolCode, witnessHint } from "../src/game/symbolCode";
import { SymbolCode } from "../src/lesson/SymbolCode";
import type { CodeTask } from "../src/game/types";

// Interpret the actual displayed second clue, independently of the validator.
function matches(clue:string,sun:number,moon:number) {
  const value=(label:string)=>label==="Sonne"?sun:moon;
  const eq=/^(Sonne|Mond)(?: \+ (Sonne|Mond))? = (\d+)$/.exec(clue);
  if(eq) return value(eq[1])+(eq[2]?value(eq[2]):0)===Number(eq[3]);
  const gap=/^(Sonne|Mond) ist um (\d+) größer als (Sonne|Mond)\.$/.exec(clue);
  if(gap) return value(gap[1])-value(gap[3])===Number(gap[2]);
  assert.equal(clue,"Sonne und Mond haben denselben Wert.");
  return sun===moon;
}
const base={...symbolCode(4),id:"code",skillId:"zeichencodes",level:4 as const};
for(let sun=0;sun<=9;sun++) for(let moon=0;moon<=9;moon++) {
  const total=sun+moon;
  for(const clue of ["given","double","gap"] as const) for(const focus of ["sun","moon"] as const) {
    const task:CodeTask={...base,sun,moon,clue,focus};
    const line=codeClue(task), candidates:string[][]=[], solutions:number[][]=[];
    for(let a=0;a<=9;a++) for(let b=0;b<=9;b++) {
      if(a+b!==total) continue;
      candidates.push([String(a),String(b)]);
      if(matches(line,a,b)) solutions.push([a,b]);
    }
    assert.deepEqual(solutions,[[sun,moon]]);
    if(total>0 && total<18) {
      assert.equal(witnessHint(total,candidates[0],candidates[1]),null);
      assert.ok(witnessHint(total,candidates[0],candidates[0]));
      assert.ok(witnessHint(total,["-1","10"],candidates[0]));
      assert.ok(witnessHint(total,["0","0"],candidates[0]));
    }
    for(const repeat of ["sun","moon"] as const) {
      const t={...task,repeat}, expected=total+(repeat==="sun"?sun:moon);
      assert.equal(codeExpression(t).result,expected);
      assert.equal(codeHint(t,[String(sun),String(moon)],String(expected)),null);
      assert.ok(codeHint(t,[String(sun),String(moon)],String(expected+1)));
      assert.ok(codeHint(t,["",""],String(expected)));
      if(sun!==moon) assert.ok(codeHint(t,[String(moon),String(sun)],String(expected)));
    }
  }
}
for(const level of [1,2,3,4,5] as const) {
  const task={...symbolCode(level),level,id:"code",skillId:"zeichencodes"};
  const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(SymbolCode,{task,status,onAnswer(){}}));
  if(level>=4) {
    assert.ok(task.sun+task.moon>0 && task.sun+task.moon<18);
    assert.ok(render("ask").includes("Vorschlag 2") && !render("ask").includes("Zweiter Hinweis"));
  } else assert.ok(render("ask").includes("Zweiter Hinweis"));
  assert.ok(render("reveal").includes("Zweiter Hinweis"));
}
