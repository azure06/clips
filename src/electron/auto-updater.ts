import { dialog } from 'electron';
import * as isDev from 'electron-is-dev';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
const isDevelopment = (isDev as any).default;

!isDevelopment
  ? (async () => {
      await autoUpdater.checkForUpdatesAndNotify().catch(err => {
        log.error(err);
      });
      setInterval(() => {
        autoUpdater
          .checkForUpdates()
          .then(res => {
            log.info(res.updateInfo);
          })
          .catch(err => {
            log.error(err);
          });
      }, 60000 * 60);

      autoUpdater.on(
        'update-downloaded',
        (event, releaseNotes, releaseName) => {
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
        }
      );

      autoUpdater.on('error', message => {
        console.error('There was a problem updating the application');
        log.warn(message);
      });
    })()
  : (() => console.log('Autoupdater not available'))();
