import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import Sentry from './sentry-electron';

export const startAutoUpdater = async () => {
  await autoUpdater.checkForUpdatesAndNotify().catch(Sentry.captureException);
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(Sentry.captureException);
  }, 6 * 3600 * 1000);

  autoUpdater.on('update-downloaded', async (event, releaseNotes, releaseName) => {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on('error', Sentry.captureException);
};
