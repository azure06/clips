import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  Menu,
  MenuItem,
  shell,
} from 'electron';
// import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import * as clipboardService from './services/clipboard';
import { GoogleOAuth2Service } from './services/google-auth';
import { GoogleDriveService } from './services/google-drive';
import { environment } from './environment';
import { mainWindow } from './services/main-win';
import { tray } from './services/tray';
import Sentry from './services/sentry-electron';
import * as storeService from './services/electron-store';
import {
  onCanMakePayments,
  eventHandler,
  onGetReceiptUrl,
  onCopyToClipboard,
  onCreateBackup,
  onHandleServer,
  onMyDevice,
  onRemoveImage,
  onRemoveImageDirectory,
  onRestoreBackup,
  onSendFile,
  onSetShortcut,
  onSetStartup,
  onToDataURI,
  runCatching,
  onGetProducts,
  onPurchaseProduct,
  onRestoreCompletedTransactions,
  onFinishTransactionByDate,
  runCatchingHttpError,
  onSignIn,
  onSignOut,
  onChangePageToken,
  onListFiles,
  onRetrieveFile,
  onUploadToDrive,
} from './utils/invocation-handler';
import { shortcutHandler } from './services/shortcuts';
import { autoLauncherHandler } from './services/auto-launcher';
import * as socketIoService from './services/socket.io/server';
import './services/analytics';
import { iDevice as getIDevice } from './services/socket.io/utils/network';
import { IDevice } from './services/socket.io/types';
import { tap } from 'rxjs/operators';
import http from 'http';
import fs from 'fs';
import { Subscription } from 'rxjs';
import { sendFile } from './services/socket.io/client';
import { MessageDoc } from '@/rxdb/message/model';
import * as inAppPurchaseService from './services/in-app-purachase';
import defaultMenu from 'electron-default-menu';

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

  onSignIn(
    runCatchingHttpError(() =>
      authService
        .openAuthWindowAndSetCredentials()
        .then(() => driveService.getUserInfo())
    )
  );

  onSignOut(
    runCatchingHttpError(() => {
      storeService.removeCredentials();
      return authService.revokeCredentials();
    })
  );

  onChangePageToken(
    runCatchingHttpError((pageToken) =>
      pageToken
        ? (() => {
            driveService.setPageToken(pageToken);
            return Promise.resolve({
              status: 200,
              data: { startPageToken: pageToken },
            });
          })()
        : driveService.getStartPageToken().then((res) => {
            if (res.data.startPageToken)
              driveService.setPageToken(res.data.startPageToken);
            return res;
          })
    )
  );

  onListFiles(
    runCatchingHttpError(() =>
      driveService.listFiles().then((files) => ({
        status: 200,
        data: files,
      }))
    )
  );

  onRetrieveFile(
    runCatchingHttpError(async (fileId) => ({
      status: 200,
      data: await driveService.retrieveFile(fileId),
    }))
  );

  onUploadToDrive(runCatchingHttpError((clips) => driveService.addFile(clips)));
}

function subscribeToClipboard(mainWindow: BrowserWindow) {
  clipboardService.clipboardAsObservable
    .pipe(
      tap((clip) => {
        mainWindow.webContents.send('clipboard-change', clip);
      })
    )
    .subscribe();

  onCopyToClipboard(
    runCatching(
      clipboardService.copyToClipboard,
      'Something went wrong while removing the image'
    )
  );

  onToDataURI(
    runCatching(
      clipboardService.convertToDataURI,
      'Something went wrong during dataURI conversion'
    )
  );

  onRemoveImage(
    runCatching(
      clipboardService.removeFromDirectory,
      'Something went wrong while removing the image'
    )
  );

  onRemoveImageDirectory(
    runCatching(
      clipboardService.removeImageDirectory,
      'Something went wrong while removing the image'
    )
  );

  onCreateBackup(
    runCatching(
      (path, clips) => fs.writeFileSync(path, JSON.stringify(clips)),
      'Something went wrong while creating the backup'
    )
  );

  onRestoreBackup(
    runCatching(
      (path) => JSON.parse(fs.readFileSync(path, 'utf-8')),
      'Something went wrong while restoring the backup'
    )
  );
}

async function subscribeToSocketIo(mainWindow: BrowserWindow) {
  onMyDevice(() =>
    getIDevice().then((value) =>
      value
        ? { status: 'success' as const, data: value }
        : { status: 'failure' as const, message: '' }
    )
  );
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
  ) => async (action: 'start' | 'close') => {
    const iDevice = await getIDevice(); //TODO Consider to use only one lib
    // If it's started close the server
    if (status === 'started' && httpServer) {
      await new Promise((resolve) => {
        httpServer?.once('close', () => {
          status = 'closed';
          resolve(null);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        httpServer?.once('error', (err: any) => {
          console.error('err', err);
          resolve(null); // TODO For now resolve anyway
        });
        subscription.unsubscribe();
        httpServer?.close();
      });
    }
    if (iDevice && action === 'start') {
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
    // If address is not available maybe is offline
    return Promise.reject('Maybe offline? 🤐');
  })();
  const handleSendFile = async (
    sender: IDevice,
    receiver: IDevice,
    message: MessageDoc
  ) => {
    sendFile(sender, receiver, message).subscribe({
      next: (progress) => {
        mainWindow.webContents.send(
          'progress-status',
          'next',
          receiver.mac,
          message.id,
          progress
        );
      },
      error: (error) => {
        console.info(error);
        mainWindow.webContents.send(
          'progress-status',
          'error',
          receiver.mac,
          message.id
        );
      },
      complete: () => {
        mainWindow.webContents.send(
          'progress-status',
          'complete',
          receiver.mac,
          message.id
        );
      },
    });
  };

  onHandleServer(runCatching(handleServer, "Couldn't handle the server"));
  onSendFile(runCatching(handleSendFile, "Couldn't send the file"));
}

function subscribeToInAppPurchase(mainWindow: BrowserWindow) {
  onCanMakePayments(runCatching(inAppPurchaseService.canMakePayments));
  onGetReceiptUrl(runCatching(inAppPurchaseService.getReceiptURL));
  onGetProducts(runCatching(inAppPurchaseService.getProducts));
  onPurchaseProduct(runCatching(inAppPurchaseService.purchaseProduct));
  onRestoreCompletedTransactions(
    runCatching(inAppPurchaseService.restoreCompletedTransactions)
  );
  onFinishTransactionByDate(
    runCatching(inAppPurchaseService.finishTransactionByDate)
  );
  inAppPurchaseService.onTransactionUpdate((event, transactions) =>
    mainWindow.webContents.send('transactions-updated', transactions)
  );
}

export function onReady(): void {
  const win = mainWindow.create();
  tray.create(win);

  eventHandler(win);
  onSetShortcut(shortcutHandler(storeService.getAppConf, win));
  onSetStartup(autoLauncherHandler());

  /** Subscribe to all services */
  subscribeToClipboard(win);
  subscribeToGoogle(win);
  subscribeToSocketIo(win);
  subscribeToInAppPurchase(win);
}

export function onActivate(): void {
  mainWindow.instance ? mainWindow.instance.show() : mainWindow.create();
}
