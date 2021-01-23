import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
// import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import * as clipboardService from './services/clipboard';
import { GoogleOAuth2Service } from './services/google-auth';
import { GoogleDriveService } from './services/google-drive';
import { environment } from './environment';
import { mainWindow } from './helpers/main-win';
import { tray } from './helpers/tray';
import Sentry from './helpers/sentry-electron';
import * as storeService from './services/electron-store';
import { initEvents } from './helpers/events';
import { initShortcuts } from './helpers/shortcuts';
import { initAutoLauncher } from './helpers/autolauncher';
import * as socketIoService from './services/socket.io/server';
import './helpers/analytics';
import { iDevice as getIDevice } from './services/socket.io/utils/network';
import { IDevice } from './services/socket.io/types';
import { tap } from 'rxjs/operators';
import http from 'http';
import fs from 'fs';
import { Subscription } from 'rxjs';
import { sendFile } from './services/socket.io/client';
import { MessageDoc } from '@/rxdb/message/model';
import * as inAppPurchaseService from './services/in-app-purachase';

Sentry.init(environment.sentry);

/**
 *  Subscribe to Google Services
 *  - Google Auth
 *  - Google Drive
 *
 * @param mainWindow BrowserWindows
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subscribeToGoogle(mainWindow: BrowserWindow): void {
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
      .then(() => driveService.getUserInfo())
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
            .catch(() => '')
  );

  ipcMain.handle('list-files', () =>
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

  ipcMain.handle(
    'upload-to-drive',
    (_, data: Array<{ [any: string]: unknown }>) =>
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
  clipboardService.clipboardAsObservable
    .pipe(
      tap((clip) => {
        mainWindow.webContents.send('clipboard-change', clip);
      })
    )
    .subscribe();

  ipcMain.handle('copy-to-clipboard', (event, type, content) => {
    return clipboardService.copyToClipboard(type, content);
  });

  ipcMain.handle('to-dataURI', (event, content) => {
    return clipboardService.convertToDataURI(content);
  });
  ipcMain.handle('remove-image', (event, content) => {
    return clipboardService.removeFromDirectory(content);
  });
  ipcMain.handle('remove-image-directory', () => {
    return clipboardService.removeImageDirectory();
  });

  ipcMain.handle('createBackup', (event, path, clips) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(clips), function(err) {
        return err ? reject(err) : resolve(clips);
      });
    });
  });
  ipcMain.handle('restoreBackup', (event, path) => {
    return new Promise((resolve, reject) => {
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
  ipcMain.handle('my-device', getIDevice);
  const authorize = (device: IDevice) => {
    return new Promise<boolean>((resolve) => {
      mainWindow.webContents.send('authorize', device);
      ipcMain.once(`authorize:${device.mac}`, (_, result) => resolve(result));
    });
  };
  const handleServer = ((
    httpServer: http.Server | null = null,
    status: 'started' | 'closed' = 'closed',
    subscription: Subscription = Subscription.EMPTY
  ) => async (event: IpcMainInvokeEvent, action: 'start' | 'close') => {
    const iDevice = await getIDevice(); //TODO Consider to use only one lib
    // If it's started close the server
    if (status === 'started' && httpServer) {
      await new Promise((resolve) => {
        httpServer?.once('close', () => {
          status = 'closed';
          resolve();
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        httpServer?.once('error', (err: any) => {
          console.error('err', err);
          resolve(); // TODO For now resolve anyway
        });
        subscription.unsubscribe();
        httpServer?.close();
      });
    }
    // If address is not available maybe is offline
    if (!iDevice) return Promise.reject('Maybe offline? 🤐');
    if (action === 'start') {
      return socketIoService
        .listen(authorize, iDevice.port, iDevice.ip)
        .then(([httpServer_, messageStream]) => {
          httpServer = httpServer_;
          status = 'started';
          subscription = messageStream.subscribe((data) => {
            mainWindow.webContents.send('message', data);
          });
          return iDevice;
        });
    }
  })();
  const handleSendFile = async (
    _: unknown,
    sender: IDevice,
    receiver: IDevice,
    message: MessageDoc
  ) => {
    sendFile(sender, receiver, message).subscribe({
      next: (progress) => {
        mainWindow.webContents.send(
          'status',
          'next',
          receiver.mac,
          message.id,
          progress
        );
      },
      error: (error) => {
        console.info(error);
        mainWindow.webContents.send(
          'status',
          'error',
          receiver.mac,
          message.id
        );
      },
      complete: () => {
        mainWindow.webContents.send(
          'status',
          'complete',
          receiver.mac,
          message.id
        );
      },
    });
  };
  ipcMain.handle('handle-server', handleServer);
  ipcMain.handle('send-file', handleSendFile);
}

function subscribeToInAppPurchase(mainWindow: BrowserWindow) {
  ipcMain.handle('can-make-payments', inAppPurchaseService.canMakePayments);
  ipcMain.handle('get-receipt-url', inAppPurchaseService.getReceiptURL);
  ipcMain.handle('get-products', (event, productIds) =>
    inAppPurchaseService.getProducts(productIds)
  );
  ipcMain.handle('purchase-product', (event, product) =>
    inAppPurchaseService.purchaseProduct(product)
  );
  ipcMain.handle(
    'restore-completed-transactions',
    inAppPurchaseService.restoreCompletedTransactions
  );
  ipcMain.handle('finish-transaction-by-date', (event, date: string) =>
    inAppPurchaseService.finishTransactionByDate(date)
  );
  inAppPurchaseService.onTransactionUpdate((event, transactions) =>
    mainWindow.webContents.send('transactions-updated', transactions)
  );
}

export function onReady(): void {
  const win = mainWindow.create();
  tray.create(win);

  initEvents(win);
  initShortcuts(win);
  initAutoLauncher();

  /** Subscribe to all services */
  subscribeToClipboard(win);
  subscribeToGoogle(win);
  subscribeToSocketIo(win);
  subscribeToInAppPurchase(win);
}

export function onActivate(): void {
  mainWindow.instance ? mainWindow.instance.show() : mainWindow.create();
}
