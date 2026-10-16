import test from 'node:test';
import assert from 'node:assert/strict';
import {setLanguage,tr,html,locale,weekdayLabel} from './i18n.js';
import {titleFor,detailFor,visitSummary} from './presentation.js';

test('language switches authored copy while preserving interpolated user text',()=>{
  setLanguage('en');
  assert.equal(tr('기록'),'Records');assert.equal(locale(),'en-US');
  assert.equal(html`<b>오늘의 기록</b><p>${'나의 기록은 저장'}</p>`,'<b>Today’s records</b><p>나의 기록은 저장</p>');
  assert.equal(html`<h2>최근 ${30}일 기록 요약</h2>`,'<h2>Records from the last 30 days</h2>');
  assert.equal(weekdayLabel('금'),'Friday');
  setLanguage('ko');assert.equal(tr('기록'),'기록');assert.equal(locale(),'ko-KR');
  assert.equal(html`<h2>최근 ${30}일 기록 요약</h2>`,'<h2>최근 30일 기록 요약</h2>');
});
test('English record presentation preserves medicine, exact dose and user notes',()=>{
  setLanguage('en');
  const r={kind:'injection',date:'2026-10-15T03:00:00Z',medication:'사용자가 입력한 약 이름',dose:'2.375',site:'복부 왼쪽',note:'기록 저장'};
  assert.equal(titleFor(r),'사용자가 입력한 약 이름 2.375 mg');
  assert.equal(detailFor(r),'Left abdomen · 기록 저장');
  const s=visitSummary([r],30,new Date('2026-10-16T03:00:00Z'));
  assert.match(s.lines.join(' '),/사용자가 입력한 약 이름 2.375 mg/);
  setLanguage('ko');assert.match(detailFor(r),/복부 왼쪽/);
});
