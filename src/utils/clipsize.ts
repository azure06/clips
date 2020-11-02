import sizeof from 'object-sizeof';

const clipsThreshold = 32768 * 1000;
const clipThreshold = 8192 * 1000;

export function checkSize<T>(clip: T): boolean {
  return sizeof(clip) < clipThreshold;
}

export function isSpaceAvailable<T>(clips: T[]): boolean {
  return sizeof(clips) < clipsThreshold;
}
