import { ipcRenderer } from 'electron';
import { ShortcutFuzzy } from '@/electron/services/shortcuts';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';

export type Format = 'plain/text' | 'text/html' | 'text/rtf' | 'image/png';

/**  Settings */
export const setShortcut = (
  shortcut: string
): Promise<Result__<ShortcutFuzzy>> =>
  ipcRenderer.invoke(INVOCATION.SET_SHORTCUT, shortcut);

export const setStartup = (startup: unknown): Promise<Result__<boolean>> =>
  ipcRenderer.invoke(INVOCATION.SET_STARTUP, startup);

// Image Edit:
export const openEditor = (clipId: string): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.OPEN_EDITOR, clipId);

// Relaunch App
export const relaunchApp = (): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.RELAUNCH_APP);

// Relaunch App
export const withCommand = (
  conf: { format: Format; command: string; args: string },
  data: string
): Promise<Result__<string>> =>
  ipcRenderer.invoke(INVOCATION.CONF.WITH_COMMAND, conf, data);
