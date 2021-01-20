import { IDevice } from '@/electron/services/socket.io/types';
import { MessageDoc } from '@/rxdb/message/model';
import { Clip, User } from '@/store/types';
import { ipcRenderer } from 'electron';
import { GaxiosError } from 'gaxios';
import { drive_v3 } from 'googleapis';

/** Drive Response (Retrieve) */
type SchemaChange = { [token: string]: drive_v3.Schema$Change[] };
type AurthError = {
  code: number;
  config: unknown;
  errors: unknown[];
  response: unknown;
};
export type GaxiosErrorEx = { error: GaxiosError | AurthError | unknown };

export const isGaxiosError = (
  response: GaxiosErrorEx | SchemaChange | Clip[]
): response is GaxiosErrorEx => {
  return 'error' in response;
};

/** Drive Response (Upload) */
type Successful<T> = {
  status: number;
  statusText: string;
  data: T;
};
type Unsuccessful<T> = Omit<Successful<T>, 'data'>;

export type DriveResponse<T> = Successful<T> | Unsuccessful<T>;

export const isDriveResponse = <T>(
  response: unknown
): response is DriveResponse<T> => {
  return typeof response === 'object' && !!response && 'status' in response;
};

export const isSuccessful = <T>(
  response: unknown
): response is Successful<T> => {
  return isDriveResponse(response) && 'data' in response;
};

export type DataURI = string;

/**  Clipboard */
export const imagePathToDataURI = (content: string): Promise<DataURI> =>
  ipcRenderer.invoke('to-dataURI', content);

export const removeImage = (path: string): Promise<void> =>
  ipcRenderer.invoke('remove-image', path);

export const removeImageDirectory = (): Promise<void> =>
  ipcRenderer.invoke('remove-image-directory');

export const copyToClipboard = (
  type: 'text' | 'image',
  content: string
): Promise<void> => ipcRenderer.invoke('copy-to-clipboard', type, content);

export const uploadToDrive = <T>(
  clips: Clip[]
): Promise<DriveResponse<T> | unknown> =>
  ipcRenderer.invoke('upload-to-drive', clips);

export const exportJson = (filePath: string, clips: Clip[]): Promise<void> =>
  ipcRenderer.invoke('createBackup', filePath, clips);

export const importJson = (filePath: string): Promise<void> =>
  ipcRenderer.invoke('restoreBackup', filePath);

/**  Authentication */
export const signIn = (): Promise<User | undefined> =>
  ipcRenderer.invoke('sign-in');

export const signOut = (): Promise<void> => ipcRenderer.invoke('sign-out');

/**  Google Drive */
export const changePageToken = (token?: string): Promise<string> =>
  ipcRenderer.invoke('change-page-token', token);

export const listGoogleDriveFiles = (): Promise<SchemaChange | GaxiosErrorEx> =>
  ipcRenderer.invoke('list-files');

export const retrieveFileFromDrive = (
  fileId?: string | null
): Promise<Clip[] | GaxiosErrorEx> =>
  ipcRenderer.invoke('retrieve-file', fileId);

/**  Settings */
export const setShortcut = (shortcut: string): Promise<void> =>
  ipcRenderer.invoke('set-shortcut', shortcut);

export const setStartup = (startup: unknown): Promise<void> =>
  ipcRenderer.invoke('set-startup', startup);

/**  Socket io */
export const handleIoServer = (
  action: 'start' | 'close'
): Promise<IDevice | undefined> => ipcRenderer.invoke('handle-server', action);

export const getMyDevice = (): Promise<IDevice | undefined> =>
  ipcRenderer.invoke('my-device');

export const sendFile = (
  sender: IDevice,
  receiver: IDevice,
  message: MessageDoc
): Promise<void> =>
  ipcRenderer.invoke('send-file', sender, receiver, message) as Promise<void>;

/** In App Purchase */
export const canMakePayments = (): Promise<boolean> =>
  ipcRenderer.invoke('can-make-payments');

export const getReceiptURL = (): Promise<string> =>
  ipcRenderer.invoke('get-receipt-url');

export const getProducts = (
  productIds?: string[]
): Promise<Electron.Product[]> =>
  ipcRenderer.invoke('get-products', productIds);

// Returns if product is valid
export const purchaseProduct = (product: Electron.Product): Promise<boolean> =>
  ipcRenderer.invoke('purchase-product', product);

export const restoreCompletedTransactions = (): Promise<void> =>
  ipcRenderer.invoke('restore-completed-transactions');

export const finishTransactionByDate = (date: string): Promise<void> =>
  ipcRenderer.invoke('finish-transaction-by-date', date);
