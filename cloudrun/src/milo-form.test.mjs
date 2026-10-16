import test from 'node:test';
import assert from 'node:assert/strict';
import {createMiloForm,miloDistance,frontSurface} from './milo-form.js';

test('The plush form has a continuous body, head and tail with finite smooth normals',()=>{
  for(const point of [[0,.86,0],[0,1.94,0],[0,.63,-.85]])assert.ok(miloDistance(...point)<0);
  const face=frontSurface(.255,1.95);assert.ok(face>.4&&face<.8);
  const geometry=createMiloForm();const positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal');
  assert.ok(positions.count>10000);assert.equal(positions.count,normals.count);
  for(let i=0;i<normals.count;i++){
    const length=Math.hypot(normals.getX(i),normals.getY(i),normals.getZ(i));
    assert.ok(Number.isFinite(positions.getX(i))&&Number.isFinite(positions.getY(i))&&Number.isFinite(positions.getZ(i)));
    assert.ok(length>.99&&length<1.01);
  }
  geometry.dispose();
});
