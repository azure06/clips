import AutoLaunch from 'auto-launch';
import { ipcMain } from 'electron';
import * as isDev from 'electron-is-dev';
const isDevelopment = (isDev as any).default;

const clipsAutoLauncher = new AutoLaunch({
  name: 'Infiniti Clips'
});

ipcMain.on('app-settings', (event, { newSettings, oldSettings }) => {
  const {
    general: { startup }
  } = newSettings;
  clipsAutoLauncher
    .isEnabled()
    .then(async isEnabled => {
      if (startup && !isEnabled && !isDevelopment) {
        await clipsAutoLauncher.enable();
        console.log('Auto-launch: Enabled');
      } else if (!startup && isEnabled) {
        await clipsAutoLauncher.disable();
        console.log('Auto-launch Disabled');
      }
    })
    .catch(err => {
      console.error('Auto-launch', err);
    });
});
