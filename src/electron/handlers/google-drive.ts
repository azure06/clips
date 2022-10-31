import { ipcMain } from 'electron';
import { drive_v3 } from 'googleapis';

import { Clip } from '@/renderer/store/types';
import { INVOCATION } from '@/utils/constants';
import { HttpResult__ } from '@/utils/result';

export const onChangePageToken = (
  func: (
    pageToken?: string
  ) => Promise<HttpResult__<drive_v3.Schema$StartPageToken>>
): void =>
  ipcMain.handle(INVOCATION.CHANGE_PAGE_TOKEN, (event, pageToken) =>
    func(pageToken)
  );

export const onListFiles = (
  func: () => Promise<
    HttpResult__<{ [token: string]: drive_v3.Schema$Change[] }>
  >
): void => ipcMain.handle(INVOCATION.LIST_FILES, func);

export const onRetrieveFile = (
  func: (fileId: string) => Promise<HttpResult__<Clip[]>>
): void =>
  ipcMain.handle(INVOCATION.RETRIEVE_FILE, (_, fileId) => func(fileId));

export const onRemoveFile = (
  func: (fileId: string) => Promise<HttpResult__<void>>
): void => ipcMain.handle(INVOCATION.REMOVE_FILE, (_, fileId) => func(fileId));

export const onUploadToDrive = (
  func: (clips: Clip[]) => Promise<HttpResult__<drive_v3.Schema$File>>
): void =>
  ipcMain.handle(INVOCATION.UPLOAD_TO_DRIVE, (_, clips) => func(clips));
