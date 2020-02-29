import { BrowserWindow } from 'electron';
import { storeService } from '../services/electron-store.service';

export function initEvents(mainWindow: BrowserWindow) {
  const maybeHide = () => {
    const appSettings = storeService.getAppSettings();
    if (appSettings && appSettings.system.blur) {
      mainWindow.hide();
    }
  };
  mainWindow.on('blur', maybeHide);
}
