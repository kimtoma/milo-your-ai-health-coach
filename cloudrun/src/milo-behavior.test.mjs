import test from 'node:test';
import assert from 'node:assert/strict';
import {conversationMoods,moodForRecord} from './milo-behavior.js';
import {createDemoRecords,demoRecordForLanguage} from './demo.js';

test('Completed activities select their own animation in message order',()=>{
  assert.deepEqual(conversationMoods('오늘 20분 걸었고 점심을 먹었어. 주사를 맞았어.'),['walk','meal','injection']);
  assert.deepEqual(conversationMoods('I ate lunch and walked for 20 minutes.'),['meal','walk']);
  assert.deepEqual(conversationMoods('I got my injection today.'),['injection']);
  assert.deepEqual(conversationMoods('내일 주사를 맞아야 할까요?'),['listening']);
  assert.deepEqual(conversationMoods('I walked today but I am worried.'),['comfort']);
  assert.equal(moodForRecord({kind:'injection'}),'injection');
  assert.equal(moodForRecord({kind:'plan'}),'listening');
});
test('Existing synthetic meals gain bundled photos while text-only and personal records stay distinct',()=>{
  const source=createDemoRecords();const meals=source.filter(r=>r.kind==='meal');
  const localized=meals.map(r=>demoRecordForLanguage(r,'en'));
  assert.ok(localized.some(r=>r.photo?.synthetic));assert.ok(localized.some(r=>!r.photo));
  assert.ok(localized.filter(r=>r.photo).every(r=>r.photo.src.startsWith('/assets/demo-meals/')&&r.photo.alt.startsWith('Example')));
  assert.ok(meals.every(r=>!r.photo));
  assert.deepEqual(source.map(r=>r.id),source.map(r=>demoRecordForLanguage(r,'en').id));
  const personal={id:'mine',kind:'meal',foods:'My own meal'};assert.equal(demoRecordForLanguage(personal,'en'),personal);
});
