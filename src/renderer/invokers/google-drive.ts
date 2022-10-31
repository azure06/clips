import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';
import { INVOCATION } from '@/utils/constants';
import { HttpResult__, Result__ } from '@/utils/result';
import { Clip } from '../store/types';

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
