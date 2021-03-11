import { AppConfState, Clip } from '@/store/types';
import { BrowserWindow, ipcMain } from 'electron';
import { ShortcutFuzzy } from '../electron/services/shortcuts';
import { IDevice } from '@/electron/services/socket.io/types';
import { MessageDoc } from '@/rxdb/message/model';
import { drive_v3 } from 'googleapis';
import { Data } from '@/electron/services/clipboard';
import { INVOCATION } from './constants';
import { HandlerHttpResponse, HandlerResponse } from './handler';
import { Methods, MethodsReturnType } from '@/helpers/methods';

export function eventHandler(
  func: () => AppConfState | undefined,
  mainWindow: BrowserWindow
): void {
  // Handle new window event
  mainWindow.webContents.on('new-window', (event) => {
    /** Avoid opening any new window */
    event.preventDefault();
    // shell.openExternal(url);
  });

  mainWindow.on('blur', () => {
    const appConf = func();
    if (appConf && appConf.general.blur) {
      mainWindow.hide();
    }
  });
}

// Configuration

export const onSetStartup = (
  func: (args: boolean) => Promise<HandlerResponse<boolean>>
): void =>
  ipcMain.handle(INVOCATION.SET_STARTUP, (event, startup: boolean) =>
    func(startup)
  );

export const onSetShortcut = (
  func: (args: ShortcutFuzzy) => Promise<HandlerResponse<ShortcutFuzzy>>
): void =>
  ipcMain.handle(INVOCATION.SET_SHORTCUT, (event, args: ShortcutFuzzy) =>
    func(args)
  );

export const onSetAlwaysOnTop = (
  func: (args: boolean) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle(INVOCATION.SET_ALWAYS_ON_TOP, (event, args: boolean) =>
    func(args)
  );

export const onSetSkipTaskbar = (
  func: (args: boolean) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle(INVOCATION.SET_SKIP_TASKBAR, (event, args: boolean) =>
    func(args)
  );

//   Clipboard

export const onCopyToClipboard = (
  func: (data: Data) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle(INVOCATION.COPY_TO_CLIPBOARD, (event, data) => func(data));

export const onToDataURI = (
  func: (content: string) => Promise<HandlerResponse<string>>
): void =>
  ipcMain.handle(INVOCATION.TO_DATA_URI, (event, content) => {
    return func(content);
  });

export const onRemoveImage = (
  func: (content: string) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle(INVOCATION.REMOVE_IMAGE, (event, content) => {
    return func(content);
  });

export const onRemoveImageDirectory = (
  func: () => Promise<HandlerResponse<void>>
): void => ipcMain.handle(INVOCATION.REMOVE_IMAGE_DIRECTORY, func);

export const onCreateBackup = (
  func: (path: string, clips: Clip[]) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle(INVOCATION.CREATE_BACKUP, (event, path, clips) =>
    func(path, clips)
  );

export const onRestoreBackup = (
  func: (path: string) => Promise<HandlerResponse<Clip[]>>
): void =>
  ipcMain.handle(INVOCATION.RESTORE_BACKUP, (event, path) => func(path));

// SocketIO

export const onMyDevice = (
  func: () => Promise<HandlerResponse<IDevice>>
): void => ipcMain.handle(INVOCATION.MY_DEVICE, () => func());

export const onHandleServer = (
  func: (action: 'start' | 'close') => Promise<HandlerResponse<IDevice>>
): void =>
  ipcMain.handle(INVOCATION.HANDLE_SERVER, (event, action) => func(action));

export const onSendFile = (
  func: (
    sender: IDevice,
    receiver: IDevice,
    message: MessageDoc
  ) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle(INVOCATION.SEND_FILE, (event, sender, receiver, message) =>
    func(sender, receiver, message)
  );

//   Payments

export const onCanMakePayments = (
  func: () => Promise<HandlerResponse<boolean>>
): void => ipcMain.handle(INVOCATION.CAN_MAKE_PAYMENTS, func);

export const onGetReceiptUrl = (
  func: () => Promise<HandlerResponse<string>>
): void => ipcMain.handle(INVOCATION.GET_RECEIPT_URL, func);

export const onGetProducts = (
  func: (productIds: string[]) => Promise<HandlerResponse<Electron.Product[]>>
): void =>
  ipcMain.handle(INVOCATION.GET_PRODUCTS, (_, productIds) => func(productIds));

export const onPurchaseProduct = (
  func: (
    product: Electron.Product,
    quantity?: number
  ) => Promise<HandlerResponse<boolean>>
): void =>
  ipcMain.handle(INVOCATION.PURCHASE_PRODUCT, (_, product, quantity) =>
    func(product, quantity)
  );

export const onRestoreCompletedTransactions = (
  func: () => Promise<HandlerResponse<void>>
): void => ipcMain.handle(INVOCATION.RESTORE_COMPLETED_TRANSACTION, func);

export const onFinishTransactionByDate = (
  func: (date: string) => Promise<HandlerResponse<void>>
): void =>
  ipcMain.handle(INVOCATION.FINISH_TRANSACTION_BY_DATE, (_, date) =>
    func(date)
  );

// SignIn

export const onSignIn = (
  func: () => Promise<HandlerHttpResponse<drive_v3.Schema$About>>
): void => ipcMain.handle(INVOCATION.SIGN_IN, func);

export const onSignOut = (
  func: () => Promise<HandlerHttpResponse<{ success: boolean }>>
): void => ipcMain.handle(INVOCATION.SIGN_OUT, func);

// Drive Sync

export const onChangePageToken = (
  func: (
    pageToken?: string
  ) => Promise<HandlerHttpResponse<drive_v3.Schema$StartPageToken>>
): void =>
  ipcMain.handle(INVOCATION.CHANGE_PAGE_TOKEN, (event, pageToken) =>
    func(pageToken)
  );

export const onListFiles = (
  func: () => Promise<
    HandlerHttpResponse<{ [token: string]: drive_v3.Schema$Change[] }>
  >
): void => ipcMain.handle(INVOCATION.LIST_FILES, func);

export const onRetrieveFile = (
  func: (fileId: string) => Promise<HandlerHttpResponse<Clip[]>>
): void =>
  ipcMain.handle(INVOCATION.RETRIEVE_FILE, (_, fileId) => func(fileId));

export const onUploadToDrive = (
  func: (clips: Clip[]) => Promise<HandlerHttpResponse<drive_v3.Schema$File>>
): void =>
  ipcMain.handle(INVOCATION.UPLOAD_TO_DRIVE, (_, clips) => func(clips));

// Image Editor
export const onOpenEditor = (
  func: (fileId: string) => Promise<HandlerResponse<void>>
): void => ipcMain.handle(INVOCATION.OPEN_EDITOR, (_, fileId) => func(fileId));

// Relaunch Electron App
export const onRelaunchApp = (
  func: () => Promise<HandlerResponse<void>>
): void => ipcMain.handle(INVOCATION.RELAUNCH_APP, func);

// Node DB
export const onNodeDB = (
  func: <P extends never[]>(methodNm: Methods, args: P) => MethodsReturnType
): void =>
  ipcMain.handle(INVOCATION.NODE_DB, (_, methodNm, args) =>
    func(methodNm, args)
  );
