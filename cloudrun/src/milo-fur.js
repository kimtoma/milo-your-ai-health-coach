import * as THREE from 'three';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';

export const HEAD_DEFORM=`
uniform float uHeadTilt;
uniform float uHeadTurn;
vec3 rotateHead(vec3 p, bool isNormal){
  float weight=smoothstep(1.43,1.92,p.y);
  vec3 q=isNormal?p:p-vec3(0.,1.6,0.);
  float c=cos(uHeadTilt*weight),s=sin(uHeadTilt*weight);
  q.xy=mat2(c,s,-s,c)*q.xy;
  c=cos(uHeadTurn*weight);s=sin(uHeadTurn*weight);
  q.xz=mat2(c,s,-s,c)*q.xz;
  return isNormal?q:q+vec3(0.,1.6,0.);
}`;

export const COAT_COLOR=`
vec3 coatColor(vec3 p){
  vec3 blue=vec3(.37,.59,.84);
  float belly=exp(-pow(p.x/.65,4.)-pow((p.y-.94)/.49,4.))*smoothstep(.25,.57,p.z);
  blue=mix(blue,vec3(.67,.82,.96),belly*.76);
  float cheek=exp(-pow((abs(p.x)-.48)/.19,2.)-pow((p.y-1.69)/.15,2.))*smoothstep(.20,.43,p.z);
  return mix(blue,vec3(.97,.50,.43),cheek*.79);
}`;

export function coatMaterial(uniforms,deform=false){
  const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nvarying vec3 vCoat;\n${deform?HEAD_DEFORM:''}`).replace('#include <begin_vertex>',`#include <begin_vertex>\nvCoat=position;${deform?'transformed=rotateHead(transformed,false);':''}`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vCoat;\n${COAT_COLOR}`).replace('#include <color_fragment>',`#include <color_fragment>\ndiffuseColor.rgb=coatColor(vCoat);`);
  };
  material.customProgramCacheKey=()=>`milo-coat-${deform}`;
  return material;
}

export function createFur(mesh,count,length,uniforms,deform=false){
  const segments=5,positions=[],indices=[];
  for(let i=0;i<=segments;i++)positions.push(-1,i/segments,0,1,i/segments,0);
  for(let i=0;i<segments;i++){const v=i*2;indices.push(v,v+1,v+2,v+1,v+3,v+2);}
  const geometry=new THREE.InstancedBufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
  const roots=new Float32Array(count*3),normals=new Float32Array(count*3),seeds=new Float32Array(count),lengths=new Float32Array(count);
  const sampler=new MeshSurfaceSampler(mesh).build(),p=new THREE.Vector3(),n=new THREE.Vector3();
  for(let i=0;i<count;i++){
    sampler.sample(p,n);roots.set(p.toArray(),i*3);normals.set(n.normalize().toArray(),i*3);seeds[i]=Math.random()*6.283;lengths[i]=length*(.68+Math.random()*.56);
    if(deform&&p.z>.3&&p.y>1.65&&p.y<2.08&&Math.abs(p.x)<.39)lengths[i]*=.3;
  }
  geometry.setAttribute('aRoot',new THREE.InstancedBufferAttribute(roots,3));geometry.setAttribute('aNormal',new THREE.InstancedBufferAttribute(normals,3));geometry.setAttribute('aSeed',new THREE.InstancedBufferAttribute(seeds,1));geometry.setAttribute('aLength',new THREE.InstancedBufferAttribute(lengths,1));geometry.instanceCount=count;
  const material=new THREE.ShaderMaterial({
    uniforms,side:THREE.DoubleSide,alphaToCoverage:false,
    vertexShader:`
      attribute vec3 aRoot;attribute vec3 aNormal;attribute float aSeed;attribute float aLength;
      uniform float uTime;uniform float uPetStrength;uniform vec3 uPetPoint;uniform vec3 uPetForce;uniform float uFurLength;
      varying vec3 vColor;varying float vAcross;varying float vHeight;varying vec3 vNormal;varying vec3 vWorld;
      ${deform?HEAD_DEFORM:''}
      ${COAT_COLOR}
      void main(){
        float t=position.y;vec3 root=aRoot;vec3 normal=aNormal;
        ${deform?'root=rotateHead(root,false);vec3 tip=rotateHead(aRoot+aNormal*.01,false);normal=normalize(tip-root);':''}
        vec3 worldRoot=(modelMatrix*vec4(root,1.)).xyz;
        vec3 worldNormal=normalize(mat3(modelMatrix)*normal);
        vec3 tangent=normalize(cross(normal,abs(normal.y)>.95?vec3(1.,0.,0.):vec3(0.,1.,0.)));
        vec3 bitangent=cross(normal,tangent);
        float hairLength=aLength*uFurLength;
        vec3 wave=tangent*sin(aSeed+uTime*1.4+root.y*5.)+bitangent*cos(aSeed*1.3+uTime*1.1);
        vec3 groom=vec3(normal.x*.13,-.22,normal.z*.1);
        vec3 local=root+normal*hairLength*t+(wave*.10+groom)*hairLength*t*t;
        vec3 world=(modelMatrix*vec4(local,1.)).xyz;
        float brush=exp(-dot(worldRoot-uPetPoint,worldRoot-uPetPoint)*7.5)*uPetStrength;
        world+=uPetForce*brush*t*t*.105;
        vec3 view=normalize(cameraPosition-world);
        vec3 right=cross(worldNormal,view);right=length(right)<.001?vec3(1.,0.,0.):normalize(right);
        float width=.0021*(.7+.3*sin(aSeed))*(1.-pow(t,1.4))+.00008;
        world+=right*position.x*width;
        vColor=coatColor(aRoot)*(.78+.22*t)*(.93+.07*sin(aSeed*8.));
        vNormal=worldNormal;vWorld=world;vAcross=position.x;vHeight=t;
        gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
      }`,
    fragmentShader:`
      varying vec3 vColor;varying float vAcross;varying float vHeight;varying vec3 vNormal;varying vec3 vWorld;
      void main(){
        float cover=1.-smoothstep(.35,1.,abs(vAcross));if(cover<.45)discard;
        vec3 normal=normalize(vNormal);vec3 view=normalize(cameraPosition-vWorld);
        float key=max(0.,dot(normal,normalize(vec3(-3.,5.,4.))));
        float fill=max(0.,dot(normal,normalize(vec3(3.,1.,2.))));
        float scatter=pow(1.-max(0.,dot(normal,view)),3.)*.24;
        vec3 color=vColor*(.57+key*.42+fill*.14)+vec3(.48,.69,.95)*scatter;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const fur=new THREE.Mesh(geometry,material);fur.frustumCulled=false;fur.name='Milo GPU plush fibres';mesh.add(fur);
  // The sampled roots already use the parent's local coordinates.
  fur.position.set(0,0,0);fur.scale.set(1,1,1);
  return fur;
}
