import { BrowserWindow, ipcMain, ipcRenderer, screen } from 'electron';
// import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import { clipboardService } from './services/clipboard';
import { GoogleOAuth2Service } from './services/google-auth';
import { GoogleDriveService } from './services/google-drive';
import { tap } from 'rxjs/operators';
import fs from 'fs';
import { environment } from './environment';
import { mainWindow } from './helpers/main-win';
import { tray } from './helpers/tray';
import Sentry from './helpers/sentry-electron';
import { storeService } from './services/electron-store';
import { initEvents } from './helpers/events';
import { initShortcuts } from './helpers/shortcuts';
import { initAutoLauncher } from './helpers/autolauncher';
import { setup as setupPushReceiver } from 'electron-push-receiver';
import * as socketIoService from './services/socket.io/server';
import './helpers/analytics';
import { findFirstAvailablePort, ip } from './services/socket.io/utils/network';
import { IDevice } from './services/socket.io/types';

Sentry.init(environment.sentry);

/**
 *  Subscribe to Google Services
 *  - Google Auth
 *  - Google Drive
 *
 * @param mainWindow BrowserWindows
 */
function subscribeToGoogle(mainWindow: BrowserWindow) {
  const authService = new GoogleOAuth2Service(environment.googleOAuth2);
  const driveService = new GoogleDriveService(authService.getOAuth2Client());
  const credentials = storeService.getCredentials();
  const pageToken = storeService.getPageToken();

  if (credentials) {
    authService.setCredentials(credentials);
  }

  if (pageToken) {
    driveService.setPageToken(pageToken);
  }

  /** Keep updating credentials */
  authService
    .credentialsAsObservable()
    .pipe(tap(storeService.setCredentials))
    .subscribe();

  /** Keep updating google drive page-token */
  driveService
    .pageTokenAsObservable()
    .pipe(tap(storeService.setPageToken))
    .subscribe();

  ipcMain.handle('sign-in', () => {
    return authService
      .openAuthWindowAndSetCredentials()
      .then((_: any) => driveService.getUserInfo())
      .catch(Sentry.captureException);
  });

  ipcMain.handle('sign-out', () => {
    storeService.removeCredentials();
    return authService
      .revokeCredentials()
      .then((value) => value.data)
      .catch(Sentry.captureException);
  });

  ipcMain.handle(
    'change-page-token',
    async (_, pageToken: string | undefined) =>
      pageToken
        ? (() => {
            driveService.setPageToken(pageToken);
            return pageToken;
          })()
        : driveService
            .getStartPageToken()
            .then((token) => {
              if (token) driveService.setPageToken(token);
              return token;
            })
            .catch((_) => '')
  );

  ipcMain.handle('list-files', (_) =>
    driveService.listFiles().catch((error) => {
      Sentry.captureException(error);
      return { error };
    })
  );

  ipcMain.handle('retrieve-file', (_, data: string) =>
    driveService.retrieveFile(data).catch((error) => {
      Sentry.captureException(error);
      return { error };
    })
  );

  ipcMain.handle('upload-to-drive', (_, data: any[]) =>
    driveService
      .addFile(data)
      .then((response) =>
        response.status >= 200 && response.status < 400
          ? {
              status: response.status,
              statusText: response.statusText,
              data: response.data,
            }
          : (() => {
              Sentry.captureException(response);
              return {
                status: response.status,
                statusText: response.statusText,
              };
            })()
      )
      .catch((error) => {
        Sentry.captureException(error);
        return error;
      })
  );
}

function subscribeToClipboard(mainWindow: BrowserWindow) {
  const {
    clipboardAsObservable: clipboard,
    copyToClipboard,
  } = clipboardService;
  clipboard
    .pipe(
      tap((clip) => {
        mainWindow.webContents.send('clipboard-change', clip);
      })
    )
    .subscribe();

  ipcMain.handle('copy-to-clipboard', (event, type, content) => {
    return copyToClipboard(type, content);
  });

  ipcMain.handle('downloadJson', (event, path, clips) => {
    return new Promise((resolve: any, reject: any) => {
      fs.writeFile(path, JSON.stringify(clips), function(err) {
        return err ? reject(err) : resolve(clips);
      });
    });
  });

  ipcMain.handle('uploadJson', (event, path) => {
    return new Promise((resolve: any, reject: any) => {
      fs.readFile(path, 'utf-8', function(err, data) {
        return err
          ? reject(err)
          : (() => {
              try {
                resolve(JSON.parse(data));
              } catch (err) {
                reject(err);
              }
            })();
      });
    });
  });
}

async function subscribeToSocketIo(mainWindow: BrowserWindow) {
  const authorize = (device: IDevice) => {
    return new Promise<boolean>((resolve) => {
      mainWindow.webContents.send('authorize', device);
      ipcMain.once(`authorize:${device.mac}`, (_, result) => resolve(result));
    });
  };
  ipcMain.handle('my-ip', (event, type, content) => ip.address);
  if (ip.address) {
    socketIoService
      .observe(authorize, ip.address, await findFirstAvailablePort())
      .subscribe((data) => {
        mainWindow.webContents.send('message', data);
      });
  } else {
    console.info('Maybe offline...? 🦊');
  }
}

export function onReady() {
  const win = mainWindow.create();
  const _ = tray.create(win);

  setupPushReceiver(win.webContents);
  initEvents(win);
  initShortcuts(win);
  initAutoLauncher();

  /** Subscribe to all services */
  subscribeToClipboard(win);
  subscribeToGoogle(win);
  subscribeToSocketIo(win);
}

export function onActivate() {
  const _ = mainWindow.instance
    ? mainWindow.instance.show()
    : mainWindow.create();
}
