import resources from '../public/assets/milo/manifest-v2.json' with {type: 'json'};

export const MOODS = Object.freeze([...Object.keys(resources), 'listening']);

export function mediaForMood(mood) {
  return Object.hasOwn(resources, mood) ? resources[mood] : resources.idle;
}
