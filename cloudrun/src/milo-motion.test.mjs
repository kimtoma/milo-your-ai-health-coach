import test from 'node:test';
import assert from 'node:assert/strict';
import {MOODS,poseAt,easePose,conversationMood} from './milo-motion.js';

test('Every pose stays finite across frames and reduced motion has no time-dependent movement',()=>{
  for(const mood of MOODS){
    for(const time of [0,.1,1,5,100000])for(const value of Object.values(poseAt(mood,time)))assert.ok(Number.isFinite(value),mood);
    assert.deepEqual(poseAt(mood,0,true),poseAt(mood,100,true),mood);
  }
});
test('Transitions remain bounded after a suspended tab and converge to the next pose',()=>{
  const current=poseAt('idle',0,true),target=poseAt('stretch',0,true);
  easePose(current,target,10000);
  assert.ok(current.armR>0&&current.armR<target.armR);
  for(let frame=0;frame<100;frame++)easePose(current,target,1/30);
  assert.ok(Math.abs(current.armR-target.armR)<.0001);
});
test('Comfort takes precedence over exercise in both supported languages',()=>{
  assert.equal(conversationMood('I walked today but I feel anxious'),'comfort');
  assert.equal(conversationMood('산책을 했는데 너무 힘들어요'),'comfort');
  assert.equal(conversationMood('I walked for twenty minutes'),'walk');
  assert.equal(conversationMood('오늘 산책했어요'),'walk');
  assert.equal(conversationMood('Hello Milo'),'listening');
});
