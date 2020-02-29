import AutoLaunch from 'auto-launch';
import Sentry from './../sentry';
import { storeService } from '../services/electron-store.service';
import { ipcMain } from 'electron';

const isDevelopment = process.env.NODE_ENV !== 'production';

const autoLauncher = new AutoLaunch({
  name: 'Clips',
});

export function initAutoLauncher() {
  ipcMain.handle('change-startup', (event, startup: boolean) => {
    return autoLauncher
      .isEnabled()
      .then(async (isEnabled) => {
        if (startup && !isEnabled && !isDevelopment) {
          await autoLauncher.enable();
        } else if (!startup && isEnabled) {
          await autoLauncher.disable();
        }
      })
      .catch(Sentry.captureException);
  });
}
