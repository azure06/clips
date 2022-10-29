import { AppConfState } from '@/renderer/store/types';
import { BrowserWindow, ipcMain } from 'electron';
import { ShortcutFuzzy } from '../services/shortcuts';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';

export function eventHandler(
  func: () => AppConfState | undefined,
  mainWindow: BrowserWindow
): void {
  // Handle new window event
  mainWindow.webContents.on('new-window', (event) => {
    /** Avoid opening any new window */
    event.preventDefault();
    // shell.openExternal(url);
  });

  mainWindow.on('blur', () => {
    const appConf = func();
    if (appConf && appConf.general.blur) {
      mainWindow.hide();
    }
  });
}

// Configuration

export const onSetStartup = (
  func: (args: boolean) => Promise<Result__<boolean>>
): void =>
  ipcMain.handle(INVOCATION.SET_STARTUP, (event, startup: boolean) =>
    func(startup)
  );

export const onSetShortcut = (
  func: (args: ShortcutFuzzy) => Promise<Result__<ShortcutFuzzy>>
): void =>
  ipcMain.handle(INVOCATION.SET_SHORTCUT, (event, args: ShortcutFuzzy) =>
    func(args)
  );

// Image Editor
export const onOpenEditor = (
  func: (fileId: string) => Promise<Result__<void>>
): void => ipcMain.handle(INVOCATION.OPEN_EDITOR, (_, fileId) => func(fileId));

// Relaunch Electron App
export const onRelaunchApp = (func: () => Promise<Result__<void>>): void =>
  ipcMain.handle(INVOCATION.RELAUNCH_APP, func);
