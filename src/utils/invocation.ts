import { ShortcutFuzzy } from '@/electron/services/shortcuts';
import { IDevice } from '@/electron/services/socket.io/types';
import {
  HandlerHttpResponse,
  HandlerResponse,
} from '@/utils/invocation-handler';
import { MessageDoc } from '@/rxdb/message/model';
import { Clip } from '@/store/types';
import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';
import { Data } from '@/electron/services/clipboard';
import { INVOCATION } from './constants';

export type DataURI = string;

/**  Clipboard */
export const imagePathToDataURI = (
  content: string
): Promise<HandlerResponse<DataURI>> =>
  ipcRenderer.invoke(INVOCATION.TO_DATA_URI, content);

export const removeImage = (path: string): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke(INVOCATION.REMOVE_IMAGE, path);

export const removeImageDirectory = (): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke(INVOCATION.REMOVE_IMAGE_DIRECTORY);

export const copyToClipboard = (data: Data): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke(INVOCATION.COPY_TO_CLIPBOARD, data);

export const uploadToDrive = <T>(
  clips: T[]
): Promise<HandlerHttpResponse<drive_v3.Schema$File>> =>
  ipcRenderer.invoke(INVOCATION.UPLOAD_TO_DRIVE, clips);

export const createBackup = (
  filePath: string,
  clips: Clip[]
): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke(INVOCATION.CREATE_BACKUP, filePath, clips);

export const restoreBackup = (
  filePath: string
): Promise<HandlerResponse<Clip[]>> =>
  ipcRenderer.invoke(INVOCATION.RESTORE_BACKUP, filePath);

/**  Authentication */
export const signIn = (): Promise<HandlerHttpResponse<drive_v3.Schema$About>> =>
  ipcRenderer.invoke(INVOCATION.SIGN_IN);

export const signOut = (): Promise<HandlerHttpResponse<{ success: boolean }>> =>
  ipcRenderer.invoke(INVOCATION.SIGN_OUT);

/**  Google Drive */
export const changePageToken = (
  token?: string
): Promise<HandlerHttpResponse<drive_v3.Schema$StartPageToken>> =>
  ipcRenderer.invoke(INVOCATION.CHANGE_PAGE_TOKEN, token);

export const listGoogleDriveFiles = (): Promise<HandlerHttpResponse<{
  [token: string]: drive_v3.Schema$Change[];
}>> => ipcRenderer.invoke(INVOCATION.LIST_FILES);

export const retrieveFileFromDrive = (
  fileId?: string | null
): Promise<HandlerHttpResponse<Clip[]>> =>
  ipcRenderer.invoke(INVOCATION.RETRIEVE_FILE, fileId);

/**  Settings */
export const setShortcut = (
  shortcut: string
): Promise<HandlerResponse<ShortcutFuzzy>> =>
  ipcRenderer.invoke(INVOCATION.SET_SHORTCUT, shortcut);

export const setStartup = (
  startup: unknown
): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke(INVOCATION.SET_STARTUP, startup);

export const setSkipTaskbar = (
  skipTaskbar: boolean
): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke(INVOCATION.SET_SKIP_TASKBAR, skipTaskbar);

export const setAlwaysOnTop = (
  alwaysOnTop: boolean
): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke(INVOCATION.SET_ALWAYS_ON_TOP, alwaysOnTop);

/**  Socket io */
export const handleIoServer = (
  action: 'start' | 'close'
): Promise<HandlerResponse<IDevice>> =>
  ipcRenderer.invoke(INVOCATION.HANDLE_SERVER, action);

export const getMyDevice = (): Promise<HandlerResponse<IDevice>> =>
  ipcRenderer.invoke(INVOCATION.MY_DEVICE);

export const sendFile = (
  sender: IDevice,
  receiver: IDevice,
  message: MessageDoc
): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke(INVOCATION.SEND_FILE, sender, receiver, message);

/** In App Purchase */
export const canMakePayments = (): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke(INVOCATION.CAN_MAKE_PAYMENTS);

export const getReceiptURL = (): Promise<HandlerResponse<string>> =>
  ipcRenderer.invoke(INVOCATION.GET_RECEIPT_URL);

export const getProducts = (
  productIds?: string[]
): Promise<HandlerResponse<Electron.Product[]>> =>
  ipcRenderer.invoke(INVOCATION.GET_PRODUCTS, productIds);

// Returns if product is valid
export const purchaseProduct = (
  product: Electron.Product
): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke(INVOCATION.PURCHASE_PRODUCT, product);

export const restoreCompletedTransactions = (): Promise<HandlerResponse<
  void
>> => ipcRenderer.invoke(INVOCATION.RESTORE_COMPLETED_TRANSACTION);

export const finishTransactionByDate = (
  date: string
): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke(INVOCATION.FINISH_TRANSACTION_BY_DATE, date);

// Image Editor
export const openEditor = (clipId: string): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke(INVOCATION.OPEN_EDITOR, clipId);
