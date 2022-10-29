import { Result__ } from '@/utils/result';
import {
  OpenDialogOptions,
  Rectangle,
  SaveDialogOptions,
  ipcRenderer,
} from 'electron';
import ua from 'universal-analytics';
import { INVOCATION } from './../../utils/constants';

export type ActionGetCurrentWindow =
  | 'isVisible'
  | 'isMaximized'
  | 'maximize'
  | 'minimize'
  | 'unmaximize'
  | 'hide'
  | 'close'
  | 'getBounds'
  | 'setAlwaysOnTop'
  | 'setSkipTaskbar';

// prettier-ignore
export function getCurrentWindow<T1 extends 'setAlwaysOnTop' | 'setSkipTaskbar'>(action: T1, payload: boolean): Promise<Result__<void>>;
// prettier-ignore
export function getCurrentWindow<T1 extends 'maximize' | 'minimize' | 'unmaximize' | 'hide' | 'close' >(action: T1): Promise<Result__<void>>;
// prettier-ignore
export function getCurrentWindow<T1 extends 'isVisible' | 'isMaximized'>(action: T1): Promise<Result__<boolean>>;
// prettier-ignore
export function getCurrentWindow<T1 extends 'getBounds'>(action: T1): Promise<Result__<Rectangle>>;
// prettier-ignore
export async function getCurrentWindow<T1 extends ActionGetCurrentWindow, T2>(action: T1, payload?: T2) {
  const result = await ipcRenderer.invoke(
    INVOCATION.REMOTE.GET_CURRENT_WINDOW,
    action,
    payload
  );
  // TODO REMOVE LOG
  console.log(action, result);
  return result;
}

export type ActionDialog = 'showSaveDialog' | 'showOpenDialog';

export function dialog<
  T1 extends 'showSaveDialog',
  T2 extends SaveDialogOptions
>(action: T1, paylaod: T2): Promise<Electron.SaveDialogReturnValue>;
export function dialog<
  T1 extends 'showOpenDialog',
  T2 extends OpenDialogOptions
>(action: T1, paylaod: T2): Promise<Electron.OpenDialogReturnValue>;
export function dialog<
  T1 extends ActionDialog,
  T2 extends OpenDialogOptions | SaveDialogOptions
>(action: T1, paylaod: T2) {
  return ipcRenderer.invoke(INVOCATION.REMOTE.DIALOG, action, paylaod);
}
