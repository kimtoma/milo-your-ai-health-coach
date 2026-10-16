import test from 'node:test';
import assert from 'node:assert/strict';
import {MiloVideoPlayer} from './milo-player.js';

const settle = () => new Promise(resolve => setImmediate(resolve));
const media = name => ({video: `/assets/milo/${name}-v2.mp4`, poster: `/assets/milo/${name}-poster-v1.webp`});
class Video extends EventTarget {
  constructor() {
    super(); this.paused = true; this.style = {}; this.readyState = 0; this.currentTime = 0; this.loads = 0;
    const classes = new Set();
    this.classList = {add: (...values) => values.forEach(v => classes.add(v)), remove: (...values) => values.forEach(v => classes.delete(v)), contains: v => classes.has(v)};
    this.callbacks = new Map(); this.callbackIndex = 0;
  }
  getAttribute(name) { return name === 'src' ? this.src : null; }
  load() { this.loads++; this.readyState = 1; this.currentTime = 0; }
  decoded() { this.readyState = 2; this.dispatchEvent(new Event('loadeddata')); }
  play() { this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); }
  pause() { if (!this.paused) {this.paused = true; this.dispatchEvent(new Event('pause'));} }
  requestVideoFrameCallback(callback) { const id = ++this.callbackIndex; this.callbacks.set(id, callback); return id; }
  cancelVideoFrameCallback(id) { this.callbacks.delete(id); }
  present() { const entries = [...this.callbacks.values()]; this.callbacks.clear(); entries.forEach(fn => fn()); }
  animate() {
    let finish, cancel;
    const finished = new Promise((resolve, reject) => {finish = resolve; cancel = () => reject(new Error('cancelled'));});
    return this.animation = {finished, finish, cancel};
  }
}
function setup(t) {
  const videos = [new Video(), new Video()];
  const player = new MiloVideoPlayer(videos, () => {});
  t.after(() => player.suspend());
  return {player, videos};
}
async function warm(player, video, name) {
  player.select(media(name)); video.decoded(); await settle(); video.present(); await settle();
}

test('Outgoing motion continues through decoding, first-frame readiness and the full dissolve', async t => {
  const {player, videos: [a, b]} = setup(t);
  player.setPlaying(true);
  await warm(player, a, 'idle');
  player.select(media('walk')); b.decoded(); await settle();
  assert.equal(player.current, a, 'loadeddata alone must not expose an unpresented video');
  assert.equal(a.paused, false);
  b.present();
  assert.equal(player.current, b);
  assert.equal(a.paused, false, 'outgoing must keep moving underneath the fade');
  assert.equal(b.paused, false);
  assert.ok(a.classList.contains('is-active') && b.classList.contains('is-active'));
  b.animation.finish(); await settle();
  assert.equal(a.paused, true);
  assert.equal(a.classList.contains('is-active'), false);
  assert.equal(player.transition, null);
});

test('Repeated actions retain playback phase, and rapid changes never overwrite a visible layer', async t => {
  const {player, videos: [a, b]} = setup(t);
  player.setPlaying(true); await warm(player, a, 'idle');
  a.currentTime = 2.1; player.select(media('idle'));
  assert.equal(a.currentTime, 2.1); assert.equal(a.loads, 1);
  await warm(player, b, 'walk');
  player.select(media('meal')); player.select(media('injection'));
  assert.equal(a.loads, 1, 'the outgoing layer is still visible during the fade');
  b.animation.finish(); await settle();
  assert.equal(a.src, media('injection').video, 'only the most recent queued action should load');
  b.currentTime = .8; player.select(media('walk'));
  assert.equal(player.pending, null); assert.equal(b.currentTime, .8);
  a.decoded(); a.present(); await settle();
  assert.equal(player.current, b, 'an obsolete load must not replace the requested character');
});

test('Pause and reduced motion settle to one still frame, preserve phase, and resume without seeking', async t => {
  const {player, videos: [a, b]} = setup(t);
  await warm(player, a, 'idle');
  assert.equal(a.paused, true);
  player.setPlaying(true); await warm(player, b, 'meal');
  player.select(media('walk'));
  player.setPlaying(false, true);
  assert.ok(a.paused && b.paused);
  assert.equal(player.transition, null);
  a.decoded(); await settle();
  assert.equal(player.current, a); assert.equal(a.animation, undefined);
  a.currentTime = .4; player.setPlaying(true, false); await settle();
  assert.equal(a.paused, false); assert.equal(a.currentTime, .4);
});

test('An incoming media error preserves the previous visible character and allows retry', async t => {
  const {player, videos: [a, b]} = setup(t);
  player.setPlaying(true); await warm(player, a, 'idle');
  player.select(media('meal')); b.dispatchEvent(new Event('error'));
  assert.equal(player.current, a); assert.ok(a.classList.contains('is-active'));
  assert.equal(a.paused, false); assert.equal(player.error, 'media');
  player.select(media('meal'), {force: true});
  assert.equal(player.error, null); assert.equal(b.loads, 2);
});
