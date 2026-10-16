import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoRecords,demoRecordForLanguage} from './demo.js';
import {buildReport} from './report.js';
const now=new Date('2026-10-16T05:00:00Z');
test('judging samples cover thirty days and every item is explicitly synthetic',()=>{
  const records=createDemoRecords(now);
  assert.equal(records.length,116);assert.equal(new Set(records.map(r=>r.id)).size,116);
  assert.ok(records.every(r=>r.demo&&new Date(r.date)<=now));
  const report=buildReport(records.map(r=>demoRecordForLanguage(r,'ko')),30,now);
  assert.equal(report.recordedDays,30);assert.equal(report.weights.length,30);assert.equal(report.injections.length,5);
  assert.equal(report.selected.length,115);assert.equal(report.meals.length,30);assert.equal(report.activities.length,20);
  assert.equal(report.symptomMissing,4);assert.equal(report.symptomNoted,3);assert.equal(report.symptomNone,23);
  assert.ok(Math.abs(report.weightChange+1.57)<1e-9);
});
test('demo localization preserves source samples and ordinary user data',()=>{
  const raw=createDemoRecords(now);const meal=raw.find(r=>r.kind==='meal');
  const en=demoRecordForLanguage(meal,'en');const ko=demoRecordForLanguage(meal,'ko');
  assert.equal(en.foods,'Brown rice, chicken and vegetables');assert.equal(ko.foods,'현미밥, 닭가슴살, 나물');
  assert.equal(meal.foods,undefined);
  const own={kind:'meal',foods:'내가 입력한 음식'};assert.equal(demoRecordForLanguage(own,'en'),own);
  const report=buildReport(raw.map(r=>demoRecordForLanguage(r,'en')),30,now);
  assert.equal(report.symptomNone,23);assert.equal(report.injections[0].dose,'2.5');
});
test('report never fills in absent durations, symptoms or weight values',()=>{
  const r=buildReport([{kind:'activity',date:now.toISOString(),minutes:null},{kind:'checkin',date:now.toISOString(),symptoms:null}],30,now);
  assert.equal(r.knownDurations.length,0);assert.equal(r.firstWeight,null);assert.equal(r.weightChange,null);
  assert.equal(r.symptomMissing,1);assert.equal(r.symptomNone,0);assert.equal(r.demo,false);
});
