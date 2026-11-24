import assert from "node:assert/strict";
import {mock} from "node:test";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {actualDays,calendarAnswer,calendarDays,checkWeekly,dateLabel,mondayOf,utcDay,weekly} from "../src/game/weekly";
import type {Level,WeeklyTask} from "../src/game/types";
import {Weekly} from "../src/lesson/Weekly";

const leap=utcDay(2024,2,29), march=utcDay(2024,3,1);
assert.equal(march,leap+1);
assert.equal(utcDay(2025,2,28)+1,utcDay(2025,3,1));
assert.equal(mondayOf(leap),utcDay(2024,2,26));
assert.equal(utcDay(2026,10,25)+1,utcDay(2026,10,26));
assert.equal(mondayOf(utcDay(2026,10,25)),utcDay(2026,10,19));
assert.equal(utcDay(2026,12,31)+1,utcDay(2027,1,1));
assert.ok(dateLabel(utcDay(2027,1,1)).includes("2027"));
const start=utcDay(2026,12,21), first=utcDay(2026,12,23), next=utcDay(2027,1,1);
const test:WeeklyTask={...weekly(5),id:"example",skillId:"wochenTermine",level:5,start,weeks:3,weekdays:[2],
  cancel:utcDay(2027,1,6),move:{from:utcDay(2026,12,30),to:next},query:"count",anchor:first};
assert.deepEqual(actualDays(test),[first,next]);
assert.equal(calendarAnswer(test),"2");
assert.equal(calendarAnswer({...test,query:"from"}),String(first));
assert.equal(calendarAnswer({...test,query:"after"}),String(next));
assert.equal(calendarAnswer({...test,query:"after",anchor:next}),"none");
assert.equal(checkWeekly(test,[next,first],"2"),null);
assert.ok(checkWeekly(test,[first,test.cancel!],"2"));
assert.ok(checkWeekly(test,[first,test.move!.from],"2"));
assert.ok(checkWeekly(test,[first,first],"2"));
assert.ok(checkWeekly(test,[first,next],"3"));
assert.deepEqual(actualDays({...test,start:mondayOf(leap),weeks:2,weekdays:[3],move:{from:leap,to:march},cancel:null}),[march,utcDay(2024,3,7)]);
for(const level of [1,2,3,4,5] as Level[]) {
  for(let i=0;i<60;i++) {
    const task={...weekly(level),id:"sample",skillId:"wochenTermine",level};
    const days=calendarDays(task), actual=actualDays(task);
    assert.equal(mondayOf(task.start),task.start);
    assert.equal(days.length,level<=2?14:21);
    assert.equal(Number(task.cancel!==null)+Number(task.move!==null),level===1?0:level<=3?1:2);
    assert.ok(actual.length && actual.every(day=>days.includes(day)));
    if(task.move) assert.ok(actual.includes(task.move.to) && !actual.includes(task.move.from));
    assert.equal(checkWeekly(task,actual,calendarAnswer(task)),null);
    if(i===0) {
      const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(Weekly,{task,status,onAnswer(){}}));
      assert.equal((render("ask").match(/aria-pressed="true"/g)??[]).length,0);
      assert.equal((render("reveal").match(/aria-pressed="true"/g)??[]).length,actual.length);
      assert.ok(render("reveal").includes(task.solution));
    }
  }
}
const selectFirst=mock.method(Math,"random",()=>0);
try {
  const task=weekly(2);
  assert.equal(actualDays(task).length,1);
  assert.ok(task.solution.startsWith("Der tatsächliche Termin ist "));
} finally { selectFirst.mock.restore(); }
