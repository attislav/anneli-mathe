import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {newSurvey,surveyCounts,surveyMove,surveyPrompt,surveyResult,surveyThemes,type LocalSurvey,type SurveyMove} from "../src/game/partnerSurvey";
import {PartnerSurveyView} from "../src/screens/PartnerSurvey";

function moves(start:LocalSurvey,...actions:SurveyMove[]) {return actions.reduce(surveyMove,start);}
const render=(s:LocalSurvey)=>renderToStaticMarkup(createElement(PartnerSurveyView,{s,act(){},onBack(){}}));
for(const theme of Object.keys(surveyThemes) as (keyof typeof surveyThemes)[]) {
  const [a,b]=surveyThemes[theme].options;
  const initial=moves(newSurvey(),{type:"theme",value:theme},{type:"item",value:a},{type:"item",value:b},{type:"start"});
  assert.equal(initial.phase,"collect");
  assert.deepEqual(surveyCounts(initial),[0,0]);
  assert.equal(surveyMove(initial,{type:"makeQuestion"}),initial);
  const one=moves(initial,{type:"vote",side:0},{type:"vote",side:1},{type:"undo"});
  assert.deepEqual(surveyCounts(one),[1,0]);
  assert.ok(render(one).includes("1 Stimme") && render(one).includes("0 Stimmen"));
  for(const state of [one,moves(one,{type:"vote",side:1})]) {
    for(const kind of ["first","second","difference","tie"] as const) {
      const author=moves(state,{type:"makeQuestion"},{type:"kind",value:kind});
      const different=surveyCounts(state)[1]===0;
      const expected=kind==="tie"?(different?"Nein":"Ja"):kind==="difference"?(different?"1":"0"):kind==="first"?"1":different?"0":"1";
      assert.equal(surveyResult(author),expected);
      const invalid=kind==="tie"?"1":"Nein";
      assert.equal(surveyMove(author,{type:"answer",value:invalid}),author);
      const wrong=moves(author,{type:"answer",value:kind==="tie"?(expected==="Ja"?"Nein":"Ja"):"99"},{type:"check"});
      assert.equal(wrong.phase,"author"); assert.ok(wrong.message);
      const pass=moves(wrong,{type:"answer",value:expected},{type:"check"});
      assert.equal(pass.phase,"pass");assert.equal(pass.input,"");
      const hidden=render(pass);
      assert.ok(!hidden.includes(surveyThemes[theme].title)&&!hidden.includes(surveyPrompt(author))&&!hidden.includes("<input")&&!hidden.includes("aria-pressed"));
      const solver=moves(pass,{type:"open"});
      assert.equal(solver.input,"");assert.ok(render(solver).includes(surveyPrompt(author)));
      const done=moves(solver,{type:"answer",value:expected},{type:"check"});
      assert.equal(done.phase,"done");
      assert.deepEqual(moves(done,{type:"swap"}),newSurvey());
    }
  }
}
