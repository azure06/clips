import { ipcRenderer } from 'electron';
import { Data } from '@/electron/services/clipboard';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';

export type DataURI = string;

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
