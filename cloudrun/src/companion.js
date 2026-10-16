import {MOODS, mediaForMood} from './milo-media.js';
import {MiloVideoPlayer} from './milo-player.js';

const COPY = {
  ko: {
    touch: 'Milo와 인사하기', hint: '눌러서 인사해요. 오늘의 이야기에 맞춰 움직여요',
    loading: 'Milo가 오고 있어요', fallback: 'Milo가 곁에 있어요', retry: '영상 다시 불러오기',
    idle: '당신의 속도로, 함께 있어요', wave: '안녕! 만나서 반가워요',
    listening: '편하게 이야기해요. 듣고 있어요', thinking: '이야기를 차분히 생각하고 있어요',
    comfort: '잠시 쉬어가도 괜찮아요', celebrate: '작은 기록도 소중한 한 걸음이에요',
    walk: '한 걸음씩, 나의 속도로', meal: '한 끼도 맛있게, 냠냠',
    injection: '주사 후에는 반창고를 톡. 오늘도 수고했어요',
    mealButton: '식사', injectionButton: '반창고', waveButton: '인사', walkButton: '걷기',
    replay: '처음부터 보기', pause: '동작 쉬기', resume: '동작 켜기', group: 'Milo와 잠깐 함께하기'
  },
  en: {
    touch: 'Say hello to Milo', hint: 'Tap to say hello. Milo moves with your story.',
    loading: 'Milo is on the way', fallback: 'Milo is here with you', retry: 'Reload animation',
    idle: 'Here with you, at your pace', wave: 'Hello! It is good to see you',
    listening: 'Take your time. I am listening', thinking: 'Taking a moment with your story',
    comfort: 'It is okay to take a little break', celebrate: 'Every little record is a step forward',
    walk: 'One little step at a time', meal: 'A little bite, a happy little moment',
    injection: 'A little bandage and a little care',
    mealButton: 'Meal', injectionButton: 'Bandage', waveButton: 'Hello', walkButton: 'Walk',
    replay: 'Replay animation', pause: 'Pause motion', resume: 'Resume motion', group: 'Spend a moment with Milo'
  }
};
const PATHS = {
  wave: 'M8 13V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v8c0 5-3 8-7 8-3 0-5-2-7-4l-3-4a2 2 0 0 1 3-2l2 2',
  walk: 'M14 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M7 11l4-4 4 2 3 3m-7-5-1 7 5 3 1 5m-6-8-4 7',
  meal: 'M5 3v7m3-7v7M3 7h7m-4 3v11M17 3c-4 3-4 8 0 8h2V3Zm2 8v10',
  injection: 'm8 4 12 12-4 4L4 8Zm-2 2 12 12M8 16l8-8',
  replay: 'M4 10a8 8 0 1 1 1 7M4 4v6h6', pause: 'M9 5v14M15 5v14', play: 'M8 4l12 8-12 8Z'
};
const glyph = name => `<svg class="companion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"></path></svg>`;

class MiloCompanion extends HTMLElement {
  static observedAttributes = ['mood', 'lang', 'compact'];
  constructor() {
    super();
    this.baseMood = 'idle'; this.activeMood = 'idle'; this.paused = false; this.visible = true; this.motionUntil = 0;
    this.onVisibility = () => this.syncPlayback();
    this.onMotion = () => { this.dataset.reducedMotion = String(this.reduced.matches); this.syncPlayback(); };
  }
  get copy() { return COPY[this.getAttribute('lang') === 'en' ? 'en' : 'ko']; }
  get mood() { return this.motionUntil > performance.now() && this.baseMood !== 'thinking' ? this.activeMood : this.baseMood; }

  connectedCallback() {
    // The app retains this element when repainting the conversation.
    queueMicrotask(() => {
      if (!this.isConnected) return;
      if (!this.built) this.build();
      this.observe(); this.update();
    });
  }
  disconnectedCallback() { queueMicrotask(() => { if (!this.isConnected) this.dispose(); }); }
  attributeChangedCallback(name, previous, next) {
    if (previous === next) return;
    if (name === 'mood') {
      this.baseMood = MOODS.includes(next) ? next : 'idle';
      this.motionUntil = 0; clearTimeout(this.motionTimer);
    }
    if (this.built) this.update();
  }

  build() {
    this.built = true; this.dataset.renderer = 'loading';
    this.innerHTML = `<div class="companion-stage"><button class="milo-touch" type="button"><img class="companion-fallback" src="/assets/milo-rounded.png" alt="" width="384" height="384">${[0, 1].map(() => '<video class="companion-video" muted playsinline loop preload="auto" disablepictureinpicture aria-hidden="true" tabindex="-1"></video>').join('')}</button><div class="companion-tools"><button type="button" class="companion-replay">${glyph('replay')}</button><button type="button" class="companion-pause">${glyph('pause')}</button></div><button type="button" class="companion-retry" hidden></button></div><div class="companion-caption"><p class="companion-status" role="status" aria-live="polite"></p><p class="companion-hint"></p></div><div class="companion-actions" role="group">${['wave', 'walk', 'meal', 'injection'].map(mood => `<button type="button" data-motion="${mood}" aria-pressed="false">${glyph(mood)}<span class="motion-label"></span></button>`).join('')}</div>`;
    this.touch = this.querySelector('.milo-touch'); this.poster = this.querySelector('.companion-fallback');
    this.videos = [...this.querySelectorAll('video')];
    this.player = new MiloVideoPlayer(this.videos, status => {
      this.video = status.video;
      this.dataset.renderer = status.video ? 'mp4' : status.error ? 'fallback' : 'loading';
      this.dataset.loading = String(status.loading);
      this.dataset.transitioning = String(status.transitioning);
      this.dataset.animating = String(status.animating);
      this.dataset.blocked = String(status.blocked);
      this.dataset.mediaError = String(Boolean(status.error));
      this.dataset.switches = String(status.switches);
      if (!status.video) this.poster.src = mediaForMood(this.mood).poster;
      this.updateLabels();
    });
    this.addEventListener('click', event => {
      const motion = event.target.closest('[data-motion]');
      if (motion) { this.play(motion.dataset.motion); return; }
      if (event.target.closest('.companion-pause')) {
        this.paused = this.dataset.blocked === 'true' ? false : !this.paused;
        this.dataset.blocked = 'false'; if (!this.paused) this.player.resume(); this.syncPlayback(); return;
      }
      if (event.target.closest('.companion-replay')) { this.replay(); return; }
      if (event.target.closest('.companion-retry')) { this.player.select(mediaForMood(this.mood), {force: true}); return; }
      if (event.target.closest('.milo-touch')) this.play('wave');
    });
  }

  observe() {
    if (this.observing) return;
    this.observing = true;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced.addEventListener('change', this.onMotion);
    this.dataset.reducedMotion = String(this.reduced.matches);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.intersection = new IntersectionObserver(entries => {
      this.visible = entries.some(entry => entry.isIntersecting); this.syncPlayback();
    }, {rootMargin: '40px'});
    this.intersection.observe(this);
  }

  play(mood, duration = 6500) {
    if (!MOODS.includes(mood)) return;
    this.activeMood = mood; this.motionUntil = performance.now() + duration;
    clearTimeout(this.motionTimer);
    this.motionTimer = setTimeout(() => { this.motionUntil = 0; this.update(); }, duration);
    this.update();
  }
  replay() { this.player.replay(); this.syncPlayback(); }
  update() {
    this.player.select(mediaForMood(this.mood));
    this.updateLabels(); this.syncPlayback();
  }
  updateLabels() {
    const copy = this.copy;
    this.dataset.mood = this.mood; this.dataset.paused = String(this.paused);
    this.touch.setAttribute('aria-label', copy.touch);
    const status = this.dataset.renderer === 'loading' ? copy.loading : this.dataset.renderer === 'fallback' || this.dataset.mediaError === 'true' ? copy.fallback : copy[this.mood];
    const label = this.querySelector('.companion-status');
    if (label.textContent !== status) label.textContent = status;
    this.querySelector('.companion-hint').textContent = copy.hint;
    this.querySelector('.companion-replay').setAttribute('aria-label', copy.replay);
    const paused = this.paused || this.dataset.blocked === 'true';
    const pause = this.querySelector('.companion-pause');
    pause.setAttribute('aria-label', paused ? copy.resume : copy.pause);
    pause.setAttribute('aria-pressed', String(paused)); pause.innerHTML = glyph(paused ? 'play' : 'pause');
    this.querySelector('.companion-actions').setAttribute('aria-label', copy.group);
    this.querySelectorAll('[data-motion]').forEach(button => {
      button.querySelector('.motion-label').textContent = copy[`${button.dataset.motion}Button`];
      button.setAttribute('aria-pressed', String(this.mood === button.dataset.motion));
    });
    const retry = this.querySelector('.companion-retry');
    retry.hidden = this.dataset.mediaError !== 'true'; retry.textContent = copy.retry;
  }
  syncPlayback() {
    if (!this.built) return;
    const shouldPlay = this.isConnected && this.visible && !document.hidden && !this.paused && !this.reduced?.matches;
    this.player.setPlaying(shouldPlay, Boolean(this.reduced?.matches));
    this.updateLabels();
  }
  dispose() {
    this.player?.suspend(); clearTimeout(this.motionTimer); this.motionUntil = 0;
    this.intersection?.disconnect(); this.reduced?.removeEventListener('change', this.onMotion);
    document.removeEventListener('visibilitychange', this.onVisibility); this.observing = false;
  }
}

customElements.define('milo-companion', MiloCompanion);
