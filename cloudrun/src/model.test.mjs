import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRecord,visitSummary,detailFor,weightValue} from './model.js';

const now=new Date('2026-10-16T03:00:00Z');
const date='2026-10-15T03:00:00Z';

test('dose precision and an injection snapshot survive a later plan',()=>{
  const dose=validateRecord('injection',{date,medication:'마운자로',dose:'2.375',site:'복부 오른쪽'},'kg',now);
  const plan=validateRecord('plan',{date,medication:'위고비',dose:'0.25'},'kg',now);
  assert.equal(dose.dose,'2.375');assert.equal(dose.medication,'마운자로');
  const summary=visitSummary([dose,plan],30,now);
  assert.equal(summary.injections.length,1);assert.equal(summary.injections[0].medication,'마운자로');
});
test('missing symptoms stay different from an explicit none',()=>{
  const absent=validateRecord('checkin',{date,energy:'3'},'kg',now);
  const none=validateRecord('checkin',{date,symptoms:'없음'},'kg',now);
  assert.equal(absent.symptoms,null);assert.equal(none.symptoms,'없음');
  assert.match(detailFor(absent),/증상 미기록/);assert.doesNotMatch(detailFor(none),/미기록/);
});
test('an optional schedule dose stays missing and never becomes an injection',()=>{
  const plan=validateRecord('plan',{date,medication:'안내받은 약',dose:'',weekday:'금',time:'20:30'},'kg',now);
  assert.equal(plan.dose,null);assert.match(detailFor(plan),/용량 미기록.*금요일.*20:30/);
  assert.equal(visitSummary([plan],30,now).injections.length,0);
  assert.throws(()=>validateRecord('plan',{date,medication:'약',time:'25:00'},'kg',now));
});
test('invalid values and future records cannot be saved',()=>{
  for(const dose of ['', 'abc','0','-1'])assert.throws(()=>validateRecord('injection',{date,medication:'약',dose},'kg',now));
  assert.throws(()=>validateRecord('weight',{date:'2026-10-17T00:00:00Z',weight:'70'},'kg',now));
  assert.throws(()=>validateRecord('checkin',{date,energy:'6'},'kg',now));
});
test('lb display converts stored kilograms without changing the record',()=>{
  const r=validateRecord('weight',{date,weight:'154.323583526'},'lb',now);
  assert.ok(Math.abs(r.kg-70)<0.00001);assert.equal(weightValue(r.kg,'kg'),'70');
});
test('an empty journal never produces seeded health facts',()=>{
  const s=visitSummary([],30,now);assert.equal(s.selected.length,0);
  assert.match(s.lines.join(' '),/기록 없음/);assert.doesNotMatch(s.lines.join(' '),/5mg|6,420|28g|78.3/);
});
