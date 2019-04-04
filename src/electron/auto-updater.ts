import { dialog } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

try {
  setInterval(async () => {
    const result = await autoUpdater.checkForUpdates();
    log.info(result);
  }, 5000);

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.'
    };

    dialog.showMessageBox(dialogOpts, response => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', message => {
    console.error('There was a problem updating the application');
    console.error(message);
    log.warn(message);
  });
} catch (err) {
  log.warn(err);
}
