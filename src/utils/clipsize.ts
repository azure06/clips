import sizeof from 'object-sizeof';

const clipsThreshold = 32768 * 1000;
const clipThreshold = 8192 * 1000;

export function checkSize<T>(clip: T) {
  return sizeof(clip) < clipThreshold;
}

export function isSpaceAvailable<T>(clips: T[]) {
  return sizeof(clips) < clipsThreshold;
}
