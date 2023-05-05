import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';
import { Clip } from '@/rxdb-v2/src/types';
import { INVOCATION } from '@/utils/constants';
import { HttpResult__ } from '@/utils/result';

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
