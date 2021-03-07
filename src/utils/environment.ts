const isMacOS = process.platform === 'darwin';

const isWindows = process.platform === 'win32';

const isLinux = process.platform === 'linux';

const isDevelopment = process.env.NODE_ENV !== 'production';

const isMas = process.mas;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const empty = () => {};

export const identity = <T>(a: T): T => a;

export const always = <T1>(a: T1): ((b?: unknown) => T1) => () => a;

export function whenDevelopment<T>(func: () => T, func2: () => T): T {
  return isDevelopment ? func() : func2();
}

export function whenMacOS<T>(func: () => T, func2: () => T): T {
  return isMacOS ? func() : func2();
}

export function whenMas<T>(func: () => T, func2: () => T): T {
  return isMas ? func() : func2();
}

export function whenWindows<T>(func: () => T, func2: () => T): T {
  return isWindows ? func() : func2();
}

export function whenLinux<T>(func: () => T, func2: () => T): T {
  return isLinux ? func() : func2();
}

export function whenAutoUpdateAvailable<T>(func: () => T, func2: () => T): T {
  return !(isMas || isLinux) ? func() : func2();
}

export function whenShareAvailable<T>(func: () => T, func2: () => T): T {
  return whenAutoUpdateAvailable(func, func2);
}

/** Editor View Helpers */

export const isEditorView = (env: string[]): boolean => {
  // window.process.argv
  const [clipId] = env.filter((arg) => arg.startsWith('--clip-id='));
  return !!clipId;
};

export const getClipId = (env: string[]): string => {
  // window.process.argv
  const [clipId] = env.filter((arg) => arg.startsWith('--clip-id='));
  return clipId.replace('--clip-id=', '');
};
