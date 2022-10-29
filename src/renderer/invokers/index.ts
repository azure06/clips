import { ShortcutFuzzy } from '@/electron/services/shortcuts';
import { IDevice } from '@/electron/services/socket.io/types';
import { MessageDoc } from '@/rxdb/message/model';
import { Clip } from '@/renderer/store/types';
import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';
import { Data } from '@/electron/services/clipboard';
import { INVOCATION } from '../../utils/constants';
import { HttpResult__, Result__ } from '../../utils/result';
import {
  Methods,
  MethodsReturnType,
  ParamsAddClip,
  ParamsCountAllDocuments,
  ParamsDumpCollection,
  ParamsFindClips,
  ParamsFindMessage,
  ParamsFindRoomFromUserOrCreate,
  ParamsFindRooms,
  ParamsFindUser,
  ParamsLoadMessages,
  ParamsModifyClip,
  ParamsRemoveClips,
  ParamsRemoveClipsLte,
  ParamsRestoreFactoryDefault,
  ParamsSetMessageToRead,
  ParamsUpsertMessage,
  ParamsUpsertUser,
  ReturnAddClip,
  ReturnCountAllDocuments,
  ReturnDumpCollection,
  ReturnFindClips,
  ReturnFindMessage,
  ReturnFindRoomFromUserOrCreate,
  ReturnFindRooms,
  ReturnFindUser,
  ReturnLoadMessages,
  ReturnModifyClip,
  ReturnRemoveClips,
  ReturnRemoveClipsLte,
  ReturnRestoreFactoryDefault,
  ReturnSetMessageToRead,
  ReturnUpsertMessage,
  ReturnUpsertUser,
} from '@/utils/methods';
import * as methods from '@/utils/methods';
import { RxDBAdapterNm } from '@/rxdb';
import { Observable, lastValueFrom } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export type DataURI = string;

/**  Clipboard */
export const imagePathToDataURI = (
  content: string
): Promise<Result__<DataURI>> =>
  ipcRenderer.invoke(INVOCATION.TO_DATA_URI, content);

export const removeImage = (path: string): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.REMOVE_IMAGE, path);

export const removeImageDirectory = (): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.REMOVE_IMAGE_DIRECTORY);

export const copyToClipboard = (data: Data): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.COPY_TO_CLIPBOARD, data);

export const uploadToDrive = <T>(
  clips: T[]
): Promise<HttpResult__<drive_v3.Schema$File>> =>
  ipcRenderer.invoke(INVOCATION.UPLOAD_TO_DRIVE, clips);

export const createBackup = (
  filePath: string,
  clips: Clip[]
): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.CREATE_BACKUP, filePath, clips);

export const restoreBackup = (filePath: string): Promise<Result__<Clip[]>> =>
  ipcRenderer.invoke(INVOCATION.RESTORE_BACKUP, filePath);

/**  Authentication */
export const signIn = (): Promise<HttpResult__<drive_v3.Schema$About>> =>
  ipcRenderer.invoke(INVOCATION.SIGN_IN);

export const signOut = (): Promise<HttpResult__<{ success: boolean }>> =>
  ipcRenderer.invoke(INVOCATION.SIGN_OUT);

/**  Google Drive */
export const changePageToken = (
  token?: string
): Promise<HttpResult__<drive_v3.Schema$StartPageToken>> =>
  ipcRenderer.invoke(INVOCATION.CHANGE_PAGE_TOKEN, token);

export const listGoogleDriveFiles = (): Promise<
  HttpResult__<{
    [token: string]: drive_v3.Schema$Change[];
  }>
> => ipcRenderer.invoke(INVOCATION.LIST_FILES);

export const retrieveFileFromDrive = (
  fileId?: string | null
): Promise<HttpResult__<Clip[]>> =>
  ipcRenderer.invoke(INVOCATION.RETRIEVE_FILE, fileId);

export const removeFile = (fileId: string): Promise<HttpResult__<void>> =>
  ipcRenderer.invoke(INVOCATION.REMOVE_FILE, fileId);

/**  Settings */
export const setShortcut = (
  shortcut: string
): Promise<Result__<ShortcutFuzzy>> =>
  ipcRenderer.invoke(INVOCATION.SET_SHORTCUT, shortcut);

export const setStartup = (startup: unknown): Promise<Result__<boolean>> =>
  ipcRenderer.invoke(INVOCATION.SET_STARTUP, startup);

/**  Socket io */
export const handleIoServer = (
  action: 'start' | 'close'
): Promise<Result__<IDevice>> =>
  ipcRenderer.invoke(INVOCATION.HANDLE_SERVER, action);

export const getMyDevice = (): Promise<Result__<IDevice>> =>
  ipcRenderer.invoke(INVOCATION.MY_DEVICE);

export const sendFile = (
  sender: IDevice,
  receiver: IDevice,
  message: MessageDoc
): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.SEND_FILE, sender, receiver, message);

/** In App Purchase */
export const canMakePayments = (): Promise<Result__<boolean>> =>
  ipcRenderer.invoke(INVOCATION.CAN_MAKE_PAYMENTS);

export const getReceiptURL = (): Promise<Result__<string>> =>
  ipcRenderer.invoke(INVOCATION.GET_RECEIPT_URL);

export const getProducts = (
  productIds?: string[]
): Promise<Result__<Electron.Product[]>> =>
  ipcRenderer.invoke(INVOCATION.GET_PRODUCTS, productIds);

// Returns if product is valid
export const purchaseProduct = (
  product: Electron.Product
): Promise<Result__<boolean>> =>
  ipcRenderer.invoke(INVOCATION.PURCHASE_PRODUCT, product);

export const restoreCompletedTransactions = (): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.RESTORE_COMPLETED_TRANSACTION);

export const finishTransactionByDate = (
  date: string
): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.FINISH_TRANSACTION_BY_DATE, date);

// Image Edit:
export const openEditor = (clipId: string): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.OPEN_EDITOR, clipId);

// Relaunch App
export const relaunchApp = (): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.RELAUNCH_APP);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function switchdb(
  adapterObserver: Observable<RxDBAdapterNm>
): <T extends Methods>(
  methodNm: T,
  ...args: T extends 'findClips'
    ? ParamsFindClips
    : T extends 'addClip'
    ? ParamsAddClip
    : T extends 'modifyClip'
    ? ParamsModifyClip
    : T extends 'removeClips'
    ? ParamsRemoveClips
    : T extends 'removeClipsLte'
    ? ParamsRemoveClipsLte
    : T extends 'restoreFactoryDefault'
    ? ParamsRestoreFactoryDefault
    : T extends 'dumpCollection'
    ? ParamsDumpCollection
    : T extends 'countAllDocuments'
    ? ParamsCountAllDocuments
    : T extends 'findUser'
    ? ParamsFindUser
    : T extends 'upsertUser'
    ? ParamsUpsertUser
    : T extends 'findRooms'
    ? ParamsFindRooms
    : T extends 'findRoomFromUserOrCreate'
    ? ParamsFindRoomFromUserOrCreate
    : T extends 'loadMessages'
    ? ParamsLoadMessages
    : T extends 'findMessage'
    ? ParamsFindMessage
    : T extends 'upsertMessage'
    ? ParamsUpsertMessage
    : T extends 'setMessageToRead'
    ? ParamsSetMessageToRead
    : never
) => T extends 'findClips'
  ? ReturnFindClips
  : T extends 'addClip'
  ? ReturnAddClip
  : T extends 'modifyClip'
  ? ReturnModifyClip
  : T extends 'removeClips'
  ? ReturnRemoveClips
  : T extends 'removeClipsLte'
  ? ReturnRemoveClipsLte
  : T extends 'restoreFactoryDefault'
  ? ReturnRestoreFactoryDefault
  : T extends 'dumpCollection'
  ? ReturnDumpCollection
  : T extends 'countAllDocuments'
  ? ReturnCountAllDocuments
  : T extends 'findUser'
  ? ReturnFindUser
  : T extends 'upsertUser'
  ? ReturnUpsertUser
  : T extends 'findRooms'
  ? ReturnFindRooms
  : T extends 'findRoomFromUserOrCreate'
  ? ReturnFindRoomFromUserOrCreate
  : T extends 'loadMessages'
  ? ReturnLoadMessages
  : T extends 'findMessage'
  ? ReturnFindMessage
  : T extends 'upsertMessage'
  ? ReturnUpsertMessage
  : T extends 'setMessageToRead'
  ? ReturnSetMessageToRead
  : never;
export function switchdb(
  adapterObserver: Observable<RxDBAdapterNm>
): <T extends Methods>(methodNm: T, ...args: never[]) => MethodsReturnType {
  return <T extends Methods>(methodNm: T, ...args: never[]) => {
    const obs = adapterObserver.pipe(
      concatMap((adapter) =>
        adapter === 'idb'
          ? methods[methodNm](...args)
          : ipcRenderer.invoke(INVOCATION.NODE_DB, methodNm, args)
      )
    );
    return lastValueFrom(obs);
  };
}
