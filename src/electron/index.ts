import fs from 'fs';
import http from 'http';

import { BrowserWindow, app, ipcMain } from 'electron';

// import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import * as clipboardHandler from '@/electron/handlers/clipboard';
import * as configurationHandler from '@/electron/handlers/configuration';
import * as googleDriveHandler from '@/electron/handlers/google-drive';
import * as leveldownHandler from '@/electron/handlers/leveldown';
import * as paymentsHandler from '@/electron/handlers/payments';
import * as signInHandler from '@/electron/handlers/sign-in';
import * as socketIoHandler from '@/electron/handlers/socket-io';
import { Message } from '@/rxdb-v2/src/types';
import { SENDERS } from '@/utils/constants';
import { always, whenShareAvailable } from '@/utils/environment';
import * as methods from '@/utils/methods';
import * as resultHandler from '@/utils/result';
import * as Sentry from '@/utils/sentry';
import * as analyticsHandler from '../electron/handlers/analytics';
import * as remoteHandler from '../electron/handlers/remote';
import { environment } from './environment';
import * as analytics from './services/analytics';
import { autoLauncherHandler } from './services/auto-launcher';
import * as clipboardService from './services/clipboard';
import * as storeService from './services/electron-store';
import { GoogleOAuth2Service } from './services/google-auth';
import { GoogleDriveService } from './services/google-drive';
import * as inAppPurchaseService from './services/in-app-purachase';
import { shortcutHandler } from './services/shortcuts';
import { sendFile } from './services/socket.io/client';
import * as socketIoService from './services/socket.io/server';
import { IDevice } from './services/socket.io/types';
import { iDevice as getIDevice } from './services/socket.io/utils/network';
import { tray } from './services/tray';
import { mainWindow } from './services/windows/main';
import * as withCommand from './services/with-editor';
import { clipsWorker } from './workers/worker-threads';

const runCatching = resultHandler.runCatching(Sentry.captureException);
const runCatchingHttpError = resultHandler.runCatchingHttpError(
  Sentry.captureException
);

/**
 * We get an error without setTimeout
 */
setTimeout(() => Sentry.init(environment.sentry), 0);

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

  signInHandler.onSignIn(
    runCatchingHttpError(() =>
      authService
        .openAuthWindowAndSetCredentials()
        .then(() => driveService.getUserInfo())
    )
  );

  signInHandler.onSignOut(
    runCatchingHttpError(() => {
      storeService.removeCredentials();
      return authService.revokeCredentials();
    })
  );

  googleDriveHandler.onChangePageToken(
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

  googleDriveHandler.onListFiles(
    runCatchingHttpError(() =>
      driveService.listFiles().then((files) => ({
        status: 200,
        data: files,
      }))
    )
  );

  googleDriveHandler.onRetrieveFile(
    runCatchingHttpError(async (fileId) => ({
      status: 200,
      data: await driveService.retrieveFile(fileId),
    }))
  );

  googleDriveHandler.onRemoveFile(
    runCatchingHttpError(async (fileId) =>
      driveService
        .removeFile(fileId)
        .then((result) => ({ status: result.status, data: result.data }))
    )
  );

  googleDriveHandler.onUploadToDrive(
    runCatchingHttpError((clips) => driveService.addFile(clips))
  );
}

function subscribeToClipboard(mainWindow: BrowserWindow) {
  clipboardService.clipboardAsObservable
    .pipe(tap((clip) => mainWindow.webContents.send('clipboard-change', clip)))
    .subscribe();

  clipboardHandler.onCopyToClipboard(
    runCatching(
      clipboardService.copyToClipboard,
      'Something went wrong while removing the image'
    )
  );

  clipboardHandler.onToDataURI(
    runCatching(
      clipboardService.convertToDataURI,
      'Something went wrong during dataURI conversion'
    )
  );

  clipboardHandler.onRemoveImage(
    runCatching(
      clipboardService.removeFromDirectory,
      'Something went wrong while removing the image'
    )
  );

  clipboardHandler.onRemoveImageDirectory(
    runCatching(
      clipboardService.removeImageDirectory,
      'Something went wrong while removing the image'
    )
  );

  clipboardHandler.onCreateBackup(
    runCatching(
      (path, clips) => fs.writeFileSync(path, JSON.stringify(clips)),
      'Something went wrong while creating the backup'
    )
  );

  clipboardHandler.onRestoreBackup(
    runCatching(
      (path) => JSON.parse(fs.readFileSync(path, 'utf-8')),
      'Something went wrong while restoring the backup'
    )
  );
}

async function subscribeToSocketIo(mainWindow: BrowserWindow) {
  socketIoHandler.onMyDevice(() =>
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
  const handleServer = (
    (
      httpServer: http.Server | null = null,
      status: 'started' | 'closed' = 'closed',
      subscription: Subscription = Subscription.EMPTY
    ) =>
    async (action: 'start' | 'close') => {
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
    }
  )();
  const handleSendFile = async (
    sender: IDevice,
    receiver: IDevice,
    message: Message
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

  socketIoHandler.onHandleServer(
    runCatching(handleServer, "Couldn't handle the server")
  );
  socketIoHandler.onSendFile(
    runCatching(handleSendFile, "Couldn't send the file")
  );
}

function subscribeToInAppPurchase(mainWindow: BrowserWindow) {
  paymentsHandler.onCanMakePayments(
    runCatching(inAppPurchaseService.canMakePayments)
  );
  paymentsHandler.onGetReceiptUrl(
    runCatching(inAppPurchaseService.getReceiptURL)
  );
  paymentsHandler.onGetProducts(runCatching(inAppPurchaseService.getProducts));
  paymentsHandler.onPurchaseProduct(
    runCatching(inAppPurchaseService.purchaseProduct)
  );
  paymentsHandler.onRestoreCompletedTransactions(
    runCatching(inAppPurchaseService.restoreCompletedTransactions)
  );
  paymentsHandler.onFinishTransactionByDate(
    runCatching(inAppPurchaseService.finishTransactionByDate)
  );
  inAppPurchaseService.onTransactionUpdate((event, transactions) =>
    mainWindow.webContents.send('transactions-updated', transactions)
  );
}

export function onReady(): void {
  const win = mainWindow.create();
  tray.create(win);

  // Used in src/renderer/store/configuration/index.ts
  ipcMain.on(
    SENDERS.GET_BOUNDS_SYNC,
    (event) => (event.returnValue = win.getBounds())
  );
  win.on('resize', () => win.webContents.send('resize', win.getBounds()));
  win.on('move', () => win.webContents.send('move', win.getBounds()));

  configurationHandler.eventHandler(storeService.getAppConf, win);
  remoteHandler.onGetCurrentWindow(
    runCatching(mainWindow.onGetCurrentWindow(win))
  );
  remoteHandler.onDialog();
  analyticsHandler.onPageView(runCatching(analytics.pageView));
  configurationHandler.onSetShortcut(
    shortcutHandler(storeService.getAppConf, win)
  );
  configurationHandler.onSetStartup(autoLauncherHandler);
  configurationHandler.withCommand(async (args, data) =>
    withCommand.withCommand(args, data)
  );

  const [complationRate, workerSearchClips] = clipsWorker(
    methods.countAllDocuments,
    methods.findClips
  );

  complationRate.subscribe((searchRation) =>
    win.webContents.send('search-ratio-change', searchRation)
  );

  leveldownHandler.onNodeDB((methodNm, args) => {
    switch (methodNm) {
      case 'findClips':
        return workerSearchClips(args[0]);
      default:
        // eslint-disable-next-line import/namespace
        return methods[methodNm](...args);
    }
  });
  configurationHandler.onRelaunchApp(
    runCatching(() => {
      app.relaunch();
      app.exit();
    })
  );

  /** Subscribe to all services */
  subscribeToClipboard(win);
  subscribeToGoogle(win);
  subscribeToInAppPurchase(win);

  whenShareAvailable(() => subscribeToSocketIo(win), always(Promise.resolve()));
}

export function onActivate(): void {
  mainWindow.instance ? mainWindow.instance.show() : mainWindow.create();
}
