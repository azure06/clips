import { Clip } from '@/renderer/store/types';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';
import { ipcMain } from 'electron';
import { Data } from '../services/clipboard';

export const onCopyToClipboard = (
  func: (data: Data) => Promise<Result__<void>>
): void =>
  ipcMain.handle(INVOCATION.COPY_TO_CLIPBOARD, (event, data) => func(data));

export const onToDataURI = (
  func: (content: string) => Promise<Result__<string>>
): void =>
  ipcMain.handle(INVOCATION.TO_DATA_URI, (event, content) => {
    return func(content);
  });

export const onRemoveImage = (
  func: (content: string) => Promise<Result__<void>>
): void =>
  ipcMain.handle(INVOCATION.REMOVE_IMAGE, (event, content) => {
    return func(content);
  });

export const onRemoveImageDirectory = (
  func: () => Promise<Result__<void>>
): void => ipcMain.handle(INVOCATION.REMOVE_IMAGE_DIRECTORY, func);

export const onCreateBackup = (
  func: (path: string, clips: Clip[]) => Promise<Result__<void>>
): void =>
  ipcMain.handle(INVOCATION.CREATE_BACKUP, (event, path, clips) =>
    func(path, clips)
  );

export const onRestoreBackup = (
  func: (path: string) => Promise<Result__<Clip[]>>
): void =>
  ipcMain.handle(INVOCATION.RESTORE_BACKUP, (event, path) => func(path));
