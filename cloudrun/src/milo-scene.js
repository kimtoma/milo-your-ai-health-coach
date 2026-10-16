import * as THREE from 'three';
import {poseAt,easePose} from './milo-motion.js';
import {createMiloForm,frontSurface} from './milo-form.js';
import {createFur,coatMaterial} from './milo-fur.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export function createMiloScene(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.setClearColor(0,0);
  const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-1.9,1.9,1.65,-1.65,.1,30);
  camera.position.set(0,1.9,7);camera.lookAt(0,1.4,0);
  scene.add(new THREE.AmbientLight(0xd6ebff,.48));
  scene.add(new THREE.HemisphereLight(0xe8f4ff,0xb1cce5,1.65));
  for(const [color,intensity,xyz] of [[0xfff6ef,1.5,[-3,5,4]],[0xc5e6ff,.7,[3,2,3]],[0xe4efff,1.3,[1,4,-3]]]){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...xyz);scene.add(l);}
  const root=new THREE.Group();scene.add(root);const rig=new THREE.Group();root.add(rig);
  const uniforms={uTime:{value:0},uHeadTilt:{value:0},uHeadTurn:{value:0},uPetStrength:{value:0},uPetPoint:{value:V(0,1.6,1)},uPetForce:{value:V(0,0,0)},uFurLength:{value:1}};
  const skin=[];const fibres=[];
  const small=matchMedia('(max-width:599px)').matches;
  function plush(parent,geometry,count,length,deform=false){const mesh=new THREE.Mesh(geometry,coatMaterial(uniforms,deform));parent.add(mesh);skin.push(mesh);fibres.push(createFur(mesh,count,length,uniforms,deform));return mesh;}
  const body=plush(rig,createMiloForm(),small?19000:34000,.023,true);
  function ovalGeometry(position,scale){const g=new THREE.SphereGeometry(1,36,24);g.scale(...scale);g.translate(...position);return g;}
  const arms=[];for(const side of [-1,1]){const pivot=new THREE.Group();pivot.position.set(side*.76,1.35,0);rig.add(pivot);plush(pivot,ovalGeometry([side*.07,-.24,.06],[.22,.34,.24]),small?1600:2700,.019);arms.push(pivot);}
  const feet=[];for(const side of [-1,1]){const pivot=new THREE.Group();pivot.position.set(side*.34,.16,.05);rig.add(pivot);plush(pivot,ovalGeometry([0,0,.10],[.265,.15,.32]),small?700:1300,.014);feet.push(pivot);}

  const face=new THREE.Group();face.position.y=1.6;rig.add(face);
  const dark=new THREE.MeshPhysicalMaterial({color:0x182b46,roughness:.22,clearcoat:1,clearcoatRoughness:.1});
  const white=new THREE.MeshBasicMaterial({color:0xffffff});const smileMaterial=new THREE.MeshStandardMaterial({color:0x25344b,roughness:.6});
  const inner=new THREE.MeshStandardMaterial({color:0x63374e,roughness:.9}),pink=new THREE.MeshStandardMaterial({color:0xf5909d,roughness:.9});
  const sphere=new THREE.SphereGeometry(1,28,20);
  function ball(parent,mat,pos,size){const o=new THREE.Mesh(sphere,mat);o.position.set(...pos);o.scale.set(...size);parent.add(o);return o;}
  const eyes=[],closedEyes=[],brows=[];
  function line(points,radius=.014,mat=smileMaterial){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,radius,8,false),mat);}
  for(const side of [-1,1]){
    const x=side*.255,y=1.95,z=frontSurface(x,y)+.016;
    const eye=new THREE.Group();eye.position.set(x,y-1.6,z);eye.rotation.y=side*.25;face.add(eye);
    ball(eye,dark,[0,0,0],[.078,.109,.039]);ball(eye,white,[-.014,.039,.034],[.018,.024,.006]);ball(eye,white,[.018,-.036,.033],[.007,.009,.004]);eyes.push(eye);
    const closed=line([V(-.061,-.015,0),V(-.03,.023,.003),V(.01,.030,.005),V(.059,-.013,0)],.013);closed.position.copy(eye.position);closed.position.z+=.018;closed.rotation.y=side*.25;closed.visible=false;face.add(closed);closedEyes.push(closed);
    const brow=line([V(-.045,0,0),V(0,.010,0),V(.045,0,0)],.010);brow.position.set(x,.51,frontSurface(x,2.11)+.02);brow.visible=false;face.add(brow);brows.push(brow);
  }
  const mouth=new THREE.Group();mouth.position.set(0,.16,frontSurface(0,1.76)+.02);face.add(mouth);
  mouth.add(line([V(-.105,.02,-.008),V(-.065,-.018,0),V(0,-.035,.005),V(.065,-.018,0),V(.105,.02,-.008)],.014));
  const openMouth=new THREE.Group();openMouth.position.copy(mouth.position);face.add(openMouth);ball(openMouth,inner,[0,0,0],[.095,.081,.025]);ball(openMouth,pink,[0,-.036,.023],[.063,.025,.006]);

  const bandage=new THREE.Group();bandage.position.set(.36,.70,frontSurface(.36,.70)+.025);rig.add(bandage);
  const tan=new THREE.MeshStandardMaterial({color:0xf0c094,roughness:1});
  for(const angle of [-.72,.72]){const g=new THREE.CapsuleGeometry(.045,.22,4,12);g.scale(1,1,.22);const patch=new THREE.Mesh(g,tan);patch.rotation.z=angle;patch.position.z=angle>0?.012:0;bandage.add(patch);}
  const bowl=new THREE.Group();bowl.position.set(-.10,1.13,.81);rig.add(bowl);
  const cream=new THREE.MeshStandardMaterial({color:0xf5dfb4,roughness:.85});
  bowl.add(new THREE.Mesh(new THREE.SphereGeometry(.28,32,16,0,Math.PI*2,Math.PI/2,Math.PI/2),cream));
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.28,.022,10,40),cream);rim.rotation.x=Math.PI/2;bowl.add(rim);
  const rice=new THREE.Mesh(new THREE.CylinderGeometry(.253,.253,.018,32),new THREE.MeshStandardMaterial({color:0xffefcc,roughness:1}));rice.position.y=-.015;bowl.add(rice);
  const foodMats=[0x76ac57,0xf3a54c,0xe56f62,0xb0cf6e].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
  for(let i=0;i<22;i++){const a=i*2.4,r=Math.sqrt(i/22)*.22;ball(bowl,foodMats[i%4],[Math.cos(a)*r,.012,Math.sin(a)*r],[.038,.028,.035]);}
  const mealPaws=[new THREE.Group(),new THREE.Group()];mealPaws.forEach(paw=>{rig.add(paw);plush(paw,ovalGeometry([0,0,0],[.15,.15,.15]),600,.014);});
  const spoon=new THREE.Group();rig.add(spoon);const spoonMat=new THREE.MeshStandardMaterial({color:0xcfc9b9,roughness:.6});
  const handle=new THREE.Mesh(new THREE.CapsuleGeometry(.017,.22,3,10),spoonMat);handle.rotation.z=-.45;spoon.add(handle);ball(spoon,spoonMat,[-.07,.15,0],[.055,.024,.078]);

  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const grad=ctx.createRadialGradient(64,64,4,64,64,64);grad.addColorStop(0,'rgba(55,89,128,.20)');grad.addColorStop(.5,'rgba(55,89,128,.08)');grad.addColorStop(1,'rgba(55,89,128,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.7),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;scene.add(shadow);
  let yaw=-.09,targetYaw=-.09,gaze={x:0,y:0},targetGaze={x:0,y:0},pose=poseAt('idle',0),last=0,tapAt=-100;
  const targetForce=V(0,0,0);const raycaster=new THREE.Raycaster();let petEnergy=0;
  function render(seconds,mood,reduced){
    const dt=last?Math.min(seconds-last,.1):.033;last=seconds;const target=poseAt(mood,seconds,reduced);const p=reduced?Object.assign(pose,target):easePose(pose,target,dt);
    yaw+=(targetYaw-yaw)*(reduced?1:1-Math.exp(-dt*12));gaze.x+=(targetGaze.x-gaze.x)*.08;gaze.y+=(targetGaze.y-gaze.y)*.08;
    const tap=reduced?0:Math.max(0,1-(seconds-tapAt)/.8)*Math.sin((seconds-tapAt)*12)*.035;
    root.rotation.y=yaw;rig.position.y=p.lift;rig.rotation.z=p.lean;rig.scale.set(1-tap*.45,p.squash+tap,1-tap*.45);
    uniforms.uHeadTilt.value=p.head;uniforms.uHeadTurn.value=p.headY+gaze.x*.075;
    face.rotation.z=p.head;face.rotation.y=p.headY+gaze.x*.075;
    arms[0].scale.set(1,1,1);arms[1].scale.set(1,1,1);arms[0].rotation.set(p.armLX,0,p.armL);arms[1].rotation.set(p.armRX,0,p.armR);feet[0].rotation.x=p.legL;feet[1].rotation.x=p.legR;
    const blink=reduced?1:Math.min(1,Math.abs(Math.sin(seconds*.74))*24);eyes.forEach(e=>{e.scale.y=Math.max(.06,blink)*(1-p.closed);e.visible=p.closed<.8;});closedEyes.forEach(e=>e.visible=p.closed>=.8);
    brows.forEach((b,i)=>{b.visible=mood==='comfort'||mood==='thinking';b.rotation.z=(i===0?-1:1)*p.brow*.6;});
    mouth.scale.y=p.smile;mouth.visible=p.open<.5;openMouth.visible=p.open>=.5;
    bandage.visible=mood==='injection';bowl.visible=spoon.visible=mood==='meal';
    mealPaws.forEach(paw=>paw.visible=p.holding>.05);
    if(p.holding>.01){const scoop=reduced?.35:(Math.sin(seconds*2.7)+1)/2;spoon.position.set(.30,1.16+scoop*.46,.88-scoop*.17);spoon.rotation.z=-.1+scoop*.3;
      const targets=[V(-.36,1.10,.81),V(.32,spoon.position.y-.10,spoon.position.z)];
      targets.forEach((target,i)=>{const direction=target.clone().sub(arms[i].position);const q=new THREE.Quaternion().setFromUnitVectors(V(0,-1,0),direction.clone().normalize());arms[i].quaternion.slerp(q,p.holding);arms[i].scale.set(1-p.holding*.28,1+(direction.length()/.61-1)*p.holding,1-p.holding*.28);mealPaws[i].position.copy(target);});
    }
    uniforms.uTime.value=reduced?0:seconds;uniforms.uPetForce.value.lerp(targetForce,1-Math.exp(-dt*10));targetForce.multiplyScalar(Math.exp(-dt*5));petEnergy*=Math.exp(-dt*2.7);uniforms.uPetStrength.value=reduced?0:petEnergy;
    shadow.material.opacity=1-p.lift*.7;renderer.render(scene,camera);
  }
  function cast(x,y){raycaster.setFromCamera(new THREE.Vector2(x,y),camera);return raycaster.intersectObjects(skin.filter(mesh=>mesh.visible&&mesh.parent.visible),false)[0];}
  return {
    render,
    resize(width,height){if(width<1||height<1)return;renderer.setSize(width,height,false);const hh=1.77;camera.left=-hh*width/height;camera.right=hh*width/height;camera.top=hh;camera.bottom=-hh;camera.updateProjectionMatrix();},
    hit(x,y){return !!cast(x,y);},
    pet(x,y,dx=0,dy=0){const hit=cast(x,y);if(!hit)return;uniforms.uPetPoint.value.copy(hit.point);targetForce.set(dx*8,dy*8,.18).clampLength(0,1.6);petEnergy=1;},
    rotate(delta){targetYaw+=delta;},reset(){targetYaw=-.09;targetGaze={x:0,y:0};},gaze(x,y){targetGaze={x:Math.max(-1,Math.min(1,x)),y:Math.max(-1,Math.min(1,y))};},tap(seconds){tapAt=seconds;},
    dispose(){const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());shadowTexture.dispose();renderer.dispose();renderer.forceContextLoss();}
  };
}
