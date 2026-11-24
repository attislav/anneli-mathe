import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { appointments, freeQuarters, sharedTime, timeRange, transferFits, validStarts } from "../src/game/sharedTime";
import { SharedTime } from "../src/lesson/SharedTime";

const outcomes = new Set<string>();
let crossedHour = false;
for (const level of [1,2,3,4,5] as const) for (const seed of [0,.32,.51,.81,.99]) {
  const random = Math.random;
  let task: ReturnType<typeof sharedTime>;
  try { Math.random = () => seed; task = sharedTime(level); } finally { Math.random = random; }
  const before = validStarts(task,false), after = validStarts(task,true);
  assert.ok(before.length);
  assert.notEqual(task.movedStart,task.plans[task.movedPerson][0].start);
  for (const changed of [false,true]) {
    const events = ([0,1] as const).flatMap(person => appointments(task, person, changed));
    const oracle = Array.from({length:task.slots - task.duration + 1},(_,start) => start)
      .filter(start => events.every(event => event.start >= start + task.duration || event.start + event.length <= start));
    assert.deepEqual(validStarts(task,changed),oracle);
    for (const start of oracle) {
      const minutes = task.start + start * 15;
      if (Math.floor(minutes / 60) !== Math.floor((minutes + task.duration * 15 - 1) / 60)) crossedHour = true;
    }
  }
  for (const start of before) {
    outcomes.add(after.includes(start) ? "keep" : after.length ? "move" : "none");
    assert.equal(transferFits(task,start,true,null),after.includes(start));
    assert.equal(transferFits(task,start,false,null),after.length === 0);
    for(let next=0; next<task.slots; next++) assert.equal(transferFits(task,start,false,next), !after.includes(start) && after.includes(next));
  }
  const full = {...task,id:"test",level,skillId:"gemeinsameZeit"};
  for(const status of ["ask","reveal"] as const){
    const html=renderToStaticMarkup(createElement(SharedTime,{task:full,status,onAnswer:()=>{}}));
    assert.ok(html.includes("Mila") && html.includes("Ben"));
    assert.equal(html.includes('type="checkbox"'),status==="ask");
    if(status==="reveal") assert.ok(html.includes(timeRange(task,before[0],task.duration)));
  }
}
assert.deepEqual(outcomes,new Set(["keep","move","none"]));
assert.ok(crossedHour);
const fixture = {...sharedTime(3), slots:6, duration:2, movedPerson:0 as const, movedStart:2,
  plans:[[{name:"Flöte",start:1,length:1}],[{name:"Training",start:4,length:1}]] as ReturnType<typeof sharedTime>["plans"]};
assert.deepEqual(freeQuarters(fixture,false),[0,2,3,5]);
assert.deepEqual(validStarts(fixture,false),[2]);
assert.deepEqual(validStarts(fixture,true),[0]);

