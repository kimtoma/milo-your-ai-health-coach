import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {MOODS, mediaForMood} from './milo-media.js';
import {conversationMoods, moodForRecord} from './milo-behavior.js';
test('Conversation and confirmed record reactions resolve to bundled MP4 files', async () => {
  const moods = conversationMoods('오늘 걸었고 점심을 먹었어. 주사를 맞았어.');
  assert.deepEqual(moods.map(mood => mediaForMood(mood).video), [
    '/assets/milo/walk-v2.mp4', '/assets/milo/meal-v2.mp4', '/assets/milo/injection-v2.mp4'
  ]);
  for (const mood of MOODS) {
    const media = mediaForMood(mood);
    const video = await readFile(new URL(`../public${media.video}`, import.meta.url));
    assert.equal(video.toString('ascii', 4, 8), 'ftyp', `${mood} must be an MP4, not a renamed image`);
    assert.ok((await readFile(new URL(`../public${media.poster}`, import.meta.url))).length > 0);
    assert.equal(media.videoFps, 30);
    assert.equal(media.keyPoseTimes.at(-1), media.durationSeconds);
    const sprite = await readFile(new URL(`../public${media.sprite}`, import.meta.url));
    assert.equal(createHash('sha256').update(sprite).digest('hex'), media.spriteSha256);
    assert.match(media.sprite, /-v1\.webp$/, 'the original artwork stays unchanged');
  }
  assert.equal(mediaForMood(moodForRecord({kind: 'plan'})), mediaForMood('idle'));
  assert.equal(mediaForMood('unknown'), mediaForMood('idle'));
  assert.equal(mediaForMood('toString'), mediaForMood('idle'));
});
