import { Clip } from '@/store/types';
import { BrowserWindow, ipcMain } from 'electron';
import { ShortcutFuzzy } from '../services/shortcuts';
import * as Sentry from '@sentry/electron';
import { IDevice } from '@/electron/services/socket.io/types.ts';
import { MessageDoc } from '@/rxdb/message/model';
import { GaxiosPromise, GaxiosError } from 'gaxios';
import { drive_v3 } from 'googleapis';

export interface HttpSuccess<T> {
  status: number;
  data: T;
}

export interface HttpFailure {
  status?: number;
  message: string;
}

export interface Success<T> {
  status: 'success';
  data: T;
}

export interface Failure {
  status: 'failure';
  message: string;
}

export type HandlerResponse<T> = Success<T> | Failure;
export type HandlerHttpResponse<T> = HttpSuccess<T> | HttpFailure;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const runCatching = <P extends any[], T>(
  func: (...args: P) => T,
  message?: string
): ((
  ...args: P
) => Promise<HandlerResponse<T extends Promise<infer U> ? U : T>>) => {
  return async (...args) =>
    Promise.resolve(func) // Wrap inside a promise
      .then((func) => func(...args))
      .then((data) => ({
        status: 'success' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
      }))
      .catch((e) => {
        Sentry.captureException(e);
        if (e instanceof Error) {
          return { status: 'failure' as const, message: e.message };
        } else if (typeof e === 'string') {
          return { status: 'failure' as const, message: e };
        } else {
          return {
            status: 'failure' as const,
            message: message ?? 'Something went wrong',
          };
        }
      });
};

export const runCatchingHttpError = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends any[],
  T1 extends Promise<{ status: number; data: T2 }>,
  T2
>(
  func: (...args: P) => T1,
  message?: string
): ((...args: P) => Promise<HandlerHttpResponse<T2>>) => {
  return async (...args) =>
    Promise.resolve(func) // Wrap inside a promise
      .then((func) => func(...args))
      .then((res) => ({
        status: res.status,
        data: res.data,
      }))
      .catch((e) => {
        Sentry.captureException(e);
        if (e instanceof GaxiosError) {
          return {
            status: e.response?.status,
            message: e.response?.statusText ?? e.message,
          };
        } else if (e instanceof Error) {
          return { message: e.message };
        } else if (typeof e === 'string') {
          return { message: e };
        } else {
          return {
            message: message ?? 'Something went wrong',
          };
        }
      });
};

export function isSuccess<T>(
  response: HandlerResponse<T>
): response is Success<T> {
  return response.status === 'success';
}

export function isSuccessHttp<T>(
  response: HandlerHttpResponse<T>
): response is HttpSuccess<T> {
  return (
    response.status !== undefined &&
    response.status >= 200 &&
    response.status < 400
  );
}

export function eventHandler(mainWindow: BrowserWindow): void {
  // Handle new window event
  mainWindow.webContents.on('new-window', (event) => {
    /** Avoid opening any new window */
    event.preventDefault();
    // shell.openExternal(url);
  });
}

// Configuration

export const onSetStartup = (
  func: (args: boolean) => Promise<HandlerResponse<boolean>>
): void =>
  ipcMain.handle('set-startup', (event, startup: boolean) => func(startup));

export const onSetShortcut = (
  func: (args: ShortcutFuzzy) => Promise<HandlerResponse<ShortcutFuzzy>>
): void =>
  ipcMain.handle('set-shortcut', (event, args: ShortcutFuzzy) => func(args));

export const onSetAlwaysOnTop = (
  func: (args: boolean) => Promise<HandlerResponse<boolean>>
): void =>
  ipcMain.handle('set-always-on-top', (event, args: boolean) => func(args));

//   Clipboard

export const onCopyToClipboard = (
  func: (
    type: 'image' | 'text',
    content: string
  ) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle('copy-to-clipboard', (event, type, content) =>
    func(type, content)
  );

export const onToDataURI = (
  func: (content: string) => Promise<HandlerResponse<string>>
): void =>
  ipcMain.handle('to-dataURI', (event, content) => {
    return func(content);
  });

export const onRemoveImage = (
  func: (content: string) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle('remove-image', (event, content) => {
    return func(content);
  });

export const onRemoveImageDirectory = (
  func: () => Promise<HandlerResponse<void>>
): void => ipcMain.handle('remove-image-directory', func);

export const onCreateBackup = (
  func: (path: string, clips: Clip[]) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle('createBackup', (event, path, clips) => func(path, clips));

export const onRestoreBackup = (
  func: (path: string) => Promise<HandlerResponse<Clip[]>>
): void => ipcMain.handle('restoreBackup', (event, path) => func(path));

// SocketIO

export const onMyDevice = (
  func: () => Promise<HandlerResponse<IDevice>>
): void => ipcMain.handle('my-device', () => func());

export const onHandleServer = (
  func: (action: 'start' | 'close') => Promise<HandlerResponse<IDevice>>
): void => ipcMain.handle('handle-server', (event, action) => func(action));

export const onSendFile = (
  func: (
    sender: IDevice,
    receiver: IDevice,
    message: MessageDoc
  ) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle('send-file', (event, sender, receiver, message) =>
    func(sender, receiver, message)
  );

//   Payments

export const onCanMakePayments = (
  func: () => Promise<HandlerResponse<boolean>>
): void => ipcMain.handle('can-make-payments', func);

export const onGetReceiptUrl = (
  func: () => Promise<HandlerResponse<string>>
): void => ipcMain.handle('get-receipt-url', func);

export const onGetProducts = (
  func: (productIds: string[]) => Promise<HandlerResponse<Electron.Product[]>>
): void => ipcMain.handle('get-products', (_, productIds) => func(productIds));

export const onPurchaseProduct = (
  func: (
    product: Electron.Product,
    quantity?: number
  ) => Promise<HandlerResponse<boolean>>
): void =>
  ipcMain.handle('purchase-products', (_, product, quantity) =>
    func(product, quantity)
  );

export const onRestoreCompletedTransactions = (
  func: () => Promise<HandlerResponse<void>>
): void => ipcMain.handle('restore-completed-transactions', func);

export const onFinishTransactionByDate = (
  func: (date: string) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle('finish-transaction-by-date', (_, date) => func(date));

// SignIn

export const onSignIn = (
  func: () => Promise<HandlerHttpResponse<drive_v3.Schema$About>>
): void => ipcMain.handle('sign-in', func);

export const onSignOut = (
  func: () => Promise<HandlerHttpResponse<{ success: boolean }>>
): void => ipcMain.handle('sign-out', func);

// Drive Sync

export const onChangePageToken = (
  func: (
    pageToken?: string
  ) => Promise<HandlerHttpResponse<drive_v3.Schema$StartPageToken>>
): void =>
  ipcMain.handle('change-page-token', (event, pageToken) => func(pageToken));

export const onListFiles = (
  func: () => Promise<
    HandlerHttpResponse<{ [token: string]: drive_v3.Schema$Change[] }>
  >
): void => ipcMain.handle('list-files', func);

export const onRetrieveFile = (
  func: (fileId: string) => Promise<HandlerHttpResponse<Clip[]>>
): void => ipcMain.handle('retrieve-file', (_, fileId) => func(fileId));

export const onUploadToDrive = (
  func: (clips: Clip[]) => Promise<HandlerHttpResponse<drive_v3.Schema$File>>
): void => ipcMain.handle('upload-to-drive', (_, clips) => func(clips));
