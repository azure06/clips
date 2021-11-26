 import * as Sentry from '@/sentry';
import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { interval, of } from 'rxjs';
import { catchError, concatMap, map, startWith } from 'rxjs/operators';
import log from 'electron-log';

const ONE_HOUR = 1000 * (60 * 60);
const INTERVAL = 6 * ONE_HOUR;

export const autoUpdaterObservable = interval(INTERVAL).pipe(
  startWith(-1),
  concatMap(() => autoUpdater.checkForUpdates()),
  map((data) => ({ status: 'success' as const, data })),
  catchError((e) => {
    const e_ = { status: 'failure' as const, message: e };
    log.error(e_);
    return of(e_);
  })
);

autoUpdater.on(
  'update-downloaded',
  async (event, releaseNotes, releaseName) => {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.',
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  }
);

autoUpdater.on('error', Sentry.captureException);
