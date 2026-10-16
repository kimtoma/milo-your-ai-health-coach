import {MOODS} from './milo-motion.js';

const COPY={
  ko:{touch:'Milo와 인사하기. 좌우 화살표 키로 회전할 수 있어요.',hint:'살짝 쓰다듬으면, 보송한 털이 따라 움직여요',loading:'Milo가 오고 있어요',fallback:'이 기기에서는 2D 마일로로 함께해요',retry:'3D 다시 켜기',idle:'당신의 속도로, 함께 있어요',wave:'안녕! 만나서 반가워요',listening:'편하게 이야기해요. 듣고 있어요',thinking:'이야기를 차분히 생각하고 있어요',comfort:'잠시 쉬어가도 괜찮아요',celebrate:'작은 기록도 소중한 한 걸음이에요',walk:'한 걸음씩, 나의 속도로',stretch:'잠깐, 기분 좋은 기지개',squat:'천천히, 하나씩 해봐요',meal:'한 끼의 이야기도 소중하게',injection:'주사 기록도 차분히, 함께',mealButton:'식사',injectionButton:'주사',waveButton:'인사',walkButton:'걷기',stretchButton:'기지개',squatButton:'스쿼트',reset:'정면 보기',pause:'동작 쉬기',resume:'동작 켜기'},
  en:{touch:'Say hello to Milo. Use the left and right arrow keys to turn.',hint:'Gently stroke Milo and watch the soft fur follow.',loading:'Milo is on the way',fallback:'Animated Milo is here on this device',retry:'Try 3D again',idle:'Here with you, at your pace',wave:'Hello! It is good to see you',listening:'Take your time. I am listening',thinking:'Taking a moment with your story',comfort:'It is okay to take a little break',celebrate:'Every little record is a step forward',walk:'One little step at a time',stretch:'A little stretch, a little reset',squat:'Slowly, one at a time',meal:'A little moment for your meal',injection:'Here for your injection records, too',mealButton:'Meal',injectionButton:'Injection',waveButton:'Hello',walkButton:'Walk',stretchButton:'Stretch',squatButton:'Squat',reset:'Face forward',pause:'Pause motion',resume:'Resume motion'}
};

const PATHS={
  wave:'M8 13V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v8c0 5-3 8-7 8-3 0-5-2-7-4l-3-4a2 2 0 0 1 3-2l2 2',
  walk:'M14 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M7 11l4-4 4 2 3 3m-7-5-1 7 5 3 1 5m-6-8-4 7',
  meal:'M5 3v7m3-7v7M3 7h7m-4 3v11M17 3c-4 3-4 8 0 8h2V3Zm2 8v10',
  injection:'m8 4 12 12-4 4L4 8Zm-2 2 12 12M8 16l8-8',
  stretch:'M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4M5 3l4 7h6l4-7M12 10v7m0 0-5 5m5-5 5 5',
  squat:'M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4M5 10h14m-7 0v6l5 2-3 4m-2-6-5 2 3 4',
  reset:'M4 10a8 8 0 1 1 1 7M4 4v6h6',pause:'M9 5v14M15 5v14',play:'M8 4l12 8-12 8Z'
};
const glyph=name=>`<svg class="companion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"></path></svg>`;

let sceneModule;
function loadScene(){return sceneModule??=import('./milo-scene.js').catch(error=>{sceneModule=null;throw error;});}

class MiloCompanion extends HTMLElement {
  static observedAttributes=['mood','lang','compact'];
  constructor(){super();this.baseMood='idle';this.activeMood='idle';this.paused=false;this.visible=true;this.frame=0;this.epoch=performance.now();this.motionUntil=0;this._onVisibility=()=>{this.updateLabels();this.updateLoop();};this._onMotion=()=>{this.dataset.reducedMotion=String(this.reduced.matches);this.updateLabels();this.updateLoop();this.draw();};}
  get copy(){return COPY[this.getAttribute('lang')==='en'?'en':'ko'];}
  connectedCallback(){queueMicrotask(()=>{if(!this.isConnected)return;if(this.scene){this.updateLabels();this.resize();this.updateLoop();return;}if(!this.built)this.build();if(!this.loading)this.start();});}
  disconnectedCallback(){queueMicrotask(()=>{if(!this.isConnected)this.dispose();});}
  attributeChangedCallback(name){if(name==='mood'){this.baseMood=MOODS.includes(this.getAttribute('mood'))?this.getAttribute('mood'):'idle';if(['thinking','comfort','celebrate'].includes(this.baseMood))this.motionUntil=0;}if(this.built){this.updateLabels();this.draw();}}
  build(){
    this.built=true;this.dataset.renderer='loading';
    this.innerHTML=`<div class="companion-stage"><button class="milo-touch" type="button"><img class="companion-fallback" src="/assets/milo-rounded.png" alt="" width="280" height="280"><canvas class="companion-canvas" aria-hidden="true"></canvas></button><div class="companion-tools"><button type="button" class="companion-reset">${glyph('reset')}</button><button type="button" class="companion-pause">${glyph('pause')}</button></div><button type="button" class="companion-retry" hidden></button></div><div class="companion-caption"><p class="companion-status" role="status" aria-live="polite"></p><p class="companion-hint"></p></div><div class="companion-actions" role="group">${['wave','walk','meal','injection'].map(m=>`<button type="button" data-motion="${m}" aria-pressed="false">${glyph(m)}<span class="motion-label"></span></button>`).join('')}</div>`;
    this.canvas=this.querySelector('canvas');this.touch=this.querySelector('.milo-touch');
    this.addEventListener('click',e=>{
      const motion=e.target.closest('[data-motion]');
      if(motion){this.play(motion.dataset.motion);return;}
      if(e.target.closest('.companion-reset')){this.scene?.reset();this.motionUntil=0;this.draw();return;}
      if(e.target.closest('.companion-pause')){this.paused=!this.paused;this.dataset.paused=String(this.paused);this.updateLabels();this.updateLoop();this.draw();return;}
      if(e.target.closest('.companion-retry')){this.start();return;}
      if(e.target.closest('.milo-touch')&&!this.dragged){this.scene?.tap((performance.now()-this.epoch)/1000);this.play('wave');}
    });
    this.touch.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.scene?.rotate(e.key==='ArrowLeft'?-.4:.4);this.draw();}if(e.key==='Home'){e.preventDefault();this.scene?.reset();this.draw();}});
    this.touch.addEventListener('pointerdown',e=>{this.down={x:e.clientX,y:e.clientY,last:e.clientX,lastY:e.clientY,id:e.pointerId};this.dragged=false;});
    this.touch.addEventListener('pointermove',e=>{
      const bounds=this.touch.getBoundingClientRect();this.scene?.pet((e.clientX-bounds.left)/bounds.width*2-1,1-(e.clientY-bounds.top)/bounds.height*2);this.scene?.gaze((e.clientX-bounds.left)/bounds.width*2-1,1-(e.clientY-bounds.top)/bounds.height*2);
      if(this.down&&this.down.id===e.pointerId){const dx=e.clientX-this.down.x,dy=e.clientY-this.down.y;if(!this.dragged&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){this.dragged=true;this.touch.setPointerCapture(e.pointerId);}if(this.dragged){if(e.shiftKey)this.scene?.rotate((e.clientX-this.down.last)*.012);else this.scene?.pet((e.clientX-bounds.left)/bounds.width*2-1,1-(e.clientY-bounds.top)/bounds.height*2,(e.clientX-this.down.last)/bounds.width,-(e.clientY-this.down.lastY)/bounds.height);this.draw();}this.down.last=e.clientX;this.down.lastY=e.clientY;}
    });
    const release=e=>{this.down=null;if(this.touch.hasPointerCapture(e.pointerId))this.touch.releasePointerCapture(e.pointerId);};
    this.touch.addEventListener('pointerup',release);this.touch.addEventListener('pointercancel',release);this.touch.addEventListener('pointerleave',()=>this.scene?.gaze(0,0));
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(this.disposing)return;this.fallback();});
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.reduced.addEventListener('change',this._onMotion);this.dataset.reducedMotion=String(this.reduced.matches);
    document.addEventListener('visibilitychange',this._onVisibility);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.touch);
    this.intersection=new IntersectionObserver(entries=>{this.visible=entries.some(entry=>entry.isIntersecting);this.updateLabels();this.updateLoop();},{rootMargin:'40px'});this.intersection.observe(this);
    this.updateLabels();
  }
  async start(){
    if(this.loading||this.scene)return;this.loading=true;this.dataset.renderer='loading';this.updateLabels();
    try{const module=await loadScene();if(!this.isConnected)return;this.scene=module.createMiloScene(this.canvas);this.dataset.renderer='webgl';this.resize();this.updateLabels();this.updateLoop();}
    catch{this.fallback();}
    finally{this.loading=false;}
  }
  fallback(){this.dataset.renderer='fallback';cancelAnimationFrame(this.frame);clearTimeout(this.motionTimer);this.frame=0;if(this.scene){this.disposing=true;this.scene.dispose();this.scene=null;this.disposing=false;}this.updateLabels();}
  play(mood,duration=5500){if(!MOODS.includes(mood))return;this.activeMood=mood;this.motionUntil=performance.now()+duration;clearTimeout(this.motionTimer);this.motionTimer=setTimeout(()=>{this.motionUntil=0;this.updateLabels();this.draw();},duration);this.updateLabels();this.draw();}
  get mood(){return this.motionUntil>performance.now()&&this.baseMood!=='thinking'?this.activeMood:this.baseMood;}
  updateLabels(){
    if(!this.built)return;const c=this.copy;this.touch.setAttribute('aria-label',c.touch);
    const status=this.dataset.renderer==='loading'?c.loading:this.dataset.renderer==='fallback'?c.fallback:c[this.mood];
    const label=this.querySelector('.companion-status');if(label.textContent!==status)label.textContent=status;
    this.querySelector('.companion-hint').textContent=c.hint;
    this.querySelector('.companion-reset').setAttribute('aria-label',c.reset);
    const pause=this.querySelector('.companion-pause');pause.setAttribute('aria-label',this.paused?c.resume:c.pause);pause.setAttribute('aria-pressed',String(this.paused));pause.innerHTML=glyph(this.paused?'play':'pause');
    this.querySelector('.companion-actions').setAttribute('aria-label',this.getAttribute('lang')==='en'?'Spend a moment with Milo':'Milo와 잠깐 함께하기');
    this.querySelectorAll('[data-motion]').forEach(b=>{b.querySelector('.motion-label').textContent=c[`${b.dataset.motion}Button`];b.setAttribute('aria-pressed',String(this.motionUntil>performance.now()&&this.mood===b.dataset.motion));b.disabled=this.dataset.renderer!=='webgl';});
    const retry=this.querySelector('.companion-retry');retry.hidden=this.dataset.renderer!=='fallback';retry.textContent=c.retry;
    this.querySelector('.companion-tools').hidden=this.dataset.renderer!=='webgl';this.dataset.mood=this.mood;
    if(this.dataset.renderer==='fallback'){const key=['idle','wave','walk','meal','injection','thinking','comfort','celebrate'].includes(this.mood)?this.mood:'idle';const frozen=this.paused||this.reduced.matches||!this.visible||document.hidden;this.querySelector('.companion-fallback').src=`/assets/milo/${key}-${frozen?'poster':'loop'}-v1.webp`;}

  }
  resize(){if(!this.scene)return;const {width,height}=this.touch.getBoundingClientRect();this.scene.resize(width,height);this.draw();}
  draw(){if(this.scene)this.scene.render((performance.now()-this.epoch)/1000,this.mood,this.paused||this.reduced.matches);}
  updateLoop(){
    cancelAnimationFrame(this.frame);this.frame=0;
    if(!this.scene||!this.isConnected||!this.visible||document.hidden||this.paused||this.reduced.matches){this.dataset.animating='false';return;}
    this.dataset.animating='true';
    let previous=0;
    let frames=0,measureAt=performance.now();
    const tick=now=>{if(now-previous>=1000/30){this.draw();previous=now-((now-previous)%(1000/30));frames++;if(now-measureAt>2000){this.dataset.fps=String(Math.round(frames*1000/(now-measureAt)));frames=0;measureAt=now;}}this.frame=requestAnimationFrame(tick);};
    this.frame=requestAnimationFrame(tick);
  }
  dispose(){cancelAnimationFrame(this.frame);clearTimeout(this.motionTimer);this.disposing=true;this.scene?.dispose();this.scene=null;this.disposing=false;this.resizeObserver?.disconnect();this.intersection?.disconnect();this.reduced?.removeEventListener('change',this._onMotion);document.removeEventListener('visibilitychange',this._onVisibility);this.built=false;this.loading=false;}
}

customElements.define('milo-companion',MiloCompanion);
