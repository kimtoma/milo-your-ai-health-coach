import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MOODS, mediaForMood} from './milo-media.js';
import {conversationMoods, moodForRecord} from './milo-behavior.js';
test('Conversation and confirmed record reactions resolve to bundled MP4 files', async () => {
  const moods = conversationMoods('오늘 걸었고 점심을 먹었어. 주사를 맞았어.');
  assert.deepEqual(moods.map(mood => mediaForMood(mood).video), [
    '/assets/milo/walk-v1.mp4', '/assets/milo/meal-v1.mp4', '/assets/milo/injection-v1.mp4'
  ]);
  for (const mood of MOODS) {
    const media = mediaForMood(mood);
    const video = await readFile(new URL(`../public${media.video}`, import.meta.url));
    assert.equal(video.toString('ascii', 4, 8), 'ftyp', `${mood} must be an MP4, not a renamed image`);
    assert.ok((await readFile(new URL(`../public${media.poster}`, import.meta.url))).length > 0);
  }
  assert.equal(mediaForMood(moodForRecord({kind: 'plan'})), mediaForMood('idle'));
  assert.equal(mediaForMood('unknown'), mediaForMood('idle'));
  assert.equal(mediaForMood('toString'), mediaForMood('idle'));
});
