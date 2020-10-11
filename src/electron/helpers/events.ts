import { BrowserWindow, shell } from 'electron';
import { storeService } from '../services/electron-store';

export function initEvents(mainWindow: BrowserWindow) {
  // Handle new window event
  mainWindow.webContents.on('new-window', (event, url) => {
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
