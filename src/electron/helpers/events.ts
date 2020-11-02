import { storeService } from '../services/electron-store';
import { BrowserWindow } from 'electron';

export function initEvents(mainWindow: BrowserWindow): void {
  // Handle new window event
  mainWindow.webContents.on('new-window', (event) => {
    /** Avoid opening any new window */
    event.preventDefault();
    // shell.openExternal(url);
  });
  const maybeHide = () => {
    const appSettings = storeService.getAppSettings();
    if (appSettings && appSettings.system.blur) {
      mainWindow.hide();
    }
  };
  mainWindow.on('blur', maybeHide);
}
