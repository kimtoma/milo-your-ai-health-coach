import * as THREE from 'three';
import {MarchingCubes} from 'three/addons/objects/MarchingCubes.js';

function ellipsoid(x,y,z,cx,cy,cz,rx,ry,rz){
  x-=cx;y-=cy;z-=cz;
  const a=Math.sqrt(x*x/(rx*rx)+y*y/(ry*ry)+z*z/(rz*rz));
  const b=Math.sqrt(x*x/(rx**4)+y*y/(ry**4)+z*z/(rz**4));
  return b<.00001?-Math.min(rx,ry,rz):a*(a-1)/b;
}
function blend(a,b,k){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;}

export function miloDistance(x,y,z){
  let d=ellipsoid(x,y,z,0,.86,0,.94,.67,.70);
  d=blend(d,ellipsoid(x,y,z,0,1.94,-.015,.83,.56,.61),.095);
  d=blend(d,ellipsoid(x,y,z,-.44,1.70,.105,.415,.265,.49),.12);
  d=blend(d,ellipsoid(x,y,z,.44,1.70,.105,.415,.265,.49),.12);
  d=blend(d,ellipsoid(x,y,z,  .015,2.52,-.02,.105,.20,.105),.075);
  d=blend(d,ellipsoid(x,y,z,-.055,2.68,-.005,.105,.105,.105),.06);
  d=blend(d,ellipsoid(x,y,z,-.13,2.69,.005,.070,.075,.075),.055);
  d=blend(d,ellipsoid(x,y,z,0,.53,-.55,.29,.28,.33),.16);
  d=blend(d,ellipsoid(x,y,z,0,.63,-.80,.22,.25,.31),.12);
  d=blend(d,ellipsoid(x,y,z,0,.81,-.99,.13,.20,.18),.10);
  return d;
}

export function frontSurface(x,y){
  let inside=0,outside=1.15;
  for(let i=0;i<22;i++){const z=(inside+outside)/2;if(miloDistance(x,y,z)<0)inside=z;else outside=z;}
  return (inside+outside)/2;
}

export function createMiloForm(){
  const resolution=68;
  const field=new MarchingCubes(resolution,new THREE.MeshBasicMaterial(),false,false,35000);field.isolation=0;
  for(let z=0;z<resolution;z++)for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
    field.field[x+y*resolution+z*resolution*resolution]=-miloDistance((x/resolution*2-1)*1.25,(y/resolution*2-1)*1.6+1.4,(z/resolution*2-1)*1.25);
  }
  field.update();
  const count=field.count;
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(field.geometry.attributes.position.array.slice(0,count*3),3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(field.geometry.attributes.normal.array.slice(0,count*3),3));
  geometry.scale(1.25,1.6,1.25);geometry.translate(0,1.4,0);geometry.normalizeNormals();
  field.geometry.dispose();field.material.dispose();
  return geometry;
}
