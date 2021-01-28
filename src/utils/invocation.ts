import { ShortcutFuzzy } from '@/electron/services/shortcuts';
import { IDevice } from '@/electron/services/socket.io/types';
import {
  HandlerHttpResponse,
  HandlerResponse,
} from '@/electron/utils/invocation-handler';
import { MessageDoc } from '@/rxdb/message/model';
import { Clip } from '@/store/types';
import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';

export type DataURI = string;

/**  Clipboard */
export const imagePathToDataURI = (
  content: string
): Promise<HandlerResponse<DataURI>> =>
  ipcRenderer.invoke('to-dataURI', content);

export const removeImage = (path: string): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke('remove-image', path);

export const removeImageDirectory = (): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke('remove-image-directory');

export const copyToClipboard = (
  type: 'text' | 'image',
  content: string
): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke('copy-to-clipboard', type, content);

export const uploadToDrive = <T>(
  clips: T[]
): Promise<HandlerHttpResponse<drive_v3.Schema$File>> =>
  ipcRenderer.invoke('upload-to-drive', clips);

export const createBackup = (
  filePath: string,
  clips: Clip[]
): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke('createBackup', filePath, clips);

export const restoreBackup = (
  filePath: string
): Promise<HandlerResponse<Clip[]>> =>
  ipcRenderer.invoke('restoreBackup', filePath);

/**  Authentication */
export const signIn = (): Promise<HandlerHttpResponse<drive_v3.Schema$About>> =>
  ipcRenderer.invoke('sign-in');

export const signOut = (): Promise<HandlerHttpResponse<{ success: boolean }>> =>
  ipcRenderer.invoke('sign-out');

/**  Google Drive */
export const changePageToken = (
  token?: string
): Promise<HandlerHttpResponse<drive_v3.Schema$StartPageToken>> =>
  ipcRenderer.invoke('change-page-token', token);

export const listGoogleDriveFiles = (): Promise<HandlerHttpResponse<{
  [token: string]: drive_v3.Schema$Change[];
}>> => ipcRenderer.invoke('list-files');

export const retrieveFileFromDrive = (
  fileId?: string | null
): Promise<HandlerHttpResponse<Clip[]>> =>
  ipcRenderer.invoke('retrieve-file', fileId);

/**  Settings */
export const setShortcut = (
  shortcut: string
): Promise<HandlerResponse<ShortcutFuzzy>> =>
  ipcRenderer.invoke('set-shortcut', shortcut);

export const setStartup = (
  startup: unknown
): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke('set-startup', startup);

export const setAlwaysOnTop = (
  alwaysOnTop: boolean
): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke('set-always-on-top', alwaysOnTop);

/**  Socket io */
export const handleIoServer = (
  action: 'start' | 'close'
): Promise<HandlerResponse<IDevice>> =>
  ipcRenderer.invoke('handle-server', action);

export const getMyDevice = (): Promise<HandlerResponse<IDevice>> =>
  ipcRenderer.invoke('my-device');

export const sendFile = (
  sender: IDevice,
  receiver: IDevice,
  message: MessageDoc
): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke('send-file', sender, receiver, message);

/** In App Purchase */
export const canMakePayments = (): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke('can-make-payments');

export const getReceiptURL = (): Promise<HandlerResponse<string>> =>
  ipcRenderer.invoke('get-receipt-url');

export const getProducts = (
  productIds?: string[]
): Promise<HandlerResponse<Electron.Product[]>> =>
  ipcRenderer.invoke('get-products', productIds);

// Returns if product is valid
export const purchaseProduct = (
  product: Electron.Product
): Promise<HandlerResponse<boolean>> =>
  ipcRenderer.invoke('purchase-product', product);

export const restoreCompletedTransactions = (): Promise<HandlerResponse<
  void
>> => ipcRenderer.invoke('restore-completed-transactions');

export const finishTransactionByDate = (
  date: string
): Promise<HandlerResponse<void>> =>
  ipcRenderer.invoke('finish-transaction-by-date', date);
