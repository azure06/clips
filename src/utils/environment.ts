export const isMacOS = process.platform === 'darwin';

export const isWindows = process.platform === 'win32';

export const isDevelopment = process.env.NODE_ENV !== 'production';

export const isMas = process.mas;

export const whenMacOS = <T>(func: () => T): T | Promise<void> =>
  isMacOS ? func() : Promise.resolve();

export const whenWindows = <T>(func: () => T): T | Promise<void> =>
  isWindows ? func() : Promise.resolve();

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
