// Two video layers: keep the outgoing clip moving until the incoming frame is ready.
export class MiloVideoPlayer {
  constructor(videos, onChange, {fadeMs = 220} = {}) {
    this.videos = videos;
    this.onChange = onChange;
    this.fadeMs = fadeMs;
    this.running = false;
    this.switches = 0;
    videos.forEach(video => {
      video.muted = true;
      for (const event of ['playing', 'pause', 'waiting']) video.addEventListener(event, () => this.emit());
    });
  }

  emit() {
    this.onChange({
      video: this.current || null,
      loading: Boolean(this.pending || (this.desired && this.desired.video !== this.current?.getAttribute('src'))),
      transitioning: Boolean(this.transition), blocked: Boolean(this.blocked), error: this.error,
      animating: Boolean(this.running && this.current && !this.current.paused), switches: this.switches
    });
  }

  select(media, {force = false} = {}) {
    this.desired = media;
    if (this.transition) { this.emit(); return; } // Coalesce rapid changes; never reuse a visible layer.
    if (!force && this.current?.getAttribute('src') === media.video) {
      this.cancelPending(); this.error = null; this.emit(); return;
    }
    if (!force && this.pending?.media.video === media.video) return;
    this.stage(media);
  }

  cancelPending() {
    const pending = this.pending;
    if (!pending) return;
    this.pending = null;
    pending.cleanup();
    if (pending.video !== this.current) pending.video.pause();
  }

  stage(media) {
    this.cancelPending();
    this.error = null;
    const video = this.videos.find(item => item !== this.current);
    const pending = {video, media, ready: false, starting: false};
    this.pending = pending;
    video.pause();
    video.classList.remove('is-active', 'is-current');
    video.style.zIndex = '0';
    const loaded = () => {
      if (this.pending !== pending) return;
      pending.ready = true;
      this.reveal(pending);
    };
    const failed = () => this.fail(pending);
    const timeout = setTimeout(failed, 15000);
    pending.cleanup = () => {
      clearTimeout(timeout); clearTimeout(pending.paintTimeout);
      if (pending.frameCallback !== undefined) video.cancelVideoFrameCallback?.(pending.frameCallback);
      video.removeEventListener('loadeddata', loaded);
      video.removeEventListener('error', failed);
    };
    video.addEventListener('loadeddata', loaded);
    video.addEventListener('error', failed);
    video.poster = media.poster;
    video.src = media.video;
    video.load();
    this.emit();
  }

  reveal(pending) {
    if (this.pending !== pending || !pending.ready) return;
    if (!this.running) { this.commit(pending, 0); return; }
    if (pending.starting) return;
    pending.starting = true;
    const video = pending.video;
    video.play().then(() => {
      if (this.pending !== pending) return;
      if (!this.running) { this.commit(pending, 0); return; }
      const painted = () => {
        if (this.pending === pending) this.commit(pending, this.fadeMs);
      };
      if (video.requestVideoFrameCallback) {
        pending.frameCallback = video.requestVideoFrameCallback(painted);
        // Some browsers throttle callbacks for fully transparent video layers.
        pending.paintTimeout = setTimeout(painted, 180);
      } else {
        requestAnimationFrame(() => requestAnimationFrame(painted));
      }
    }).catch(error => {
      if (this.pending !== pending) return;
      if (error.name === 'AbortError') { pending.starting = false; return; }
      this.blocked = true;
      this.commit(pending, 0);
    });
  }

  commit(pending, duration) {
    if (this.pending !== pending) return;
    pending.cleanup(); this.pending = null;
    const incoming = pending.video;
    const outgoing = this.current;
    this.current = incoming;
    this.blocked = Boolean(this.blocked && incoming.paused);
    incoming.classList.add('is-active', 'is-current');
    incoming.style.zIndex = '2';
    outgoing?.classList.remove('is-current');
    this.switches++;
    if (outgoing && duration && this.running && !this.reducedMotion) {
      const transition = {incoming, outgoing};
      this.transition = transition;
      // Outgoing stays fully opaque and keeps playing underneath the short dissolve.
      transition.animation = incoming.animate([{opacity: 0}, {opacity: 1}], {
        duration, easing: 'cubic-bezier(.25,1,.5,1)'
      });
      transition.animation.finished.then(() => {
        if (this.transition === transition) this.finishTransition();
      }).catch(() => {});
    } else {
      outgoing?.pause(); outgoing?.classList.remove('is-active');
      incoming.style.zIndex = '1';
      if (!this.running) incoming.pause();
    }
    this.emit();
    if (!this.transition && this.desired.video !== incoming.getAttribute('src')) this.stage(this.desired);
  }

  finishTransition(continueQueue = true) {
    const transition = this.transition;
    if (!transition) return;
    this.transition = null;
    transition.animation.cancel();
    transition.outgoing.pause();
    transition.outgoing.classList.remove('is-active');
    transition.outgoing.style.zIndex = '0';
    transition.incoming.style.zIndex = '1';
    this.emit();
    if (continueQueue && this.desired.video !== this.current.getAttribute('src')) this.stage(this.desired);
  }

  fail(pending) {
    if (this.pending !== pending) return;
    this.cancelPending();
    this.error = 'media'; // A failed incoming clip must not hide the current character.
    this.emit();
  }

  setPlaying(running, reducedMotion = false) {
    this.reducedMotion = reducedMotion;
    this.running = running;
    if (!running) {
      this.finishTransition(false);
      this.videos.forEach(video => video.pause());
      if (this.pending?.ready) this.commit(this.pending, 0);
    } else {
      if (this.current?.paused && !this.blocked) this.playCurrent();
      if (this.pending?.ready) this.reveal(this.pending);
    }
    if (this.desired && !this.pending && !this.transition && !this.error && this.desired.video !== this.current?.getAttribute('src')) this.stage(this.desired);
    this.emit();
  }

  playCurrent() {
    const video = this.current;
    if (!video) return;
    video.play().then(() => {
      if (!this.running || (video !== this.current && video !== this.transition?.outgoing)) video.pause();
      this.emit();
    }).catch(error => {
      if (video === this.current && error.name !== 'AbortError') { this.blocked = true; this.emit(); }
    });
  }

  resume() { this.blocked = false; if (this.running) this.playCurrent(); }
  replay() { if (this.current?.readyState >= 2) this.current.currentTime = 0; }
  suspend() {
    this.running = false;
    this.cancelPending(); this.finishTransition(false);
    this.videos.forEach(video => video.pause());
    this.emit();
  }
}
